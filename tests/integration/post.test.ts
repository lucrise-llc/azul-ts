import { randomUUID } from 'crypto';
import { azul } from './instance';
import { describe, expect, it } from 'vitest';
import 'dotenv/config';
import { getCard } from '../fixtures/cards';
import { expectSuccessfulPayment, expectSuccessfulVerification } from '../utils';

describe('Can post a payment', () => {
  it('Can post a hold', async () => {
    const customOrderId = randomUUID();

    const testCard = getCard('VISA_TEST_CARD'); // Use specific test card
    const samplePayment = {
      cardNumber: testCard.number,
      expiration: testCard.expiration,
      CVC: testCard.cvv,
      customOrderId,
      amount: 100,
      ITBIS: 10
    };

    const hold = await azul.payments.hold(samplePayment);

    expect(hold).toBeDefined();
    expectSuccessfulPayment(hold);

    const post = await azul.post({
      azulOrderId: hold.AzulOrderId!,
      amount: 100,
      ITBIS: 10
    });

    expect(post).toBeDefined();
    expectSuccessfulPayment(post);

    const verify = await azul.verifyPayment(customOrderId);
    expect(verify).toBeDefined();
    expectSuccessfulVerification(verify, 'Post');
  }, 60000);
});
