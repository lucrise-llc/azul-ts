import { randomUUID } from 'crypto';
import { describe, expect, beforeAll, it } from 'vitest';

import { azul } from '../tests/integration/instance';
import { TEST_CARDS } from '../tests/fixtures/cards';

import 'dotenv/config';

describe('Can hold a payment', () => {
  const customOrderId = randomUUID();
  let azulOrderId: string;

  beforeAll(async () => {
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

    expect(result.IsoCode).toBe('00');
    azulOrderId = result.AzulOrderId;
  });

  it('The transaction type is hold', async () => {
    const result = await azul.verifyPayment(customOrderId);
    expect(result.TransactionType).toBe('Hold');
  });

  it('Can void a hold', async () => {
    const result = await azul.void(azulOrderId);
    expect(result.IsoCode).toBe('00');

    const verify = await azul.verifyPayment(customOrderId);
    expect(verify.TransactionType).toBe('Void');
  });
});
