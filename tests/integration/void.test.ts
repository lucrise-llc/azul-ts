import { generateOrderNumber } from '../fixtures/order';
import { azul } from './instance';
import { describe, expect, it, beforeAll } from 'vitest';
import 'dotenv/config';
import { getCard } from '../fixtures/cards';
import {
  expectSuccessfulPayment,
  expectSuccessfulVerification,
  expectOrderIds,
  expectSuccessfulVoid
} from '../utils';

describe('Can void a payment', () => {
  const customOrderId = generateOrderNumber();
  let azulOrderId: string | undefined = undefined;

  beforeAll(async () => {
    const testCard = getCard('VISA_TEST_CARD');
    const payment = await azul.payments.sale({
      cardNumber: testCard.number,
      expiration: testCard.expiration,
      CVC: testCard.cvv,
      customOrderId,
      amount: 100,
      ITBIS: 10,
      forceNo3DS: '1'
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
