import request from 'supertest';
import app from '../../src/webhook/app';

describe('Sending requests to the webhook endpoint', () => {
  describe('When sending an invalid JSON payload with malformed callbackUrl', () => {
    test('It should return a 500 Internal Server Error response', async () => {
      const response = await request(app)
        .post('/webhook')
        .set('Accept', 'application/json')
        .send({
          "provider": [
            "gas",
            "internet"
          ],
          "callbackUrl": "invalidUrl"
        });
      expect(response.statusCode).toBe(500);
    });
  });

  describe('When sending a valid JSON payload with no providers', () => {
    test('It should return a 200 OK response showing that no providers are being processed', async () => {
      const response = await request(app)
        .post('/webhook')
        .set('Accept', 'application/json')
        .send({
          "provider": [],
          "callbackUrl": "http://someUrl.com/api/"
        });
      expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
          processing: []
       });
    });
  });

  describe('When sending a valid JSON payload', () => {
    test('It should return a 200 OK response containing the providers being processed', async () => {
      const response = await request(app)
        .post('/webhook')
        .set('Accept', 'application/json')
        .send({
          provider: [
            "gas",
            "internet"
          ],
          "callbackUrl": "http://someUrl.com/api/"
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        processing: [
          "gas",
          "internet"
        ]
      });
    });
  });
});
