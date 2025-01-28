import { randomUUID } from 'crypto';
import { azul } from './instance';
import { describe, expect, it, beforeAll } from 'vitest';
import 'dotenv/config';
import { getCard } from '../fixtures/cards';
import { expectSuccessfulPayment, expectSuccessfulVerification } from '../utils';

describe('Can verify a payment', () => {
  const customOrderId = randomUUID();

  beforeAll(async () => {
    const testCard = getCard('DISCOVER');
    const payment = await azul.payments.sale({
      cardNumber: testCard.number,
      expiration: testCard.expiration,
      CVC: testCard.cvv,
      amount: 100,
      ITBIS: 10,
      customOrderId
    });

    expect(payment).toBeDefined();
    expectSuccessfulPayment(payment);
  }, 60000);

  it('After the payment, the TransactionType should be "Sale"', async () => {
    const result = await azul.verifyPayment(customOrderId);

    expect(result).toBeDefined();
    expectSuccessfulVerification(result, 'Sale');
  }, 60000);
});
