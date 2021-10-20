import pino from 'pino';
import { getProviderData, postCallback } from './http';
import { Datastore } from './datastore';
import type { ProviderBilling } from '../../types/callback';

const logger = pino();

const processRequestsCronTask = async () => {
  logger.info('Running data collection task');
  const keys = await Datastore.getAllRequestEntryKeys();

  logger.debug(`Fetched ${keys.length} requests to process`);

  for (const [i, uuid] of keys.entries()) {
    const savedData = await Datastore.getRequestEntry(uuid);

    for (const provider of savedData.providers) {
      if (!savedData[provider] || typeof savedData[provider] === 'object' && Object.keys(savedData[provider]).length === 0) {
        const response = await getProviderData({ uuid, provider })
        if (response.length) {
          savedData[provider] = response;
          await Datastore.saveRequestEntry(uuid, savedData);
        }
      }
    }

    if (savedData.providers.every((provider: string) => typeof savedData[provider] === 'object')) {
      try {
        const callbackRequest = {
          uuid,
          url: savedData.callbackUrl,
          data: savedData.providers.map((data: ProviderBilling) => {
            return { provider: data.provider, billing: data.billing }
          })
        };
        await postCallback(callbackRequest);
        await Datastore.deleteRequestEntry(uuid)
        logger.debug(`Finished processing request ${uuid}`);
      }
      catch(e) {
        logger.debug(`Callback failed for ${uuid} and will be re-attempted`);
      }
    }
  }
}

export default processRequestsCronTask;