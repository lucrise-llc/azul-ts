import { randomUUID } from 'crypto';
import AzulAPI from '../azul-api/api';
import 'dotenv/config';

const azul = new AzulAPI({
  auth1: process.env.AUTH1!,
  auth2: process.env.AUTH2!,
  merchantId: process.env.MERCHANT_ID!,
  certificatePath: process.env.CERTIFICATE_PATH!,
  keyPath: process.env.KEY_PATH!
});

test('Can make a payment', async () => {
  const result = await azul.payments.sale({
    cardNumber: '6011000990099818',
    expiration: '202412',
    CVC: '818',
    customOrderId: '1234',
    amount: 1000,
    ITBIS: 100
  });

  expect(result).toBeDefined();
  expect(result.IsoCode).toBe('00');
});

test('Can verify a payment', async () => {
  const customOrderId = randomUUID();

  const payment = await azul.payments.sale({
    cardNumber: '6011000990099818',
    expiration: '202412',
    CVC: '818',
    customOrderId,
    amount: 1000,
    ITBIS: 100
  });

  expect(payment).toBeDefined();
  expect(payment.IsoCode).toBe('00');

  const result = await azul.verifyPayment(customOrderId);

  expect(result).toBeDefined();
  expect(result.Found).toBe(true);
});
