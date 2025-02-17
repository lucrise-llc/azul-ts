import { sale } from './sale/sale';
import { post } from './post/post';
import { hold } from './hold/hold';
import { search } from './search/search';
import { refund } from './refund/refund';
import { verify } from './verify/verify';
import { PostRequest } from './post/schemas';
import { voidTransaction } from './void/void';
import DataVault from './data-vault/data-vault';
import AzulRequester, { Config } from './request';
import { VerifyResponse } from './verify/schemas';
import { SaleRequest, SaleResponse } from './sale/schemas';
import { SearchRequest, SearchResponse } from './search/schemas';
import { parsePEM } from './parse-certificate/parse-certificate';
import { RefundRequestInput, RefundResponse } from './refund/schemas';

export class Azul {
  public readonly vault: DataVault;
  protected readonly requester: AzulRequester;

  constructor(config: Config) {
    config.key = parsePEM(config.key, 'key');
    config.certificate = parsePEM(config.certificate, 'certificate');

    this.requester = new AzulRequester(config);
    this.vault = new DataVault(this.requester);
  }

  async sale(input: SaleRequest): Promise<SaleResponse> {
    return sale(input, this.requester);
  }

  async post(input: PostRequest): Promise<SaleResponse> {
    return post(input, this.requester);
  }

  async void(azulOrderId: string): Promise<SaleResponse> {
    return voidTransaction(azulOrderId, this.requester);
  }

  async verify(customOrderId: string): Promise<VerifyResponse> {
    return verify(customOrderId, this.requester);
  }

  async search(input: SearchRequest): Promise<SearchResponse> {
    return search(input, this.requester);
  }

  async refund(input: RefundRequestInput): Promise<RefundResponse> {
    return refund(input, this.requester);
  }

  async hold(input: SaleRequest): Promise<SaleResponse> {
    return hold(input, this.requester);
  }
}
