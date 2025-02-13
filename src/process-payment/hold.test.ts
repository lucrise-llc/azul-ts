import { randomUUID } from 'crypto';
import { describe, expect, beforeAll, it, assert } from 'vitest';

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

    assert(result.type === 'success');
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

  it('Should reject invalid expiration format', async () => {
    const card = TEST_CARDS.VISA_TEST_CARD;

    const result = await azul.payments.hold({
      type: 'card',
      cardNumber: card.number,
      expiration: '012345', // Invalid format (not a valid date)
      CVC: card.cvv,
      customOrderId: 'expired-test',
      amount: 100,
      ITBIS: 10
    });

    expect(result.type).toBe('error');
    expect(result.ErrorDescription).toBe('VALIDATION_ERROR:Expiration');
  });

  it('Should reject past expiration dates', async () => {
    const card = TEST_CARDS.VISA_TEST_CARD;

    const result = await azul.payments.hold({
      type: 'card',
      cardNumber: card.number,
      expiration: '202301', // January 2023 (expired)
      CVC: card.cvv,
      customOrderId: 'expired-test',
      amount: 100,
      ITBIS: 10
    });

    expect(result.type).toBe('error');
    expect(result.ErrorDescription).toBe('VALIDATION_ERROR:ExpirationPassed');
  });
});
