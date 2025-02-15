import { describe, it, assert } from 'vitest';

import { AzulSecure } from './secure';
import { env } from '../tests/instance';

describe('Azul secure', () => {
  it('Test secure sale', async () => {
    const secure = new AzulSecure({
      auth1: env.AUTH1,
      auth2: env.AUTH2,
      merchantId: env.MERCHANT_ID,
      certificate: env.AZUL_CERT,
      key: env.AZUL_KEY,
      processMethodBaseUrl: 'http://localhost:3000/process-method',
      processChallengeBaseUrl: 'http://localhost:3000/process-challenge'
    });

    const result = await secure.secureSale({
      type: 'card',
      cardNumber: '4147463011110117',
      expiration: '202512',
      CVC: '123',
      amount: 100,
      ITBIS: 10
    });

    assert(result.type === 'success');
  });
});
