import { randomUUID } from 'crypto';

import { SaleResponse } from '../sale/schemas';
import { processThreeDSMethod } from './method';
import AzulRequester, { Config } from '../request';
import { assertNever } from '../utils/assert-never';
import { ThreeDSChallengeResponse } from './schemas';
import { processThreeDSChallenge } from './challenge';
import { parsePEM } from '../parse-certificate/parse-certificate';
import { secureSale, SecureSaleRequest, secureSaleRequestSchema } from './sale';

type SuccessResponse = {
  type: 'success';
  azulOrderId: string;
};

type ChallengeResponse = {
  type: 'challenge';
  form: string;
};

type MethodResponse = {
  type: 'method';
  form: string;
};

type ErrorResponse = {
  type: 'error';
  error: string;
};

export type SecureConfig = Config & {
  processMethodBaseUrl: string;
  processChallengeBaseUrl: string;
};

export class AzulSecure {
  private readonly storage = new Map<string, string>();
  public processMethodBaseUrl: string;
  public processChallengeBaseUrl: string;
  public requester: AzulRequester;

  constructor(config: SecureConfig) {
    config.key = parsePEM(config.key, 'key');
    config.certificate = parsePEM(config.certificate, 'certificate');

    this.requester = new AzulRequester(config);
    this.processMethodBaseUrl = config.processMethodBaseUrl;
    this.processChallengeBaseUrl = config.processChallengeBaseUrl;
  }

  async secureSale(
    input: SecureSaleRequest
  ): Promise<SuccessResponse | ChallengeResponse | MethodResponse | ErrorResponse> {
    const secureId = randomUUID();
    const parsedInput = secureSaleRequestSchema.parse(input);

    const result = await secureSale({
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

    switch (result.type) {
      case 'success':
        await this.storage.delete(secureId);

        return {
          type: 'success',
          azulOrderId: result.AzulOrderId
        };

      case 'challenge':
        this.storage.set(secureId, result.AzulOrderId);

        return {
          type: 'challenge',
          form: this.generateThreeDSChallengeResponseForm({
            response: result,
            secureId
          })
        };

      case 'method':
        this.storage.set(secureId, result.AzulOrderId);

        return {
          type: 'method',
          form: result.ThreeDSMethod.MethodForm.replace('target', '')
        };

      case 'error':
        await this.storage.delete(secureId);

        return {
          type: 'error',
          error: result.ErrorDescription
        };

      default:
        assertNever(result);
    }
  }

  async processChallenge(input: { CRes: string; secureId: string }): Promise<SaleResponse> {
    const azulOrderId = await this.storage.get(input.secureId);

    if (!azulOrderId) {
      throw new Error('Secure ID not found');
    }

    return processThreeDSChallenge({
      input: {
        requester: this.requester,
        body: {
          azulOrderId,
          CRes: input.CRes
        }
      },
      idempotencyKey: `process-challenge-${input.secureId}`
    });
  }

  async processMethod({
    secureId
  }: {
    secureId: string;
  }): Promise<SuccessResponse | ChallengeResponse | ErrorResponse> {
    const azulOrderId = await this.storage.get(secureId);

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

    switch (response.type) {
      case 'success':
        await this.storage.delete(secureId);
        return {
          type: 'success',
          azulOrderId: response.AzulOrderId
        };

      case 'challenge':
        return {
          type: 'challenge',
          form: this.generateThreeDSChallengeResponseForm({
            response,
            secureId
          })
        };

      case 'error':
        return {
          type: 'error',
          error: response.ErrorDescription
        };

      default:
        assertNever(response);
    }
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
