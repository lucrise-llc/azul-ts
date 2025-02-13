import { randomUUID } from 'crypto';
import { assert, describe, expect, it } from 'vitest';

import { azul } from '../tests/integration/instance';
import { TEST_CARDS } from '../tests/fixtures/cards';

import 'dotenv/config';

describe('Refund', () => {
  it('Can refund a sale', async () => {
    const customOrderId = randomUUID();
    const card = TEST_CARDS.DISCOVER;

    const sale = await azul.payments.sale({
      type: 'card',
      cardNumber: card.number,
      expiration: card.expiration,
      CVC: card.cvv,
      customOrderId,
      amount: 100,
      ITBIS: 10
    });

    assert(sale.type === 'success');

    const refund = await azul.payments.refund({
      type: 'card',
      cardNumber: card.number,
      expiration: card.expiration,
      customOrderId,
      amount: 100,
      ITBIS: 10,
      azulOrderId: sale.AzulOrderId
    });

    expect(refund.IsoCode).toBe('00');

    const verify = await azul.verifyPayment(customOrderId);
    expect(verify.TransactionType).toBe('Refund');
  }, 60000);

  it('Can refund a post', async () => {
    const customOrderId = randomUUID();
    const card = TEST_CARDS.DISCOVER;

    const result = await azul.payments.hold({
      type: 'card',
      cardNumber: card.number,
      expiration: card.expiration,
      CVC: card.cvv,
      customOrderId,
      amount: 100,
      ITBIS: 10
    });

    assert(result.type === 'success');

    const post = await azul.post({
      azulOrderId: result.AzulOrderId,
      amount: 100,
      ITBIS: 10
    });

    assert(post.type === 'success');

    const refund = await azul.payments.refund({
      type: 'card',
      cardNumber: card.number,
      expiration: card.expiration,
      customOrderId,
      amount: 100,
      ITBIS: 10,
      azulOrderId: post.AzulOrderId
    });

    expect(refund.IsoCode).toBe('00');

    const verify = await azul.verifyPayment(customOrderId);
    expect(verify.TransactionType).toBe('Refund');
  }, 60000);
});
