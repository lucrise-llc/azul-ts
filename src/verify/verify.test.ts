import { randomUUID } from 'crypto';
import { describe, expect, it } from 'vitest';

import { azul } from '../tests/instance';
import { TEST_CARDS } from '../tests/fixtures/cards';
import 'dotenv/config';

describe('Can verify a payment', () => {
  it('After the payment, the TransactionType should be "Sale"', async () => {
    const card = TEST_CARDS.MASTERCARD_1;
    const customOrderId = randomUUID();

    const payment = await azul.sale({
      type: 'card',
      cardNumber: card.number,
      expiration: card.expiration,
      CVC: card.cvv,
      amount: 100,
      ITBIS: 10,
      customOrderId
    });
    expect(payment.type).toBe('success');

    const result = await azul.verify(customOrderId);
    expect(result.TransactionType).toBe('Sale');
  });
});
