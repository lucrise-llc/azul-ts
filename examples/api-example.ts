import express from 'express';
import AzulAPI from '../src/azul-api/api';
import { TEST_CARDS } from '../tests/fixtures/cards';
import { generateOrderNumber } from '../tests/fixtures/order';
import 'dotenv/config';

const app = express();

const azul = new AzulAPI({
  auth1: process.env.AUTH1!,
  auth2: process.env.AUTH2!,
  merchantId: process.env.MERCHANT_ID!,
  certificate: process.env.AZUL_CERT!,
  key: process.env.AZUL_KEY!
});

app.get('/buy-ticket', async (req, res) => {
  const card = TEST_CARDS.VISA_1;

  const result = await azul.payments.sale({
    cardNumber: card.number,
    expiration: card.expiration,
    CVC: card.cvv,
    customOrderId: generateOrderNumber(),
    amount: 1000,
    ITBIS: 100
  });

  res.send(result);
});

app.listen(3000);
