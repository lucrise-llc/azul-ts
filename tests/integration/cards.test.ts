import { generateOrderNumber } from '../fixtures/order';
import { describe, expect, it } from 'vitest';
import { azul } from './instance';
import { getCard } from '../fixtures/cards';
import { expectSuccessfulPayment, expectValidationError } from '../utils';
import 'dotenv/config';

describe('Card Behaviors', () => {
  describe('Card Limits', () => {
    // TODO: This card is not being limited
    // it("Should fail when exceeding card limit", async () => {
    //   const limitedCard = getCard("VISA_LIMITED");
    //   const result = await azul.payments.sale({
    //     cardNumber: limitedCard.number,
    //     expiration: limitedCard.expiration,
    //     CVC: limitedCard.cvv,
    //     customOrderId: randomUUID(),
    //     amount: 100, // Exceeds the 75 RD$ limit
    //     ITBIS: 10
    //   });

    //   expect(result).toBeDefined();
    //   expect(result.IsoCode).not.toBe("00"); // Should fail
    //   expect(result.ResponseMessage).toMatch(/limit/i);
    // }, 60000);

    it('Should succeed within card limit', async () => {
      const limitedCard = getCard('VISA_LIMITED');
      const result = await azul.payments.sale({
        cardNumber: limitedCard.number,
        expiration: limitedCard.expiration,
        CVC: limitedCard.cvv,
        customOrderId: generateOrderNumber(),
        amount: 50, // Within the 75 RD$ limit
        ITBIS: 5,
        forceNo3DS: '1' as '0' | '1' // Explicitly disable 3DS
      });

      expect(result).toBeDefined();
      expectSuccessfulPayment(result);
    }, 60000);
  });

  describe('Expiration Date Validation', () => {
    it('Should reject expired cards', async () => {
      const expiredCard = getCard('VISA_TEST_CARD');
      expiredCard.expiration = '202301'; // Past date

      const result = await azul.payments.hold({
        cardNumber: expiredCard.number,
        expiration: expiredCard.expiration,
        CVC: expiredCard.cvv,
        amount: 100,
        ITBIS: 10,
        customOrderId: generateOrderNumber()
      });

      expectValidationError(result, 'VALIDATION_ERROR:ExpirationPassed');
    });

    it('Should reject invalid expiration format', async () => {
      const testCard = getCard('VISA_TEST_CARD');
      const testRequest = {
        cardNumber: testCard.number,
        expiration: '012345', // Invalid format (not a valid date)
        CVC: testCard.cvv,
        customOrderId: generateOrderNumber(),
        amount: 100,
        ITBIS: 10
      };

      const result = await azul.payments.hold(testRequest);

      expectValidationError(result, 'VALIDATION_ERROR:Expiration');
    });

    it('Should reject past expiration dates', async () => {
      const testCard = getCard('VISA_TEST_CARD');
      const testRequest = {
        cardNumber: testCard.number,
        expiration: '202301', // January 2023 (expired)
        CVC: testCard.cvv,
        customOrderId: 'expired-test',
        amount: 100,
        ITBIS: 10
      };

      const result = await azul.payments.hold(testRequest);

      expectValidationError(result, 'VALIDATION_ERROR:ExpirationPassed');
    });
  });
});
