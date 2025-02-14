import { randomUUID } from 'crypto';
import { describe, expect, it, beforeAll, assert } from 'vitest';

import { azul } from '../tests/instance';
import { TEST_CARDS } from '../tests/fixtures/cards';
import 'dotenv/config';

describe('Can search a payment', () => {
  const customOrderId = randomUUID();

  beforeAll(async () => {
    const testCard = TEST_CARDS.DISCOVER;

    const result = await azul.sale({
      type: 'card',
      cardNumber: testCard.number,
      expiration: testCard.expiration,
      CVC: testCard.cvv,
      customOrderId,
      amount: 100,
      ITBIS: 10
    });

    assert(result.type === 'success');
  });

  it('Can search a payment', async () => {
    const result = await azul.search({
      dateFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      dateTo: new Date()
    });

    expect(result).toBeDefined();
    expect(result.Transactions).toBeDefined();
    expect(result.Transactions?.length).toBeGreaterThan(0);

    const transaction = result.Transactions?.find((t) => t.CustomOrderId === customOrderId);
    expect(transaction).toBeDefined();
  });
});
