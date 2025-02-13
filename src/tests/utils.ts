import { expect } from 'vitest';

import type { DataVaultResponse } from '../data-vault/types';
import type { ProcessPaymentResponse } from '../process-payment/types';

// Since we don't have direct access to VerifyPaymentResponse type, we'll define it
interface VerifyPaymentResponse extends Partial<ProcessPaymentResponse> {
  Found?: boolean;
  TransactionType?: string;
}

type PaymentSuccessResponse = ProcessPaymentResponse & {
  IsoCode: '00';
  ResponseCode: 'ISO8583';
  ResponseMessage: 'APROBADA';
};

type PaymentErrorResponse = ProcessPaymentResponse & {
  IsoCode: string;
  ResponseCode: 'Error';
  ErrorDescription: string;
};

type PaymentTemporaryError = ProcessPaymentResponse & {
  IsoCode: '91';
};

type VaultSuccessResponse = DataVaultResponse & {
  IsoCode: '00';
  DataVaultToken: string;
  Expiration: string;
};

type VaultDeleteResponse = Omit<DataVaultResponse, 'DataVaultToken' | 'Expiration'> & {
  IsoCode: '00';
  ResponseMessage: 'APROBADA';
};

type VoidSuccessResponse = ProcessPaymentResponse & {
  IsoCode: '00';
  ResponseMessage: 'APROBADA';
};

/**
 * Type guard to check if a response indicates success (IsoCode: "00")
 */
export function isSuccessResponse(
  result: ProcessPaymentResponse | VerifyPaymentResponse | DataVaultResponse
): result is
  | PaymentSuccessResponse
  | VaultSuccessResponse
  | VaultDeleteResponse
  | (VerifyPaymentResponse & { IsoCode: '00' }) {
  return result.IsoCode === '00';
}

/**
 * Type guard to check if a response indicates a temporary system error (IsoCode: "91")
 */
export function isTemporaryError(
  result: ProcessPaymentResponse | VerifyPaymentResponse | DataVaultResponse
): result is PaymentTemporaryError | (VerifyPaymentResponse & { IsoCode: '91' }) {
  return result.IsoCode === '91';
}

/**
 * Type guard to check if a response indicates a validation error
 */
export function isValidationError(result: ProcessPaymentResponse): result is PaymentErrorResponse {
  return (
    result.ResponseCode === 'Error' &&
    (result.ErrorDescription?.startsWith('VALIDATION_ERROR:') ?? false)
  );
}

/**
 * Helper to expect a validation error with a specific error description
 */
export function expectValidationError(result: ProcessPaymentResponse, expectedError: string) {
  // If we get a temporary error, skip the validation
  if (isTemporaryError(result)) {
    console.warn('⚠️ Received temporary error (91), skipping validation check');
    return;
  }

  expect(result).toMatchObject({
    ResponseCode: 'Error',
    ErrorDescription: expectedError
  });
}

/**
 * Helper to expect a successful payment response
 */
export function expectSuccessfulPayment(result: ProcessPaymentResponse) {
  // If we get a temporary error, skip the validation
  if (isTemporaryError(result)) {
    console.warn('⚠️ Received temporary error (91), skipping success check');
    return;
  }

  expect(result).toMatchObject<Partial<PaymentSuccessResponse>>({
    IsoCode: '00',
    ResponseMessage: 'APROBADA',
    ResponseCode: 'ISO8583'
  });
}

/**
 * Helper to expect a successful verification response
 */
export function expectSuccessfulVerification(result: VerifyPaymentResponse, expectedType: string) {
  // If we get a temporary error, skip the validation
  if (isTemporaryError(result)) {
    console.warn('⚠️ Received temporary error (91), skipping verification check');
    return;
  }

  expect(result).toMatchObject<Partial<VerifyPaymentResponse>>({
    Found: true,
    TransactionType: expectedType
  });
}

/**
 * Helper to expect a response to have required order IDs
 */
export function expectOrderIds(result: ProcessPaymentResponse) {
  expect(result.AzulOrderId).toBeDefined();
  expect(result.AzulOrderId).not.toBe('');
  if (result.CustomOrderId) {
    expect(result.CustomOrderId).not.toBe('');
  }
}

/**
 * Helper to expect a successful void response
 */
export function expectSuccessfulVoid(result: ProcessPaymentResponse) {
  // If we get a temporary error, skip the validation
  if (isTemporaryError(result)) {
    console.warn('⚠️ Received temporary error (91), skipping void check');
    return;
  }

  expect(result).toMatchObject<Partial<VoidSuccessResponse>>({
    IsoCode: '00',
    ResponseMessage: 'APROBADA'
  });
}
