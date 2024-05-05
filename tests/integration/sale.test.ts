import AzulAPI from '../../src/azul-api/api';
import { describe, expect, it } from 'vitest';
import 'dotenv/config';

const azul = new AzulAPI({
  auth1: process.env.AUTH1!,
  auth2: process.env.AUTH2!,
  merchantId: process.env.MERCHANT_ID!,
  certificatePath: process.env.CERTIFICATE_PATH!,
  keyPath: process.env.KEY_PATH!
});

describe('Can make a payment', () => {
  it('Can make a payment', async () => {
    const result = await azul.payments.sale({
      cardNumber: '6011000990099818',
      expiration: '202412',
      CVC: '818',
      customOrderId: '1234',
      amount: 100,
      ITBIS: 10
    });

    expect(result).toBeDefined();
    expect(result.IsoCode).toBe('00');
  }, 10000);
});
