import { randomUUID } from 'crypto';

import { Azul } from '../api';
import { Config } from '../request';
import { processThreeDSMethod } from './method';
import { processThreeDSChallenge } from './challenge';
import { ThreeDSChallengeResponse, ThreeDSMethodResponse } from './schemas';
import { SuccessfulSaleResponse, ErrorSaleResponse } from '../sale/schemas';
import { secureSale, SecureSaleRequest, secureSaleRequestSchema } from './sale';

export type SecureConfig = Config & {
  processMethodBaseUrl: string;
  processChallengeBaseUrl: string;
};

type ThreeDSChallengeResponseWithForm = ThreeDSChallengeResponse & {
  form: string;
};

export class AzulSecure extends Azul {
  private readonly storage = new Map<string, string>();
  public processMethodBaseUrl: string;
  public processChallengeBaseUrl: string;

  constructor(config: SecureConfig) {
    super(config);
    this.processMethodBaseUrl = config.processMethodBaseUrl;
    this.processChallengeBaseUrl = config.processChallengeBaseUrl;
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
      this.storage.set(secureId, response.AzulOrderId);
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
    const azulOrderId = this.storage.get(input.secureId);

    if (!azulOrderId) {
      throw new Error('Secure ID not found');
    }

    const response = await processThreeDSChallenge({
      input: {
        requester: this.requester,
        body: {
          azulOrderId,
          CRes: input.CRes
        }
      },
      idempotencyKey: `process-challenge-${input.secureId}`
    });

    this.storage.delete(input.secureId);
    return response;
  }

  async processMethod({
    secureId
  }: {
    secureId: string;
  }): Promise<SuccessfulSaleResponse | ThreeDSChallengeResponseWithForm | ErrorSaleResponse> {
    const azulOrderId = this.storage.get(secureId);

    if (!azulOrderId) {
      throw new Error('Secure ID not found');
    }

    const response = await processThreeDSMethod({
      input: {
        azulOrderId,
        requester: this.requester
      },
      idempotencyKey: `process-method-${secureId}`
    });

    if (response.type === 'success' || response.type === 'error') {
      this.storage.delete(secureId);
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
