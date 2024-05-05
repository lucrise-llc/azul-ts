import path from 'path';
import fs from 'fs/promises';
import { request, Agent } from 'undici';
import { capitalizeKeys } from '../utils';
import { Process } from './processes';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

enum AzulURL {
  DEV = 'https://pruebas.azul.com.do/webservices/JSON/Default.aspx',
  PROD = 'https://pagos.azul.com.do/webservices/JSON/Default.aspx'
}

export type Config = {
  auth1: string;
  auth2: string;
  merchantId: string;
  certificatePath: string;
  keyPath: string;
  environment?: 'dev' | 'prod';
  channel?: string;
};

class AzulRequester {
  public readonly url: string;

  private auth1: string;
  private auth2: string;
  private channel: string;
  private merchantId: string;
  private certificatePath: string;
  private keyPath: string;
  private certificate: Buffer | undefined;
  private certificateKey: Buffer | undefined;

  constructor(config: Config) {
    this.auth1 = config.auth1;
    this.auth2 = config.auth2;
    this.merchantId = config.merchantId;
    this.certificatePath = config.certificatePath;
    this.keyPath = config.keyPath;

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
      body: JSON.stringify(
        capitalizeKeys({
          channel: this.channel,
          store: this.merchantId,
          ...body
        })
      )
    });

    return (await response.body.json()) as any;
  }

  private async getCertificates(): Promise<{ cert: Buffer; key: Buffer }> {
    if (this.certificate && this.certificateKey) {
      return {
        cert: this.certificate,
        key: this.certificateKey
      };
    }

    this.certificate = await fs.readFile(path.resolve(__dirname, this.certificatePath));
    this.certificateKey = await fs.readFile(path.resolve(__dirname, this.keyPath));

    return {
      cert: this.certificate,
      key: this.certificateKey
    };
  }
}

export default AzulRequester;
