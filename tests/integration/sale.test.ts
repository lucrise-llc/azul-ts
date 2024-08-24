import { azul } from './instance';
import { describe, expect, it } from 'vitest';
import 'dotenv/config';

describe('Can make a payment', () => {
  it('Can make a payment', async () => {
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
  }, 60000);
});
