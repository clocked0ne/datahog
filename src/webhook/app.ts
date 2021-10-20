import express from 'express';
import inputSchema from './webhookInputSchema.json';
import validateJsonSchema from './validation';

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

  return res.status(200).json({ processing: req.body.provider });
});

export default app;
