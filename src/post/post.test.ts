import { randomUUID } from 'crypto';
import { assert, describe, it } from 'vitest';

import { azul } from '../tests/instance';
import { TEST_CARDS } from '../tests/fixtures/cards';
import 'dotenv/config';

describe('Can post a payment', () => {
  it('Can post a hold', async () => {
    const customOrderId = randomUUID();

    const card = TEST_CARDS.VISA_TEST_CARD;

    const hold = await azul.hold({
      type: 'card',
      cardNumber: card.number,
      expiration: card.expiration,
      CVC: card.cvv,
      customOrderId,
      amount: 100,
      ITBIS: 10
    });

    assert(hold.type === 'success');

    const post = await azul.post({
      azulOrderId: hold.AzulOrderId,
      amount: 100,
      ITBIS: 10
    });

    assert(post.type === 'success');

    const verify = await azul.verify(customOrderId);
    assert(verify.Found);
    assert(verify.TransactionType === 'Post');
  }, 60000);
});
