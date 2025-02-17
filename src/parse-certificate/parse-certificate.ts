import { resolve } from 'path';
import { readFileSync } from 'fs';

/**
 * PEM format headers and footers
 */
type PEMType = 'certificate' | 'key';

/**
 * PEM Error class
 */
export class PEMError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PEMError';
  }
}

/**
 * Parses a PEM format string from various input formats
 * @param input - Raw input string that could be PEM, base64, or file path
 * @param type - Type of PEM content expected ('certificate' or 'key')
 * @returns Parsed PEM string in standard format
 * @throws PEMError if input is not a valid PEM format
 */
export function parsePEM(input: string, type: PEMType): string {
  const value = normalizeInput(input);

  // Try direct PEM format
  if (isValidPEM(value, type)) {
    return value;
  }

  // Try base64 decode
  const decoded = decodeBase64(value);
  if (decoded && isValidPEM(decoded, type)) {
    return decoded;
  }

  // Try file path
  const fileContent = readPEMFile(value);
  if (fileContent && isValidPEM(fileContent, type)) {
    return fileContent;
  }

  throw new PEMError(`Invalid ${type} format: Not a valid PEM ${type}. Input: ${input}`);
}

/**
 * Normalizes input string by removing quotes and converting escaped newlines
 */
function normalizeInput(input: string): string {
  return input
    .trim()
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .replace(/\\n/g, '\n'); // Convert escaped newlines
}

/**
 * Reads PEM content from a file
 * @returns File content or null if file cannot be read
 */
function readPEMFile(filePath: string): string | null {
  try {
    const absolutePath = resolve(process.cwd(), filePath);
    return readFileSync(absolutePath, 'utf8');
  } catch (error) {
    if (error instanceof Error) {
      console.debug(`Failed to read PEM file: ${error.message}`);
    }
    return null;
  }
}

/**
 * Attempts to decode a base64 string
 * @returns Decoded string or null if decoding fails
 */
function decodeBase64(value: string): string | null {
  try {
    return Buffer.from(value, 'base64').toString();
  } catch (error) {
    if (error instanceof Error) {
      console.debug(`Failed to decode base64: ${error.message}`);
    }
    return null;
  }
}

/**
 * PEM format header and footer
 */
const PEM_MARKERS = {
  certificate: {
    begin: '-----BEGIN CERTIFICATE-----',
    end: '-----END CERTIFICATE-----'
  },
  key: {
    begin: '-----BEGIN PRIVATE KEY-----',
    end: '-----END PRIVATE KEY-----'
  }
} as const;

/**
 * Validates if a string is in correct PEM format for the specified type
 */
function isValidPEM(value: string, type: PEMType): boolean {
  const markers = PEM_MARKERS[type];
  return value.startsWith(markers.begin) && value.endsWith(markers.end);
}
