const API_BASE_URL = 'http://localhost:3000/providers';

import got from 'got';
import pino from 'pino';
import type { Bill } from '../../types/bill';
import type { ProviderRequestData } from '../../types/provider';
import type { CallbackRequestData } from '../../types/callback';
const logger = pino();

export const getProviderData = async (request: ProviderRequestData): Promise<Bill[] | []> => {
  try {
    // By default got will retry requests at least once on error
    const response = await got.get(`${API_BASE_URL}/${request.provider}`, {
      timeout: 5000
    }).json() as Bill[] | [];

    logger.info({
      msg: `Fetched ${request.provider} provider data`,
      billingData: response,
      uuid: request.uuid
    });

    return response;
  }
  catch (error: any) {
    logger.info({
      url: `${API_BASE_URL}/${request.provider}`,
      msg: `${request.provider} provider unavailable`,
      uuid: request.uuid
    });

    return [];
  }
};

export const postCallback = async (request: CallbackRequestData): Promise<any> => {
  try {
    const response = await got.post(request.url, {
      timeout: 5000,
      json: request.data
    });

    logger.info({
      msg: `Sent requested provider data`,
      data: request.data,
      uuid: request.uuid
    });

    return response;
  }
  catch (error: any) {
    logger.info({
      msg: `${request.url} callback URL unreachable`,
      uuid: request.uuid
    });

    throw new Error('Callback URL unreachable')
  }
};
