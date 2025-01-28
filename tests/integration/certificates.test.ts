import { randomUUID } from 'crypto';
import { describe, expect, it } from 'vitest';
import { resolve } from 'path';
import { writeFileSync, unlinkSync, readFileSync } from 'fs';
import AzulAPI from '../../src/azul-api/api';
import { getRandomCard } from '../fixtures/cards';
import { expectSuccessfulPayment } from '../utils';
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

    const REAL_CERT_PATH = process.env.AZUL_CERT!;
    const REAL_KEY_PATH = process.env.AZUL_KEY!;

    it('Can make payment with certificate files', async () => {
      const azul = new AzulAPI({
        auth1: process.env.AUTH1!,
        auth2: process.env.AUTH2!,
        merchantId: process.env.MERCHANT_ID!,
        certificate: REAL_CERT_PATH,
        key: REAL_KEY_PATH
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
        certificate: process.env.AZUL_CERT!.replace(/\n/g, '\\n'),
        key: process.env.AZUL_KEY!.replace(/\n/g, '\\n')
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
        certificate: process.env.AZUL_CERT!,
        key: process.env.AZUL_KEY!
      });

      const result = await azul.payments.sale({
        ...samplePayment,
        customOrderId: randomUUID()
      });

      expect(result).toBeDefined();
      expectSuccessfulPayment(result);
    }, 60000);

    it('Can make payment with base64 encoded certificates', async () => {
      const certContent = readFileSync(REAL_CERT_PATH, 'utf8');
      const keyContent = readFileSync(REAL_KEY_PATH, 'utf8');

      const azul = new AzulAPI({
        auth1: process.env.AUTH1!,
        auth2: process.env.AUTH2!,
        merchantId: process.env.MERCHANT_ID!,
        certificate: Buffer.from(certContent).toString('base64'),
        key: Buffer.from(keyContent).toString('base64')
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
    const FIXTURES_PATH = resolve(__dirname, '../fixtures/certificates');

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
        expect(error.message).toMatch(/Certificate error/);
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
        expect(error.message).toMatch(/Certificate error/);
      }
    });

    it('Should fail gracefully with non-PEM certificate file', async () => {
      const invalidPath = resolve(FIXTURES_PATH, 'invalid.crt');
      writeFileSync(invalidPath, 'Not a PEM certificate');

      try {
        new AzulAPI({
          auth1: process.env.AUTH1!,
          auth2: process.env.AUTH2!,
          merchantId: process.env.MERCHANT_ID!,
          certificate: invalidPath,
          key: process.env.AZUL_KEY!
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toMatch(/Certificate error/);
      } finally {
        unlinkSync(invalidPath);
      }
    });
  });
});
