import { randomUUID } from 'crypto';
import { describe, it, beforeAll, assert } from 'vitest';

import { azul } from '../tests/instance';
import { TEST_CARDS } from '../tests/fixtures/cards';
import 'dotenv/config';

describe('Can void a payment', () => {
  const customOrderId = randomUUID();
  let azulOrderId: string;

  beforeAll(async () => {
    const card = TEST_CARDS.VISA_TEST_CARD;

    const payment = await azul.payments.sale({
      type: 'card',
      cardNumber: card.number,
      expiration: card.expiration,
      CVC: card.cvv,
      customOrderId,
      amount: 100,
      ITBIS: 10
    });

    assert(payment.type === 'success');
    azulOrderId = payment.AzulOrderId;
  });

  it('After the payment, the TransactionType should be "Sale"', async () => {
    const verifyPayment = await azul.verifyPayment(customOrderId);
    assert(verifyPayment.TransactionType === 'Sale');
  });

  it("Should update transaction type to 'Void' after successful void operation", async () => {
    const voidResponse = await azul.void(azulOrderId);
    assert(voidResponse.type === 'success');

    const verifyPayment = await azul.verifyPayment(customOrderId);
    assert(verifyPayment.TransactionType === 'Void');
  });
});
