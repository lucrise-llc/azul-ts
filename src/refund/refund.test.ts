import { randomUUID } from 'crypto';
import { assert, describe, expect, it } from 'vitest';

import { azul } from '../tests/instance';
import { TEST_CARDS } from '../tests/fixtures/cards';

import 'dotenv/config';

describe('Refund', () => {
  it('Can refund a sale', async () => {
    const customOrderId = randomUUID();
    const card = TEST_CARDS.MASTERCARD_1;

    const sale = await azul.sale({
      type: 'card',
      cardNumber: card.number,
      expiration: card.expiration,
      CVC: card.cvv,
      customOrderId,
      amount: 100,
      ITBIS: 10
    });

    assert(sale.type === 'success');

    const refund = await azul.refund({
      type: 'card',
      cardNumber: card.number,
      expiration: card.expiration,
      customOrderId,
      amount: 100,
      ITBIS: 10,
      azulOrderId: sale.AzulOrderId
    });

    expect(refund.IsoCode).toBe('00');

    const verify = await azul.verify(customOrderId);
    expect(verify.TransactionType).toBe('Refund');
  }, 60000);

  it('Can refund a post', async () => {
    const customOrderId = randomUUID();
    const card = TEST_CARDS.MASTERCARD_1;

    const result = await azul.hold({
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

    const refund = await azul.refund({
      type: 'card',
      cardNumber: card.number,
      expiration: card.expiration,
      customOrderId,
      amount: 100,
      ITBIS: 10,
      azulOrderId: post.AzulOrderId
    });

    expect(refund.IsoCode).toBe('00');

    const verify = await azul.verify(customOrderId);
    expect(verify.TransactionType).toBe('Refund');
  }, 60000);
});
