import express from 'express';

import { env } from '../src/tests/instance';
import { AzulSecure } from '../src/secure/secure';
import 'dotenv/config';

const app = express();
app.use(express.urlencoded({ extended: true }));

const CARDS = [
  {
    value: '4149011500000519',
    label: '3D Secure Method con desafío'
  },
  {
    value: '4265880000000007',
    label: 'Sin fricción con 3DSMethod'
  },
  {
    value: '4147463011110117',
    label: 'Sin fricción sin 3DSMethod'
  },
  {
    value: '4005520000000129',
    label: 'Desafío con 3DSMethod'
  },
  {
    value: '4147463011110059',
    label: 'Desafío sin 3DSMethod'
  },
  {
    value: '4149011500000527',
    label: 'Desafío'
  }
];

const azul = new AzulSecure({
  auth1: env.AUTH1,
  auth2: env.AUTH2,
  merchantId: env.MERCHANT_ID,
  certificate: env.AZUL_CERT,
  key: env.AZUL_KEY,
  processMethodBaseUrl: 'http://localhost:3000/process-method',
  processChallengeBaseUrl: 'http://localhost:3000/process-challenge'
});

app.get('/', (req, res) => {
  res.send(
    `
    <h1>3DS Example</h1>
    <h2>Choose a card</h2>
    ${CARDS.map(
      (card) => `<a href="/buy?cardNumber=${card.value}"><button>${card.label}</button></a>`
    ).join('<br><br>')}
    `
  );
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
    res.send(result.form);
  }

  if (result.type === 'method') {
    res.send(result.form);
  }

  if (result.type === 'error') {
    res.status(500).send(`Payment failed: ${result.error}`);
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
    res.send(result.form);
  }

  if (result.type === 'error') {
    res.status(500).send(`Payment failed: ${result.error}`);
  }
});

app.listen(3000);
