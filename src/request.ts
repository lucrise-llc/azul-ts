import EventEmitter from 'node:events';

import { capitalizeKeys } from './utils/capitalize';

enum AzulURL {
  DEV = 'https://pruebas.azul.com.do/webservices/JSON/Default.aspx',
  PROD = 'https://pagos.azul.com.do/webservices/JSON/Default.aspx'
}

export type Config = {
  auth1: string;
  auth2: string;
  merchantId: string;
  channel?: string;
  environment?: 'dev' | 'prod';
  fetch?: Fetcher;
};

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

class AzulRequester {
  public readonly url: string;

  private auth1: string;
  private auth2: string;
  private channel: string;
  private merchantId: string;
  private readonly fetch: Fetcher;
  private readonly eventEmitter: EventEmitter;

  constructor(config: Config, eventEmitter: EventEmitter) {
    this.auth1 = config.auth1;
    this.auth2 = config.auth2;
    this.merchantId = config.merchantId;
    this.eventEmitter = eventEmitter;
    this.fetch = config.fetch || fetch;

    if (config.channel === undefined) {
      this.channel = 'EC';
    } else {
      this.channel = config.channel;
    }

    if (config.environment === undefined || config.environment === 'dev') {
      this.url = AzulURL.DEV;
    } else {
      this.url = AzulURL.PROD;
    }
  }

  async request({ body, url }: { body: Record<string, unknown>; url: string }): Promise<unknown> {
    const requestBody = capitalizeKeys({
      channel: this.channel,
      store: this.merchantId,
      ...body
    });

    this.eventEmitter.emit('request', { url, requestBody });

    const response = await this.fetch(url, {
      method: 'POST',
      headers: {
        Auth1: this.auth1,
        Auth2: this.auth2,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseBody = await parseJSON(response);

    this.eventEmitter.emit('response', { url, responseBody });

    return responseBody;
  }
}

async function parseJSON(response: Response): Promise<unknown> {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Did not receive JSON, instead received: ' + text);
  }
}

export default AzulRequester;
