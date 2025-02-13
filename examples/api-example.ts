import express from 'express';
import AzulAPI from '../src/api';
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
  const result = await azul.payments.sale({
    cardNumber: '6011000990099818',
    expiration: '202412',
    CVC: '818',
    customOrderId: '1234',
    amount: 1000,
    ITBIS: 100
  });

  res.send(result);
});

app.listen(3000);
