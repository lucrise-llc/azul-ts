import path from 'path';
import fs from 'fs/promises';
import { request, Agent } from 'undici';
import { capitalizeKeys } from '../utils';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
var AzulURL;
(function (AzulURL) {
  AzulURL['DEV'] = 'https://pruebas.azul.com.do/webservices/JSON/Default.aspx';
  AzulURL['PROD'] = 'https://pagos.azul.com.do/webservices/JSON/Default.aspx';
})(AzulURL || (AzulURL = {}));
class AzulRequester {
  constructor(config) {
    Object.defineProperty(this, 'url', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, 'auth1', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, 'auth2', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, 'channel', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, 'merchantId', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, 'certificatePath', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, 'keyPath', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, 'certificate', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, 'certificateKey', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
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
  async safeRequest(body, process) {
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
    return await response.body.json();
  }
  async getCertificates() {
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
//# sourceMappingURL=request.js.map
