const WEBHOOK_PORT = 3210;

import app from './app';
import pino from 'pino';

const logger = pino();

app.listen(WEBHOOK_PORT, () => logger.info(`Webhook server listening at http://localhost:${WEBHOOK_PORT}`));
