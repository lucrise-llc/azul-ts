import { randomUUID } from 'crypto';
import { describe, expect, it, assert } from 'vitest';

import { azul } from '../tests/instance';
import { TEST_CARDS } from '../tests/fixtures/cards';
import 'dotenv/config';

describe('Can search a payment', () => {
  it('Can search a payment', async () => {
    const customOrderId = randomUUID();
    const testCard = TEST_CARDS.MASTERCARD_1;

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

    const searchResult = await azul.search({
      dateFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      dateTo: new Date()
    });

    expect(searchResult).toBeDefined();
    expect(searchResult.Transactions).toBeDefined();
    expect(searchResult.Transactions?.length).toBeGreaterThan(0);

    const transaction = searchResult.Transactions?.find((t) => t.CustomOrderId === customOrderId);
    expect(transaction).toBeDefined();
  });
});
