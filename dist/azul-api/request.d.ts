import { Process } from './processes';
export type Config = {
  auth1: string;
  auth2: string;
  merchantId: string;
  certificatePath: string;
  keyPath: string;
  environment?: 'dev' | 'prod';
  channel?: string;
};
declare class AzulRequester {
  readonly url: string;
  private auth1;
  private auth2;
  private channel;
  private merchantId;
  private certificatePath;
  private keyPath;
  private certificate;
  private certificateKey;
  constructor(config: Config);
  safeRequest(body: any, process?: Process): Promise<any>;
  private getCertificates;
}
export default AzulRequester;
//# sourceMappingURL=request.d.ts.map
