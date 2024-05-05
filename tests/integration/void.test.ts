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

describe('Can void a payment', () => {
  const customOrderId = randomUUID();
  let azulOrderId: string | undefined = undefined;

  beforeAll(async () => {
    const payment = await azul.payments.sale({
      cardNumber: '6011000990099818',
      expiration: '202412',
      customOrderId,
      CVC: '818',
      amount: 100,
      ITBIS: 10
    });

    expect(payment).toBeDefined();
    expect(payment.IsoCode).toBe('00');
    expect(payment.AzulOrderId).toBeDefined();
    expect(payment.AzulOrderId).not.toBe('');
    azulOrderId = payment.AzulOrderId;
  }, 10000);

  it('After the payment, the TransactionType should be "Sale"', async () => {
    const verifyPayment = await azul.verifyPayment(customOrderId);
    expect(verifyPayment).toBeDefined();
    expect(verifyPayment.Found).toBe(true);
    expect(verifyPayment.CustomOrderId).toBe(customOrderId);
    expect(verifyPayment.TransactionType).toBe('Sale');
  }, 10000);

  it("After voiding the payment, the TransactionType should be 'Void'", async () => {
    const voidResponse = await azul.void(azulOrderId!);
    expect(voidResponse).toBeDefined();
    expect(voidResponse.IsoCode).toBe('00');

    const verifyPayment = await azul.verifyPayment(customOrderId);
    expect(verifyPayment).toBeDefined();
    expect(verifyPayment.Found).toBe(true);
    expect(verifyPayment.CustomOrderId).toBe(customOrderId);
    expect(verifyPayment.TransactionType).toBe('Void');
  }, 10000);
});
