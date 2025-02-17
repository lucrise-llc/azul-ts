import EventEmitter from 'events';
import { request, Agent } from 'undici';

import { capitalizeKeys } from './utils/capitalize';

enum AzulURL {
  DEV = 'https://pruebas.azul.com.do/webservices/JSON/Default.aspx',
  PROD = 'https://pagos.azul.com.do/webservices/JSON/Default.aspx'
}

export type Config = {
  auth1: string;
  auth2: string;
  merchantId: string;
  certificate: string;
  key: string;
  environment?: 'dev' | 'prod';
  channel?: string;
};

class AzulRequester {
  public readonly url: string;

  private auth1: string;
  private auth2: string;
  private channel: string;
  private merchantId: string;
  private certificate: string;
  private key: string;
  private readonly agent: Agent;
  private readonly eventEmitter: EventEmitter;

  constructor(config: Config, eventEmitter: EventEmitter) {
    this.auth1 = config.auth1;
    this.auth2 = config.auth2;
    this.merchantId = config.merchantId;
    this.certificate = config.certificate;
    this.key = config.key;
    this.eventEmitter = eventEmitter;

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

    this.agent = new Agent({
      connect: {
        cert: this.certificate,
        key: this.key
      }
    });
  }

  async request({ body, url }: { body: Record<string, unknown>; url: string }): Promise<unknown> {
    const requestBody = capitalizeKeys({
      channel: this.channel,
      store: this.merchantId,
      ...body
    });

    this.eventEmitter.emit('request', { url, requestBody });

    const response = await request(url, {
      method: 'POST',
      headers: {
        Auth1: this.auth1,
        Auth2: this.auth2,
        'Content-Type': 'application/json'
      },
      dispatcher: this.agent,
      body: JSON.stringify(requestBody)
    });

    const responseBody = await response.body.json();

    this.eventEmitter.emit('response', { url, responseBody });

    return responseBody;
  }
}

export default AzulRequester;
