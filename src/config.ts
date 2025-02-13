/**
 * Configuration manager for environment variables with fallbacks
 * Loads variables from process.env or .env file
 */
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve, isAbsolute } from 'path';

// Load .env file into process.env
config();

/**
 * Get environment variable with fallback
 * @param key - Environment variable key
 * @param defaultValue - Optional fallback value
 * @throws Error if variable is not found and no default is provided
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;

  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not defined`);
  }

  return value;
}

/**
 * Get certificate content from various formats
 * @param value - File path, PEM content, or base64 encoded certificate
 * @returns Certificate content as string
 */
export function getCertificate(value: string): string {
  // Remove any surrounding quotes and handle escaped newlines
  const cleanValue = value.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');

  // Check if it's a PEM certificate
  if (cleanValue.startsWith('-----BEGIN')) {
    return cleanValue;
  }

  // Check if it's base64 encoded (try to decode and check if it's a PEM)
  try {
    const decoded = Buffer.from(cleanValue, 'base64').toString();
    if (decoded.startsWith('-----BEGIN')) {
      return decoded;
    }
  } catch {
    // Not base64, continue to file handling
  }

  // Try to read it as a file
  try {
    // Use isAbsolute to check if the path is absolute
    const filePath = isAbsolute(cleanValue) ? cleanValue : resolve(process.cwd(), cleanValue);
    const fileContent = readFileSync(filePath, 'utf8');

    // Validate that the file content is a PEM certificate
    if (!fileContent.startsWith('-----BEGIN')) {
      throw new Error('Invalid certificate format: File does not contain a valid PEM certificate');
    }
    return fileContent;
  } catch (error) {
    // Wrap both file reading errors and PEM validation errors
    if (error instanceof Error) {
      throw new Error(`Certificate error: ${error.message}`);
    }
    throw new Error('Unknown error reading certificate');
  }
}

export const CONFIG = {
  auth1: getEnvVar('AUTH1'),
  auth2: getEnvVar('AUTH2'),
  merchantId: getEnvVar('MERCHANT_ID'),
  // Handle certificates that could be file paths, PEM content, or base64
  certificate: getCertificate(getEnvVar('AZUL_CERT')),
  key: getCertificate(getEnvVar('AZUL_KEY'))
} as const;

// Type for the config object
export type Config = typeof CONFIG;
