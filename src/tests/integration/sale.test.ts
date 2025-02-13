import { describe, expect, it } from 'vitest';

import { azul } from './instance';
import { getCard } from '../fixtures/cards';
import { expectSuccessfulPayment } from '../utils';
import 'dotenv/config';

describe('Can make a payment', () => {
  it('Can make a payment', async () => {
    const testCard = getCard('VISA_TEST_CARD');
    const result = await azul.payments.sale({
      cardNumber: testCard.number,
      expiration: testCard.expiration,
      CVC: testCard.cvv,
      amount: 100,
      ITBIS: 10
    });

    expect(result).toBeDefined();
    expectSuccessfulPayment(result);
  }, 60000);
});
