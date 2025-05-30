import express from 'express';

import { env } from '../src/tests/instance';
import { AzulSecure } from '../src/secure/secure';

import 'dotenv/config';

import { MemoryStorage } from '../src/utils/storage';

const app = express();
app.use(express.urlencoded({ extended: true }));

const CARDS = [
  {
    label: 'NO_CHALLENGE_3DS_METHOD',
    card: '4761120010000492'
  },
  {
    label: 'NO_CHALLENGE_NO_3DS_METHOD',
    card: '4147463011110117'
  },
  {
    label: 'CHALLENGE_3DS_METHOD',
    card: '4005520000000129'
  },
  {
    label: 'CHALLENGE_NO_3DS_METHOD',
    card: '4147463011110059'
  }
];

const azul = new AzulSecure({
  storage: new MemoryStorage(),
  channel: 'EC',
  environment: 'development',
  auth1: env.AUTH1_3DS,
  auth2: env.AUTH1_3DS,
  merchantId: env.MERCHANT_ID,
  certificate: env.AZUL_CERT,
  key: env.AZUL_KEY,
  processMethodURL: 'http://localhost:3000/process-method',
  processChallengeURL: 'http://localhost:3000/process-challenge'
});

app.get('/', (req, res) => {
  let page = `
  <h1>3DS Example</h1>
  <h2>Choose a card</h2>
  `;

  for (const { label, card } of CARDS) {
    page += `<a href="/buy?cardNumber=${card}" id=${label}>${label}</a>`;
    page += '<br></br>';
  }

  res.send(page);
});

app.get('/buy', async (req, res) => {
  const cardNumber = req.query.cardNumber;

  if (typeof cardNumber !== 'string') {
    return res.status(400).send('Invalid card number');
  }

  const result = await azul.secureSale({
    type: 'card',
    cardNumber,
    CVC: '818',
    customOrderId: '1234',
    amount: 1000,
    ITBIS: 100,
    expiration: '202512'
  });

  if (result.type === 'success') {
    res.send('Payment successful');
  }

  if (result.type === 'challenge') {
    const form = azul.generateChallengeForm({
      response: result,
      secureId: result.AzulOrderId
    });
    res.send(form);
  }

  if (result.type === 'method') {
    const form = azul.generateMethodForm(result);
    res.send(form);
  }

  if (result.type === 'error') {
    res.status(500).send(`Payment failed: ${result.ErrorDescription}`);
  }
});

app.post('/process-challenge', async (req, res) => {
  const { secureId } = req.query;
  const { cres } = req.body;

  if (typeof secureId !== 'string' || typeof cres !== 'string') {
    return res.status(400).send('Invalid ID');
  }

  const result = await azul.processChallenge({
    secureId,
    CRes: cres
  });

  if (result.type === 'success') {
    res.send('Payment successful');
  }

  if (result.type === 'error') {
    res.status(500).send(`Payment failed: ${result.ErrorDescription}`);
  }
});

app.post('/process-method', async (req, res) => {
  const { secureId } = req.query;

  if (typeof secureId !== 'string') {
    return res.status(400).send('Invalid ID');
  }

  const result = await azul.processMethod({ secureId });

  if (result.type === 'success') {
    res.send('Payment successful');
  }

  if (result.type === 'challenge') {
    const form = azul.generateChallengeForm({
      response: result,
      secureId
    });
    res.send(form);
  }

  if (result.type === 'error') {
    res.status(500).send(`Payment failed: ${result.ErrorDescription}`);
  }
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
