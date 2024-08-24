import { randomUUID } from 'crypto';
import { azul } from './instance';
import { describe, expect, it, beforeAll } from 'vitest';
import 'dotenv/config';

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
      dateFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      dateTo: new Date()
    });

    expect(result).toBeDefined();
    expect(result.Transactions).toBeDefined();
    expect(result.Transactions?.length).toBeGreaterThan(0);

    const transaction = result.Transactions?.find((t) => t.CustomOrderId === customOrderId);
    expect(transaction).toBeDefined();
  }, 60000);
});
