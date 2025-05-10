import { randomUUID } from 'crypto';

import type { Configuration } from '../request';
import type { Storage } from '../utils/storage';
import type { SaleResponse } from '../sale/schemas';
import type { SecureSaleRequest, SecureSaleResponse } from './sale';
import type { ThreeDSChallengeResponse, ThreeDSMethodResponse } from './schemas';

import { Azul } from '../api';
import { processThreeDSChallenge } from './challenge';
import { callIdempotent } from '../utils/call-idempotent';
import { secureSale, secureSaleRequestSchema } from './sale';
import { processThreeDSMethod, ProcessThreeDSMethodResponse } from './method';

type SecureConfiguration = Configuration & {
  storage: Storage;
  processMethodURL: string;
  processChallengeURL: string;
};

const secureIdPrefix = 'secure-id';

export class AzulSecure extends Azul {
  private readonly storage: Storage;
  private readonly processMethodURL: string;
  private readonly processChallengeURL: string;

  constructor(configuration: SecureConfiguration) {
    super(configuration);
    this.storage = configuration.storage;
    this.processMethodURL = configuration.processMethodURL;
    this.processChallengeURL = configuration.processChallengeURL;
  }

  async secureSale(input: SecureSaleRequest): Promise<SecureSaleResponse> {
    const secureId = input.secureId ? input.secureId : randomUUID();
    const parsedInput = secureSaleRequestSchema.parse(input);

    const response = await secureSale({
      input: {
        ...parsedInput,
        ThreeDSAuth: {
          TermUrl: `${this.processChallengeURL}?secureId=${secureId}`,
          MethodNotificationUrl: `${this.processMethodURL}?secureId=${secureId}`,
          ...parsedInput.ThreeDSAuth
        }
      },
      requester: this.requester
    });

    if (response.type === 'challenge' || response.type === 'method') {
      await this.storage.set(`${secureIdPrefix}:${secureId}`, response.AzulOrderId);
    }

    return response;
  }

  async processChallenge(input: { CRes: string; secureId: string }): Promise<SaleResponse> {
    const azulOrderId = await this.storage.get(`${secureIdPrefix}:${input.secureId}`);

    if (!azulOrderId) {
      throw new Error('Secure ID not found');
    }

    const response = await callIdempotent({
      storage: this.storage,
      fn: processThreeDSChallenge,
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

  async processMethod({ secureId }: { secureId: string }): Promise<ProcessThreeDSMethodResponse> {
    const azulOrderId = await this.storage.get(`${secureIdPrefix}:${secureId}`);

    if (!azulOrderId) {
      throw new Error('Secure ID not found');
    }

    const response = await callIdempotent({
      storage: this.storage,
      fn: processThreeDSMethod,
      input: {
        azulOrderId,
        requester: this.requester
      },
      idempotencyKey: `process-method-${secureId}`
    });

    if (response.type === 'success' || response.type === 'error') {
      await this.storage.delete(`${secureIdPrefix}:${secureId}`);
    }

    return response;
  }

  public generateMethodForm(response: ThreeDSMethodResponse): string {
    return response.ThreeDSMethod.MethodForm.replace('target', '');
  }

  public generateChallengeForm({
    response,
    secureId
  }: {
    response: ThreeDSChallengeResponse;
    secureId: string;
  }): string {
    return `
    <form action="${response.ThreeDSChallenge.RedirectPostUrl}" method="POST">
      <input type="hidden" name="creq" value="${response.ThreeDSChallenge.CReq}" />
      <input type="hidden" name="TermUrl" value="${`${this.processChallengeURL}?secureId=${secureId}`}" />
      <script>
        window.onload = function() {
          document.forms[0].submit();
        }
      </script>
    </form>`;
  }
}
