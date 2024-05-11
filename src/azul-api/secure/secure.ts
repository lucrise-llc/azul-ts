import { randomUUID } from 'crypto';
import { ProcessPaymentTransaction } from '../process-payment/process-payment';
import { ProcessPaymentSchema, ProcessPaymentSchemaInput } from '../process-payment/schemas';
import { Process } from '../processes';
import AzulRequester from '../request';
import { BrowserInfo, CardHolderInfo, MethodNotificationStatus, ThreeDSAuth } from './types';
import { sleep } from '../../utils';

export class Secure {
  private readonly requester: AzulRequester;
  private secureIdToAzulOrderId = new Map<string, string>();

  constructor(requester: AzulRequester) {
    this.requester = requester;
  }

  async sale(
    input: ProcessPaymentSchemaInput & {
      cardHolderInfo: CardHolderInfo;
      browserInfo: BrowserInfo;
      threeDSAuth: ThreeDSAuth;
    } & {
      useIframe?: boolean;
    }
  ): Promise<
    | {
        ok: true;
        value: string;
      }
    | {
        ok: false;
        value: any;
      }
  > {
    const secureId = randomUUID();

    const result = await this.requester.safeRequest({
      ...ProcessPaymentSchema.parse(input),
      forceNo3DS: '0',
      cardHolderInfo: input.cardHolderInfo,
      browserInfo: input.browserInfo,
      threeDSAuth: {
        ...input.threeDSAuth,
        TermUrl: input.threeDSAuth.TermUrl + `?id=${secureId}`,
        MethodNotificationUrl: input.threeDSAuth.MethodNotificationUrl + `?id=${secureId}`
      },
      trxType: ProcessPaymentTransaction.SALE
    });

    if (result.ResponseMessage === '3D_SECURE_CHALLENGE') {
      this.secureIdToAzulOrderId.set(secureId, result.AzulOrderId);

      return {
        ok: true,
        value: challengeResponse({
          termUrl: input.threeDSAuth.TermUrl,
          creq: result.ThreeDSChallenge.CReq,
          redirectPostUrl: result.ThreeDSChallenge.RedirectPostUrl
        })
      };
    } else if (result.ResponseMessage === '3D_SECURE_2_METHOD') {
      this.secureIdToAzulOrderId.set(secureId, result.AzulOrderId);

      let form: string = result.ThreeDSMethod.MethodForm;

      if (!input.useIframe) {
        form = form.replace('target=', '');
      }

      return {
        ok: true,
        value: form
      };
    } else {
      return {
        ok: false,
        value: result
      };
    }
  }

  async process3DS(input: {
    azulOrderId: string;
    methodNotificationStatus: MethodNotificationStatus;
  }) {
    return await this.requester.safeRequest(
      {
        azulOrderId: input.azulOrderId,
        methodNotificationStatus: input.methodNotificationStatus
      },
      Process.Process3DsMethod
    );
  }

  async process3DsChallenge(input: { azulOrderId: string; cRes: string }) {
    return await this.requester.safeRequest(
      {
        azulOrderId: input.azulOrderId,
        cRes: input.cRes
      },
      Process.Process3DsChallenge
    );
  }

  async post3DS(id: string, cRes: string) {
    const azulOrderId = this.secureIdToAzulOrderId.get(id);

    if (typeof azulOrderId !== 'string') {
      throw new Error('Invalid ID');
    }

    return await this.process3DsChallenge({
      azulOrderId,
      cRes
    });
  }

  async capture3DS(id: string): Promise<string> {
    if (!this.secureIdToAzulOrderId.has(id)) {
      throw new Error('Invalid ID');
    }

    const process3DResult = await this.get3DResult(id);

    if (process3DResult.ResponseMessage === '3D_SECURE_CHALLENGE') {
      return challengeResponse({
        creq: process3DResult.ThreeDSChallenge.CReq,
        termUrl: 'http://localhost:3000/post-3ds?id=' + id,
        redirectPostUrl: process3DResult.ThreeDSChallenge.RedirectPostUrl
      });
    }

    return process3DResult;
  }

  private processResult = new Map<string, any>();
  private processLoading = new Map<string, boolean>();

  private async get3DResult(id: string) {
    // If we already have the result, return it
    if (this.processResult.has(id)) {
      return this.processResult.get(id);
    }

    // If we are already processing the result, wait for it to finish
    if (this.processLoading.get(id)) {
      while (this.processLoading.get(id)) {
        await sleep(100);
      }

      return this.processResult.get(id);
    }

    // Otherwise, start processing the result
    this.processLoading.set(id, true);
    const result = await this.process3DS({
      azulOrderId: this.secureIdToAzulOrderId.get(id)!,
      methodNotificationStatus: MethodNotificationStatus.RECEIVED
    });
    this.processLoading.set(id, false);

    this.processResult.set(id, result);
    return result;
  }
}

function challengeResponse({
  creq,
  termUrl,
  redirectPostUrl
}: {
  creq: string;
  termUrl: string;
  redirectPostUrl: string;
}) {
  return `
  <form action="${redirectPostUrl}" method="POST">
    <input type="hidden" name="creq" value="${creq}" />
    <input type="hidden" name="TermUrl" value="${termUrl}" />
    <script>
      window.onload = function() {
        document.forms[0].submit();
      }
    </script>
  </form>`;
}
