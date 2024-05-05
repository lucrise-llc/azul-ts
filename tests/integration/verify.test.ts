import { randomUUID } from 'crypto';
import AzulAPI from '../../src/azul-api/api';
import 'dotenv/config';

const azul = new AzulAPI({
  auth1: process.env.AUTH1!,
  auth2: process.env.AUTH2!,
  merchantId: process.env.MERCHANT_ID!,
  certificatePath: process.env.CERTIFICATE_PATH!,
  keyPath: process.env.KEY_PATH!
});

describe('Can verify a payment', () => {
  const customOrderId = randomUUID();

  beforeAll(async () => {
    const payment = await azul.payments.sale({
      cardNumber: '6011000990099818',
      expiration: '202412',
      CVC: '818',
      amount: 100,
      ITBIS: 10,
      customOrderId
    });

    expect(payment).toBeDefined();
    expect(payment.IsoCode).toBe('00');
  }, 10000);

  it('After the payment, the TransactionType should be "Sale"', async () => {
    const result = await azul.verifyPayment(customOrderId);

    expect(result).toBeDefined();
    expect(result.Found).toBe(true);
    expect(result.CustomOrderId).toBe(customOrderId);
    expect(result.TransactionType).toBe('Sale');
  }, 10000);
});
