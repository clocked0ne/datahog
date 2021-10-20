
const WEBHOOK_PORT = 3210;
const EVERY_MINUTE = '* * * * *';

import app from './app';
import pino from 'pino';
import cron from 'node-cron';
import processRequestsCronTask from './crontask';
import { disconnect } from './datastore';


const logger = pino();

// Schedule processing task to be run on the server (every minute for dev)
cron.schedule(process.env.CRON_SCHEDULE || EVERY_MINUTE, processRequestsCronTask);
// task.stop();
app.listen(WEBHOOK_PORT, () => logger.info(`Webhook server listening at http://localhost:${WEBHOOK_PORT}`));

const quit = async (signal: any) => {
  await disconnect();
  process.exit()
}
process.on('SIGINT', quit)
process.on('SIGTERM', quit)