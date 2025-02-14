import { request, Agent } from 'undici';

import { capitalizeKeys } from './utils';

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

  constructor(config: Config) {
    this.auth1 = config.auth1;
    this.auth2 = config.auth2;
    this.merchantId = config.merchantId;
    this.certificate = config.certificate;
    this.key = config.key;

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

  async safeRequest(body: Record<string, unknown>, process?: string): Promise<unknown> {
    let url = this.url;

    if (process) {
      url = url + '?' + process;
    }

    const requestBody = capitalizeKeys({
      channel: this.channel,
      store: this.merchantId,
      ...body
    });

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

    const json = await response.body.json();
    return json;
  }
}

export default AzulRequester;
