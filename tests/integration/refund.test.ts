import { generateOrderNumber } from '../fixtures/order';
import { azul } from './instance';
import { describe, expect, it } from 'vitest';
import 'dotenv/config';
import { getCard } from '../fixtures/cards';
import { expectSuccessfulPayment, expectSuccessfulVerification } from '../utils';

describe('Refund', () => {
  it('Can refund a sale', async () => {
    const customOrderId = generateOrderNumber();
    const testCard = getCard('DISCOVER');

    const sale = await azul.payments.sale({
      cardNumber: testCard.number,
      expiration: testCard.expiration,
      CVC: testCard.cvv,
      customOrderId,
      amount: 100,
      ITBIS: 10
    });

    expect(sale).toBeDefined();
    expectSuccessfulPayment(sale);

    const refund = await azul.payments.refund({
      cardNumber: testCard.number,
      expiration: testCard.expiration,
      customOrderId,
      amount: 100,
      ITBIS: 10,
      azulOrderId: sale.AzulOrderId!
    });

    expect(refund).toBeDefined();
    expectSuccessfulPayment(refund);

    const verify = await azul.verifyPayment(customOrderId);
    expect(verify).toBeDefined();
    expectSuccessfulVerification(verify, 'Refund');
  }, 60000);

  it('Can refund a post', async () => {
    const customOrderId = generateOrderNumber();
    const testCard = getCard('DISCOVER');

    const result = await azul.payments.hold({
      cardNumber: testCard.number,
      expiration: testCard.expiration,
      CVC: testCard.cvv,
      customOrderId,
      amount: 100,
      ITBIS: 10
    });

    expect(result).toBeDefined();
    expectSuccessfulPayment(result);

    const post = await azul.post({
      azulOrderId: result.AzulOrderId!,
      amount: 100,
      ITBIS: 10
    });

    expect(post).toBeDefined();
    expectSuccessfulPayment(post);

    const refund = await azul.payments.refund({
      cardNumber: testCard.number,
      expiration: testCard.expiration,
      customOrderId,
      amount: 100,
      ITBIS: 10,
      azulOrderId: post.AzulOrderId!
    });

    expect(refund).toBeDefined();
    expectSuccessfulPayment(refund);

    const verify = await azul.verifyPayment(customOrderId);
    expect(verify).toBeDefined();
    expectSuccessfulVerification(verify, 'Refund');
  }, 60000);
});
