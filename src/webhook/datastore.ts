import Redis from 'ioredis';
import IORedis from 'ioredis';
import pino from 'pino';

const logger = pino();

const connection = {
  port:  parseInt(`${process.env.REDIS_PORT || 6379}`, 10),
  host: `${process.env.REDIS_HOST || '127.0.0.1'}`
};

const redis = new Redis(connection);

export const disconnect = () => redis.disconnect();

export class Datastore {
  static saveRequestEntry = (uuid: string, data: any): Promise<IORedis.Ok | null> => {
    logger.debug({
      msg: `Saving request data`,
      data,
      uuid
    });
    return redis.set(uuid, JSON.stringify(data));
  }

  static getRequestEntry = async (uuid: string): Promise<any> => {
    const entry: string | null = await redis.get(uuid);

    if (entry) {
      return JSON.parse(entry);
    }
    else {
      return null;
    }
  }

  static deleteRequestEntry = async (uuid: string): Promise<number> => {
    return redis.del(uuid);
  }

  static getAllRequestEntryKeys = async (): Promise<string[]> => {
    return await redis.keys('*');
  }
}
