import { randomUUID } from 'crypto';
import AzulAPI from '../../src/azul-api/api';
import 'dotenv/config';
import { describe } from 'node:test';

const azul = new AzulAPI({
  auth1: process.env.AUTH1!,
  auth2: process.env.AUTH2!,
  merchantId: process.env.MERCHANT_ID!,
  certificatePath: process.env.CERTIFICATE_PATH!,
  keyPath: process.env.KEY_PATH!
});

describe('Can hold a payment', () => {
  const customOrderId = randomUUID();
  let azulOrderId: string;

  beforeAll(async () => {
    const result = await azul.payments.hold({
      cardNumber: '6011000990099818',
      expiration: '202412',
      CVC: '818',
      customOrderId,
      amount: 100,
      ITBIS: 10
    });

    expect(result).toBeDefined();
    expect(result.IsoCode).toBe('00');
    expect(result.AzulOrderId).toBeDefined();
    azulOrderId = result.AzulOrderId!;
  });

  test('The transaction type is hold', async () => {
    const result = await azul.verifyPayment(customOrderId);

    expect(result).toBeDefined();
    expect(result.Found).toBe(true);
    expect(result.TransactionType).toBe('Hold');
  });

  test('Can void a hold', async () => {
    const result = await azul.void(azulOrderId);

    expect(result).toBeDefined();
    expect(result.IsoCode).toBe('00');

    const verify = await azul.verifyPayment(customOrderId);
    expect(verify).toBeDefined();
    expect(verify.Found).toBe(true);
    expect(verify.TransactionType).toBe('Void');
  }, 10000);

  test('Can post a hold', async () => {
    const customOrderId = randomUUID();

    const result = await azul.payments.hold({
      cardNumber: '6011000990099818',
      expiration: '202412',
      CVC: '818',
      customOrderId,
      amount: 100,
      ITBIS: 10
    });

    expect(result).toBeDefined();
    expect(result.IsoCode).toBe('00');
    expect(result.AzulOrderId).toBeDefined();

    const post = await azul.post({
      azulOrderId: result.AzulOrderId!,
      amount: 100,
      ITBIS: 10
    });

    expect(post).toBeDefined();
    expect(post.IsoCode).toBe('00');

    const verify = await azul.verifyPayment(customOrderId);
    expect(verify).toBeDefined();
    expect(verify.Found).toBe(true);
    expect(verify.TransactionType).toBe('Post');
  }, 10000);

  test('Can refund a post', async () => {
    const customOrderId = randomUUID();

    const result = await azul.payments.hold({
      cardNumber: '6011000990099818',
      expiration: '202412',
      CVC: '818',
      customOrderId,
      amount: 100,
      ITBIS: 10
    });

    expect(result).toBeDefined();
    expect(result.IsoCode).toBe('00');
    expect(result.AzulOrderId).toBeDefined();

    const post = await azul.post({
      azulOrderId: result.AzulOrderId!,
      amount: 100,
      ITBIS: 10
    });

    expect(post).toBeDefined();
    expect(post.IsoCode).toBe('00');

    const refund = await azul.payments.refund({
      cardNumber: '6011000990099818',
      expiration: '202412',
      customOrderId,
      amount: 100,
      ITBIS: 10,
      azulOrderId: post.AzulOrderId!
    });

    expect(refund).toBeDefined();
    expect(refund.IsoCode).toBe('00');

    const verify = await azul.verifyPayment(customOrderId);
    expect(verify).toBeDefined();
    expect(verify.Found).toBe(true);
    expect(verify.TransactionType).toBe('Refund');
  }, 10000);
});
