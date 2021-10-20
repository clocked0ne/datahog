import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import inputSchema from './webhookInputSchema.json';
import validateJsonSchema from './validation';
import { Datastore } from './datastore';
import pino from 'pino';

const logger = pino();
const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
  const { isValid, validationErrors } = validateJsonSchema(req.body, inputSchema);

  if (!isValid) {
    return res.status(500).json({
      error: 'Validation error',
      validationErrors
    })
  }
  const uuid = uuidv4();

  await Datastore.saveRequestEntry(uuid, {
    providers: req.body.provider,
    callbackUrl: req.body.callbackUrl
  });
  logger.info({ msg: `Saved request ${uuid} to process` });

  return res.status(200).json({ processing: req.body.provider });
});

export default app;
