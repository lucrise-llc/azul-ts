import { randomUUID } from 'crypto';
import { describe, expect, it, assert } from 'vitest';

import { azul } from '../tests/instance';
import { TEST_CARDS } from '../tests/fixtures/cards';
import 'dotenv/config';

describe.concurrent('Can hold a payment', () => {
  it('The transaction type is hold', async () => {
    const card = TEST_CARDS.MASTERCARD_1;
    const customOrderId = randomUUID();

    const result = await azul.hold({
      type: 'card',
      cardNumber: card.number,
      expiration: card.expiration,
      CVC: card.cvv,
      customOrderId,
      amount: 100,
      ITBIS: 10
    });

    assert(result.type === 'success');

    const verifyResult = await azul.verify(customOrderId);
    assert(verifyResult.TransactionType === 'Hold');
  });

  it('Can void a hold', async () => {
    const card = TEST_CARDS.MASTERCARD_1;
    const customOrderId = randomUUID();

    const result = await azul.hold({
      type: 'card',
      cardNumber: card.number,
      expiration: card.expiration,
      CVC: card.cvv,
      customOrderId,
      amount: 100,
      ITBIS: 10
    });

    assert(result.type === 'success');

    const voidResult = await azul.void(result.AzulOrderId);
    assert(voidResult.type === 'success');

    const verify = await azul.verify(customOrderId);
    assert(verify.TransactionType === 'Void');
  });

  it('Should reject invalid expiration format', async () => {
    const card = TEST_CARDS.VISA_TEST_CARD;

    const result = await azul.hold({
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

    const result = await azul.hold({
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
