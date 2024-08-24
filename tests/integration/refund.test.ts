import { randomUUID } from 'crypto';
import { azul } from './instance';
import { describe, expect, it } from 'vitest';
import 'dotenv/config';

describe('Can refund a payment', () => {
  it('Can refund a sale', async () => {
    const customOrderId = randomUUID();

    const sale = await azul.payments.sale({
      cardNumber: '6011000990099818',
      expiration: '202412',
      CVC: '818',
      customOrderId,
      amount: 100,
      ITBIS: 10
    });

    expect(sale).toBeDefined();
    expect(sale.IsoCode).toBe('00');
    expect(sale.AzulOrderId).toBeDefined();

    const refund = await azul.payments.refund({
      cardNumber: '6011000990099818',
      expiration: '202412',
      customOrderId,
      amount: 100,
      ITBIS: 10,
      azulOrderId: sale.AzulOrderId!
    });

    expect(refund).toBeDefined();
    expect(refund.IsoCode).toBe('00');

    const verify = await azul.verifyPayment(customOrderId);
    expect(verify).toBeDefined();
    expect(verify.Found).toBe(true);
    expect(verify.TransactionType).toBe('Refund');
  }, 60000);

  it('Can refund a post', async () => {
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
  }, 60000);
});
