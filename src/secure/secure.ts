import { randomUUID } from 'crypto';

import { Azul } from '../api';
import { Configuration } from '../request';
import { processThreeDSMethodInternal } from './method';
import { MemoryStorage, Storage } from '../utils/storage';
import { callIdempotent } from '../utils/call-idempotent';
import { processThreeDSChallengeInternal } from './challenge';
import { ThreeDSChallengeResponse, ThreeDSMethodResponse } from './schemas';
import { SuccessfulSaleResponse, ErrorSaleResponse } from '../sale/schemas';
import { secureSale, SecureSaleRequest, secureSaleRequestSchema } from './sale';

export type SecureConfig = Configuration & {
  processMethodBaseUrl: string;
  processChallengeBaseUrl: string;
  storage?: Storage;
};

type ThreeDSChallengeResponseWithForm = ThreeDSChallengeResponse & {
  form: string;
};

const secureIdPrefix = 'secure-id';

export class AzulSecure extends Azul {
  private readonly storage: Storage;
  public processMethodBaseUrl: string;
  public processChallengeBaseUrl: string;

  constructor(config: SecureConfig) {
    super(config);
    this.processMethodBaseUrl = config.processMethodBaseUrl;
    this.processChallengeBaseUrl = config.processChallengeBaseUrl;
    this.storage = config.storage || new MemoryStorage();
  }

  async secureSale(
    input: SecureSaleRequest
  ): Promise<
    | SuccessfulSaleResponse
    | ThreeDSChallengeResponseWithForm
    | ThreeDSMethodResponse
    | ErrorSaleResponse
  > {
    const secureId = input.secureId ? input.secureId : randomUUID();
    const parsedInput = secureSaleRequestSchema.parse(input);

    const response = await secureSale({
      input: {
        ...parsedInput,
        ThreeDSAuth: {
          TermUrl: `${this.processChallengeBaseUrl}?secureId=${secureId}`,
          MethodNotificationUrl: `${this.processMethodBaseUrl}?secureId=${secureId}`,
          ...parsedInput.ThreeDSAuth
        }
      },
      requester: this.requester
    });

    if (response.type === 'challenge' || response.type === 'method') {
      await this.storage.set(`${secureIdPrefix}:${secureId}`, response.AzulOrderId);
    }

    if (response.type === 'challenge') {
      return {
        ...response,
        form: this.generateThreeDSChallengeResponseForm({ response, secureId })
      };
    }

    return response;
  }

  async processChallenge(input: {
    CRes: string;
    secureId: string;
  }): Promise<SuccessfulSaleResponse | ErrorSaleResponse> {
    const azulOrderId = await this.storage.get(`${secureIdPrefix}:${input.secureId}`);

    if (!azulOrderId) {
      throw new Error('Secure ID not found');
    }

    const response = await callIdempotent({
      storage: this.storage,
      fn: processThreeDSChallengeInternal,
      input: {
        requester: this.requester,
        body: {
          azulOrderId,
          CRes: input.CRes
        }
      },
      idempotencyKey: `process-challenge-${input.secureId}`
    });

    await this.storage.delete(`${secureIdPrefix}:${input.secureId}`);
    return response;
  }

  async processMethod({
    secureId
  }: {
    secureId: string;
  }): Promise<SuccessfulSaleResponse | ThreeDSChallengeResponseWithForm | ErrorSaleResponse> {
    const azulOrderId = await this.storage.get(`${secureIdPrefix}:${secureId}`);

    if (!azulOrderId) {
      throw new Error('Secure ID not found');
    }

    const response = await callIdempotent({
      storage: this.storage,
      fn: processThreeDSMethodInternal,
      input: {
        azulOrderId,
        requester: this.requester
      },
      idempotencyKey: `process-method-${secureId}`
    });

    if (response.type === 'success' || response.type === 'error') {
      await this.storage.delete(`${secureIdPrefix}:${secureId}`);
    }

    if (response.type === 'challenge') {
      return {
        ...response,
        form: this.generateThreeDSChallengeResponseForm({ response, secureId })
      };
    }

    return response;
  }

  private generateThreeDSChallengeResponseForm({
    response,
    secureId
  }: {
    response: ThreeDSChallengeResponse;
    secureId: string;
  }): string {
    return `
    <form action="${response.ThreeDSChallenge.RedirectPostUrl}" method="POST">
      <input type="hidden" name="creq" value="${response.ThreeDSChallenge.CReq}" />
      <input type="hidden" name="TermUrl" value="${`${this.processChallengeBaseUrl}?secureId=${secureId}`}" />
      <script>
        window.onload = function() {
          document.forms[0].submit();
        }
      </script>
    </form>`;
  }
}
