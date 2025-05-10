import EventEmitter from 'node:events';
import { request, Agent, Dispatcher } from 'undici';

import { capitalizeKeys } from './utils/capitalize';

enum AzulURL {
  DEVELOPMENT = 'https://pruebas.azul.com.do/webservices/JSON/Default.aspx',
  PRODUCTION = 'https://pagos.azul.com.do/webservices/JSON/Default.aspx'
}

export type Configuration = {
  auth1: string;
  auth2: string;
  merchantId: string;
  certificate: string;
  key: string;
  channel: string;
  environment: 'development' | 'production';
};

class AzulRequester {
  public readonly url: string;
  private readonly agent: Agent;
  private readonly eventEmitter: EventEmitter;
  private readonly configuration: Configuration;

  constructor(configuration: Configuration, eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
    this.configuration = configuration;

    if (configuration.environment === 'production') {
      this.url = AzulURL.PRODUCTION;
    } else {
      this.url = AzulURL.DEVELOPMENT;
    }

    this.agent = new Agent({
      connect: {
        cert: configuration.certificate,
        key: configuration.key
      }
    });
  }

  async request({ body, url }: { body: Record<string, unknown>; url: string }): Promise<unknown> {
    const requestBody = capitalizeKeys({
      channel: this.configuration.channel,
      store: this.configuration.merchantId,
      ...body
    });

    this.eventEmitter.emit('request', { url, requestBody });

    const response = await request(url, {
      method: 'POST',
      headers: {
        Auth1: this.configuration.auth1,
        Auth2: this.configuration.auth2,
        'Content-Type': 'application/json'
      },
      dispatcher: this.agent,
      body: JSON.stringify(requestBody)
    });

    const responseBody = await parseJSON(response);

    this.eventEmitter.emit('response', { url, responseBody });

    return responseBody;
  }
}

async function parseJSON(response: Dispatcher.ResponseData): Promise<unknown> {
  const text = await response.body.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Did not receive JSON, instead received: ' + text);
  }
}

export default AzulRequester;
