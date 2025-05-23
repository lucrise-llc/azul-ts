import { describe, expect, it } from 'vitest';

import { azul } from '../tests/instance';
import { TEST_CARDS } from '../tests/fixtures/cards';
import 'dotenv/config';

describe('Can make a payment', () => {
  it('Can make a payment', async () => {
    const card = TEST_CARDS.VISA_TEST_CARD;

    const result = await azul.sale({
      type: 'card',
      cardNumber: card.number,
      expiration: card.expiration,
      CVC: card.cvv,
      amount: 100,
      ITBIS: 10
    });

    expect(result.type).toBe('success');
  });

  it('Should reject expired cards', async () => {
    const card = TEST_CARDS.VISA_TEST_CARD;

    const response = await azul.sale({
      type: 'card',
      cardNumber: card.number,
      expiration: '202301', // Past date
      CVC: card.cvv,
      amount: 100,
      ITBIS: 10,
      customOrderId: 'test'
    });

    expect(response.type).toBe('error');
    expect(response.ErrorDescription).toBe('VALIDATION_ERROR:ExpirationPassed');
  });

  it('Should reject an invalid expiration format', async () => {
    const card = TEST_CARDS.VISA_TEST_CARD;

    const response = await azul.sale({
      type: 'card',
      cardNumber: card.number,
      expiration: '012345', // Invalid format (not a valid date)
      CVC: card.cvv,
      amount: 100,
      ITBIS: 10
    });

    expect(response.type).toBe('error');
    expect(response.ErrorDescription).toBe('VALIDATION_ERROR:Expiration');
  });
});
