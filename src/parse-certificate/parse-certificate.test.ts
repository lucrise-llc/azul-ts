import { resolve } from 'path';
import { readFileSync } from 'fs';
import { describe, expect, it } from 'vitest';

import { parsePEM, PEMError } from './parse-certificate';

describe('Certificate handling', () => {
  const TEMP_CERT_PATH = resolve(__dirname, './test-cert.crt');
  const TEMP_KEY_PATH = resolve(__dirname, './test-key.key');

  const CERT_CONTENT = readFileSync(TEMP_CERT_PATH, 'utf-8');
  const KEY_CONTENT = readFileSync(TEMP_KEY_PATH, 'utf-8');

  it('Can load certificate from file', () => {
    const cert = parsePEM(TEMP_CERT_PATH, 'certificate');
    const key = parsePEM(TEMP_KEY_PATH, 'key');

    expect(cert).toMatch(CERT_CONTENT);
    expect(key).toMatch(KEY_CONTENT);
  });

  it('Can load single-line certificate strings', async () => {
    const SINGLE_LINE_CERT = CERT_CONTENT.replace(/\n/g, '\\n');
    const SINGLE_LINE_KEY = KEY_CONTENT.replace(/\n/g, '\\n');

    const cert = parsePEM(SINGLE_LINE_CERT, 'certificate');
    const key = parsePEM(SINGLE_LINE_KEY, 'key');

    expect(cert).toMatch(CERT_CONTENT);
    expect(key).toMatch(KEY_CONTENT);
  });

  it('Can load base64 encoded certificate strings', async () => {
    const cert = parsePEM(Buffer.from(CERT_CONTENT).toString('base64'), 'certificate');
    const key = parsePEM(Buffer.from(KEY_CONTENT).toString('base64'), 'key');

    expect(cert).toMatch(CERT_CONTENT);
    expect(key).toMatch(KEY_CONTENT);
  });

  it('Can make payment with multiline certificate strings', async () => {
    const cert = parsePEM(CERT_CONTENT, 'certificate');
    const key = parsePEM(KEY_CONTENT, 'key');

    expect(cert).toMatch(CERT_CONTENT);
    expect(key).toMatch(KEY_CONTENT);
  });

  it('Should fail gracefully with invalid certificate path', () => {
    try {
      parsePEM('nonexistent/path/cert.crt', 'certificate');
      parsePEM('nonexistent/path/key.key', 'key');

      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error instanceof PEMError).toBe(true);
    }
  });

  it('Should fail gracefully with invalid certificate content', () => {
    try {
      parsePEM('INVALID_CERTIFICATE_CONTENT', 'certificate');
      parsePEM('INVALID_KEY_CONTENT', 'key');

      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error instanceof PEMError).toBe(true);
    }
  });
});
