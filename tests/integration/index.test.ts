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

test('Can make a payment', async () => {
  const result = await azul.payments.sale({
    cardNumber: '6011000990099818',
    expiration: '202412',
    CVC: '818',
    customOrderId: '1234',
    amount: 100,
    ITBIS: 10
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
    amount: 100,
    ITBIS: 10,
    customOrderId
  });

  expect(payment).toBeDefined();
  expect(payment.IsoCode).toBe('00');

  const result = await azul.verifyPayment(customOrderId);

  expect(result).toBeDefined();
  expect(result.Found).toBe(true);
  expect(result.CustomOrderId).toBe(customOrderId);
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
  });

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
