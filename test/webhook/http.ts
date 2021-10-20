import nock from 'nock';
import { getProviderData, postCallback } from '../../src/webhook/http';
import Chance from 'chance';
import type { Bill } from '../../types/bill';

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

describe('Making http requests to the provider API endpoints', () => {
  afterAll(nock.restore);
  afterEach(nock.cleanAll);

  describe('When the provider returns a successful response', () => {
    test('It should return an array of billing data', async () => {
      const provider = chance.pickone(PROVIDERS);
      const billingData = createBillingData();
      nock(API_ENDPOINT)
        .get(`/providers/${provider}`)
        .reply(200, billingData, { 'Content-Type': 'application/json' });

      const response = await getProviderData({ uuid: chance.guid(), provider })
      expect(response).toEqual(billingData);
    });
  });

  describe('When the provider continually responds with an error', () => {
    test('It should return an empty array', async () => {
      const provider = chance.pickone(PROVIDERS);
      const scope = nock(API_ENDPOINT)
        .get(`/providers/${provider}`)
        .reply(500, '#fail')
        .persist();

      const response = await getProviderData({ uuid: chance.guid(), provider })
      expect(response).toEqual([]);
      scope.persist(false);
    });
  });
});

describe('Making http requests to the provided callback URL', () => {
  afterAll(nock.restore);
  afterEach(nock.cleanAll);

  describe('When sending data to the callback URL succeeds', () => {
    test('It should return a successful response', async () => {
      nock(CALLBACK_URL)
        .post('/')
        .reply(200);

      const request = {
        uuid: chance.guid(),
        data: [
          { provider: PROVIDERS[0], billing: createBillingData() },
          { provider: PROVIDERS[1], billing: createBillingData() },
        ],
        url: CALLBACK_URL
      }
      const response = await postCallback(request)
      expect(response).not.toBeNull();
    });
  });

  describe('When the callback URL continually responds with an error', () => {
    test('It should throw an error', () => {
      const scope = nock(CALLBACK_URL)
        .post('/')
        .reply(500, 'Internal Server Error')
        .persist();

      const request = {
        uuid: chance.guid(),
        data: [
          { provider: PROVIDERS[0], billing: createBillingData() },
          { provider: PROVIDERS[1], billing: createBillingData() },
        ],
        url: CALLBACK_URL
      }
      expect(() => postCallback(request)).rejects.toThrowError();
      scope.persist(false);
    });
  });
});
