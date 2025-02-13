import { describe, expect, it } from 'vitest';

import { azul } from '../tests/integration/instance';
import { TEST_CARDS } from '../tests/fixtures/cards';
import 'dotenv/config';

describe('Can make a payment', () => {
  it('Can make a payment', async () => {
    const card = TEST_CARDS.VISA_TEST_CARD;

    const result = await azul.payments.sale({
      type: 'card',
      cardNumber: card.number,
      expiration: card.expiration,
      CVC: card.cvv,
      amount: 100,
      ITBIS: 10
    });

    expect(result.IsoCode).toBe('00');
  });
});
