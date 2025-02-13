import { generateOrderNumber } from '../fixtures/order';
import { azul } from './instance';
import { describe, expect, it, beforeAll } from 'vitest';
import 'dotenv/config';
import { getCard } from '../fixtures/cards';
import { expectSuccessfulPayment } from '../utils';

describe('Can search a payment', () => {
  const customOrderId = generateOrderNumber();

  beforeAll(async () => {
    const testCard = getCard('DISCOVER');
    const result = await azul.payments.sale({
      cardNumber: testCard.number,
      expiration: testCard.expiration,
      CVC: testCard.cvv,
      customOrderId,
      amount: 100,
      ITBIS: 10
    });

    expect(result).toBeDefined();
    expectSuccessfulPayment(result);
  }, 60000);

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
  }, 60000);
});
