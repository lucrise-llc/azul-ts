import { randomUUID } from 'crypto';
import { azul } from './instance';
import { describe, expect, it } from 'vitest';
import 'dotenv/config';

describe('Can post a payment', () => {
  it('Can post a hold', async () => {
    const customOrderId = randomUUID();

    const hold = await azul.payments.hold({
      cardNumber: '6011000990099818',
      expiration: '202412',
      CVC: '818',
      customOrderId,
      amount: 100,
      ITBIS: 10
    });

    expect(hold).toBeDefined();
    expect(hold.IsoCode).toBe('00');
    expect(hold.AzulOrderId).toBeDefined();

    const post = await azul.post({
      azulOrderId: hold.AzulOrderId!,
      amount: 100,
      ITBIS: 10
    });

    expect(post).toBeDefined();
    expect(post.IsoCode).toBe('00');

    const verify = await azul.verifyPayment(customOrderId);
    expect(verify).toBeDefined();
    expect(verify.Found).toBe(true);
    expect(verify.TransactionType).toBe('Post');
  }, 60000);
});
