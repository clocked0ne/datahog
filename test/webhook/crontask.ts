// @ts-ignore
import RedisMock from 'ioredis-mock/jest';
import processRequestsCronTask from '../../src/webhook/crontask';
jest.mock('ioredis', () => RedisMock);
import { Datastore } from '../../src/webhook/datastore';
import nock from 'nock';
import Chance from 'chance';
import { Bill } from '../../types/bill';
const chance = Chance();

const API_ENDPOINT = 'http://localhost:3000/';
const CALLBACK_URL = 'https://clientcallback.com/';
const PROVIDERS = ['gas', 'internet'];

const createBillingData = (): Bill[] => {
  return [
    {
      amount: chance.integer(),
      billedOn: chance.date().toISOString(),
    },
    {
      amount: chance.integer(),
      billedOn: chance.date().toISOString(),
    }
  ]
};
describe('Executing the process requests cron task', () => {
  describe('When there are no saved requests to process', () => {
    beforeAll(() => {
      jest.spyOn(Datastore, 'getAllRequestEntryKeys' as any).mockImplementation(() => Promise.resolve([]));
    });

    it('Does not take any action', async () => {
      await processRequestsCronTask();
      expect(Datastore.getAllRequestEntryKeys).toHaveBeenCalled();
    });
  });

  describe('When there is a saved request to process', () => {
    afterAll(nock.restore);
    afterEach(nock.cleanAll);

    describe('and the provider is responding successfully', () => {
      beforeAll(() => {
        const uuid = chance.guid();
        const provider = chance.pickone(PROVIDERS);
        jest.spyOn(Datastore, 'getAllRequestEntryKeys' as any).mockImplementation(() => Promise.resolve([
          uuid
        ]));
        jest.spyOn(Datastore, 'getRequestEntry' as any).mockImplementation(() => Promise.resolve({
          providers: [provider],
          callbackUrl: CALLBACK_URL
        }));
        jest.spyOn(Datastore, 'saveRequestEntry' as any).mockImplementation(() => Promise.resolve('OK'));
        jest.spyOn(Datastore, 'deleteRequestEntry' as any).mockImplementation(() => Promise.resolve(1));

        const billingData = createBillingData();
        nock(API_ENDPOINT)
          .get(`/providers/${provider}`)
          .reply(200, billingData, { 'Content-Type': 'application/json' });
        nock(CALLBACK_URL)
          .post('/')
          .reply(200);
      });

      it('The data is fetched from the provider and sent', async () => {
        await processRequestsCronTask();
        expect(Datastore.getAllRequestEntryKeys).toHaveBeenCalled();
        expect(Datastore.saveRequestEntry).toHaveBeenCalled();
        expect(Datastore.deleteRequestEntry).toHaveBeenCalled();
      });
    });
  });
});
