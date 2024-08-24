import { request, Agent } from 'undici';
import { capitalizeKeys } from '../utils';
import { Process } from './processes';

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
  }

  async safeRequest(body: any, process?: Process) {
    let url = this.url;

    if (process) {
      url = url + '?' + process;
    }

    const { cert, key } = await this.getCertificates();

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
      dispatcher: new Agent({
        connect: {
          cert,
          key
        }
      }),
      body: JSON.stringify(requestBody)
    });

    return (await response.body.json()) as any;
  }

  private async getCertificates(): Promise<{ cert: string; key: string }> {
    if (!this.certificate || !this.key) {
      throw new Error('Missing certificate or key');
    }

    return {
      cert: this.certificate,
      key: this.key
    };
  }
}

export default AzulRequester;
