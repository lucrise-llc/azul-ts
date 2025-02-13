import { randomUUID } from 'crypto';
import { describe, expect, it, beforeAll } from 'vitest';

import { azul } from './instance';
import { getCard } from '../fixtures/cards';
import {
  expectSuccessfulPayment,
  expectSuccessfulVerification,
  expectOrderIds,
  expectSuccessfulVoid
} from '../utils';
import 'dotenv/config';

describe('Can void a payment', () => {
  const customOrderId = randomUUID();
  let azulOrderId: string | undefined = undefined;

  beforeAll(async () => {
    const testCard = getCard('VISA_TEST_CARD');
    const payment = await azul.payments.sale({
      cardNumber: testCard.number,
      expiration: testCard.expiration,
      CVC: testCard.cvv,
      customOrderId,
      amount: 100,
      ITBIS: 10
    });

    expect(payment).toBeDefined();
    expectSuccessfulPayment(payment);
    expectOrderIds(payment);
    azulOrderId = payment.AzulOrderId;
  }, 60000);

  it('After the payment, the TransactionType should be "Sale"', async () => {
    const verifyPayment = await azul.verifyPayment(customOrderId);
    expectSuccessfulVerification(verifyPayment, 'Sale');
  }, 60000);

  it("Should update transaction type to 'Void' after successful void operation", async () => {
    const voidResponse = await azul.void(azulOrderId!);
    expect(voidResponse).toBeDefined();
    expectSuccessfulVoid(voidResponse);

    const verifyPayment = await azul.verifyPayment(customOrderId);
    expectSuccessfulVerification(verifyPayment, 'Void');
  }, 60000);
});
