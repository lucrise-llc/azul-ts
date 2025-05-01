import express from 'express';

import { Azul } from '../src/api';
import { env } from '../src/tests/instance';

import 'dotenv/config';

import { undiciFetcher } from './undici-fetcher';
const app = express();

const azul = new Azul({
  auth1: env.AUTH1,
  auth2: env.AUTH2,
  merchantId: env.MERCHANT_ID,
  fetch: undiciFetcher({
    cert: env.AZUL_CERT,
    key: env.AZUL_KEY
  })
});

app.get('/buy', async (req, res) => {
  const result = await azul.sale({
    type: 'card',
    cardNumber: '6011000990099818',
    expiration: '202412',
    CVC: '818',
    amount: 1000,
    ITBIS: 100
  });

  if (result.type === 'success') {
    res.send('Success');
  }

  if (result.type === 'error') {
    res.status(500).send(`Payment failed: ${result.ErrorDescription}`);
  }
});

app.listen(3000);
