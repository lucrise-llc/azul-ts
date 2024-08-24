import { randomUUID } from 'crypto';
import { azul } from './instance';
import { describe, expect, it, beforeAll } from 'vitest';
import 'dotenv/config';

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
  }, 60000);

  it('After the payment, the TransactionType should be "Sale"', async () => {
    const result = await azul.verifyPayment(customOrderId);

    expect(result).toBeDefined();
    expect(result.Found).toBe(true);
    expect(result.CustomOrderId).toBe(customOrderId);
    expect(result.TransactionType).toBe('Sale');
  }, 60000);
});
