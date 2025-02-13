import { randomUUID } from 'crypto';
import { describe, expect, beforeAll, it } from 'vitest';

import { azul } from './instance';
import { getCard } from '../fixtures/cards';
import {
  expectSuccessfulPayment,
  expectSuccessfulVerification,
  expectOrderIds,
  expectSuccessfulVoid
} from '../utils';
import 'dotenv/config';

describe('Can hold a payment', () => {
  const customOrderId = randomUUID();
  let azulOrderId: string;

  beforeAll(async () => {
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
    expectOrderIds(result);
    azulOrderId = result.AzulOrderId!;
  }, 60000);

  it('The transaction type is hold', async () => {
    const result = await azul.verifyPayment(customOrderId);
    expectSuccessfulVerification(result, 'Hold');
  }, 60000);

  it('Can void a hold', async () => {
    const result = await azul.void(azulOrderId);
    expect(result).toBeDefined();
    expectSuccessfulVoid(result);

    const verify = await azul.verifyPayment(customOrderId);
    expectSuccessfulVerification(verify, 'Void');
  }, 60000);
});
