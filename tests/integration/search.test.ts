import { randomUUID } from 'crypto';
import AzulAPI from '../../src/azul-api/api';
import { describe, expect, it, beforeAll } from 'vitest';
import 'dotenv/config';

const azul = new AzulAPI({
  auth1: process.env.AUTH1!,
  auth2: process.env.AUTH2!,
  merchantId: process.env.MERCHANT_ID!,
  certificatePath: process.env.CERTIFICATE_PATH!,
  keyPath: process.env.KEY_PATH!
});

describe('Can search a payment', () => {
  const customOrderId = randomUUID();

  beforeAll(async () => {
    const result = await azul.payments.sale({
      cardNumber: '6011000990099818',
      expiration: '202412',
      CVC: '818',
      customOrderId,
      amount: 100,
      ITBIS: 10
    });

    expect(result).toBeDefined();
    expect(result.IsoCode).toBe('00');
  }, 60000);

  it('Can search a payment', async () => {
    const result = await azul.search({
      dateFrom: new Date(),
      dateTo: new Date()
    });

    expect(result).toBeDefined();
    expect(result.Transactions).toBeDefined();
    expect(result.Transactions?.length).toBeGreaterThan(0);

    const transaction = result.Transactions?.find((t) => t.CustomOrderId === customOrderId);
    expect(transaction).toBeDefined();
  }, 60000);
});
