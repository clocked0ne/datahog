// @ts-ignore
import RedisMock from 'ioredis-mock/jest';
import Chance from 'chance';
import { Datastore } from '../../src/webhook/datastore';
const chance = Chance();
const PROVIDERS = ['gas', 'internet'];

jest.mock('ioredis', () => RedisMock);

describe('Storing requests to process', () => {
  describe('when fetching all request entry keys', () => {
    const uuid1 = chance.guid();
    const uuid2 = chance.guid();
    const requestEntry1 = { providers: chance.pickset(PROVIDERS), callbackUrl: chance.url() };
    const requestEntry2 = { providers: chance.pickset(PROVIDERS), callbackUrl: chance.url() };

    beforeAll(async () => Promise.all([
      Datastore.saveRequestEntry(uuid1, requestEntry1),
      Datastore.saveRequestEntry(uuid2, requestEntry2)
    ]));

    it('returns all of the keys in the response', async () => {
      const response = await Datastore.getAllRequestEntryKeys();

      expect(response).toEqual([uuid1, uuid2]);
    });
  });

  describe('when saving request entries', () => {
    it('returns a success response', async () => {
      const uuid = chance.guid();
      const requestEntry = {
        providers: chance.pickset(PROVIDERS),
        callbackUrl: chance.url()
      };
      const response = await Datastore.saveRequestEntry(uuid, requestEntry);

      expect(response).toEqual('OK');
    });
  });

  describe('when fetching request entries', () => {
    const uuid = chance.guid();
    const requestEntry = {
      providers: chance.pickset(PROVIDERS),
      callbackUrl: chance.url()
    };

    beforeAll(async () => {
      await Datastore.saveRequestEntry(uuid, requestEntry);
    });

    it('returns a success response', async () => {
      const response = await Datastore.getRequestEntry(uuid);

      expect(response).toEqual(requestEntry);
    });
  });

  describe('when deleting request entries', () => {
    const uuid = chance.guid();
    const requestEntry = {
      providers: chance.pickset(PROVIDERS),
      callbackUrl: chance.url()
    };

    beforeAll(async () => {
      await Datastore.saveRequestEntry(uuid, requestEntry);
    });

    it('returns a success response', async () => {
      const response = await Datastore.deleteRequestEntry(uuid);

      expect(response).toEqual(1);
    });
  });
});
