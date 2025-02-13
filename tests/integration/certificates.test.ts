import { resolve } from 'path';
import { randomUUID } from 'crypto';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';

import AzulAPI from '../../src/api';
import { getRandomCard } from '../fixtures/cards';
import { expectSuccessfulPayment } from '../utils';
import { PEMError } from '../../src/parse-certificate';
import 'dotenv/config';

describe('Certificate handling', () => {
  describe('Integration tests', () => {
    const testCard = getRandomCard(['VISA_LIMITED']);
    const samplePayment = {
      cardNumber: testCard.number,
      expiration: testCard.expiration,
      CVC: testCard.cvv,
      customOrderId: randomUUID(),
      amount: 100,
      ITBIS: 10
    };

    const CERT_CONTENT = process.env.AZUL_CERT!;
    const KEY_CONTENT = process.env.AZUL_KEY!;

    const TEMP_DIR = resolve(__dirname, '../fixtures/certificates');
    const TEMP_CERT_PATH = resolve(TEMP_DIR, 'temp.crt');
    const TEMP_KEY_PATH = resolve(TEMP_DIR, 'temp.key');

    beforeAll(() => {
      if (!existsSync(TEMP_DIR)) {
        mkdirSync(TEMP_DIR, { recursive: true });
      }
      writeFileSync(TEMP_CERT_PATH, CERT_CONTENT);
      writeFileSync(TEMP_KEY_PATH, KEY_CONTENT);
    });

    afterAll(() => {
      try {
        unlinkSync(TEMP_CERT_PATH);
        unlinkSync(TEMP_KEY_PATH);
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    it('Can make payment with certificate files', async () => {
      const azul = new AzulAPI({
        auth1: process.env.AUTH1!,
        auth2: process.env.AUTH2!,
        merchantId: process.env.MERCHANT_ID!,
        certificate: TEMP_CERT_PATH,
        key: TEMP_KEY_PATH
      });

      const result = await azul.payments.sale(samplePayment);

      expect(result).toBeDefined();
      expectSuccessfulPayment(result);
    }, 60000);

    it('Can make payment with single-line certificate strings', async () => {
      const azul = new AzulAPI({
        auth1: process.env.AUTH1!,
        auth2: process.env.AUTH2!,
        merchantId: process.env.MERCHANT_ID!,
        certificate: CERT_CONTENT.replace(/\n/g, '\\n'),
        key: KEY_CONTENT.replace(/\n/g, '\\n')
      });

      const result = await azul.payments.sale({
        ...samplePayment,
        customOrderId: randomUUID()
      });

      expect(result).toBeDefined();
      expectSuccessfulPayment(result);
    }, 60000);

    it('Can make payment with multiline certificate strings', async () => {
      const azul = new AzulAPI({
        auth1: process.env.AUTH1!,
        auth2: process.env.AUTH2!,
        merchantId: process.env.MERCHANT_ID!,
        certificate: CERT_CONTENT,
        key: KEY_CONTENT
      });

      const result = await azul.payments.sale({
        ...samplePayment,
        customOrderId: randomUUID()
      });

      expect(result).toBeDefined();
      expectSuccessfulPayment(result);
    }, 60000);

    it('Can make payment with base64 encoded certificates', async () => {
      const azul = new AzulAPI({
        auth1: process.env.AUTH1!,
        auth2: process.env.AUTH2!,
        merchantId: process.env.MERCHANT_ID!,
        certificate: Buffer.from(CERT_CONTENT).toString('base64'),
        key: Buffer.from(KEY_CONTENT).toString('base64')
      });

      const result = await azul.payments.sale({
        ...samplePayment,
        customOrderId: randomUUID()
      });

      expect(result).toBeDefined();
      expectSuccessfulPayment(result);
    }, 60000);
  });

  describe('Certificate parsing', () => {
    it('Should fail gracefully with invalid certificate path', () => {
      try {
        new AzulAPI({
          auth1: process.env.AUTH1!,
          auth2: process.env.AUTH2!,
          merchantId: process.env.MERCHANT_ID!,
          certificate: 'nonexistent/path/cert.crt',
          key: 'nonexistent/path/key.key'
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error instanceof PEMError).toBe(true);
      }
    });

    it('Should fail gracefully with invalid certificate content', () => {
      try {
        new AzulAPI({
          auth1: process.env.AUTH1!,
          auth2: process.env.AUTH2!,
          merchantId: process.env.MERCHANT_ID!,
          certificate: 'INVALID_CERTIFICATE_CONTENT',
          key: 'INVALID_KEY_CONTENT'
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error instanceof PEMError).toBe(true);
      }
    });
  });
});
