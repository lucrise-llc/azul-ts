import { randomUUID } from 'crypto';
import { azul } from './instance';
import { describe, expect, beforeAll, it } from 'vitest';
import 'dotenv/config';

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
  }, 60000);

  it('The transaction type is hold', async () => {
    const result = await azul.verifyPayment(customOrderId);

    expect(result).toBeDefined();
    expect(result.Found).toBe(true);
    expect(result.TransactionType).toBe('Hold');
  }, 60000);

  it('Can void a hold', async () => {
    const result = await azul.void(azulOrderId);

    expect(result).toBeDefined();
    expect(result.IsoCode).toBe('00');

    const verify = await azul.verifyPayment(customOrderId);
    expect(verify).toBeDefined();
    expect(verify.Found).toBe(true);
    expect(verify.TransactionType).toBe('Void');
  }, 60000);
});
