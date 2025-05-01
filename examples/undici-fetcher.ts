import { fetch, Agent } from 'undici';

import { Fetcher, RequestOptions } from '../src/fetch';
import { parsePEM } from '../src/parse-certificate/parse-certificate';

export function undiciFetcher(input: { cert: string; key: string }): Fetcher {
  const key = parsePEM(input.key, 'key');
  const cert = parsePEM(input.cert, 'certificate');

  const agent = new Agent({
    connect: {
      cert: cert,
      key: key
    }
  });

  return async (input: string, init?: RequestOptions): Promise<unknown> => {
    const response = await fetch(input, {
      ...init,
      dispatcher: agent
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Did not receive JSON, instead received: ' + text);
    }
  };
}
