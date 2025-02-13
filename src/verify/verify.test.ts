import { randomUUID } from 'crypto';
import { describe, expect, it, beforeAll } from 'vitest';

import { azul } from '../tests/integration/instance';
import { TEST_CARDS } from '../tests/fixtures/cards';
import 'dotenv/config';

describe('Can verify a payment', () => {
  const customOrderId = randomUUID();

  beforeAll(async () => {
    const card = TEST_CARDS.DISCOVER;

    const payment = await azul.payments.sale({
      type: 'card',
      cardNumber: card.number,
      expiration: card.expiration,
      CVC: card.cvv,
      amount: 100,
      ITBIS: 10,
      customOrderId
    });

    expect(payment.type).toBe('success');
  });

  it('After the payment, the TransactionType should be "Sale"', async () => {
    const result = await azul.verifyPayment(customOrderId);

    expect(result.TransactionType).toBe('Sale');
  });
});
