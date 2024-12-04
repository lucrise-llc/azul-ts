import { randomUUID } from 'crypto';
import { ProcessPaymentTransaction } from '../process-payment/process-payment';
import { ProcessPaymentSchema, ProcessPaymentSchemaInput } from '../process-payment/schemas';
import { Process } from '../processes';
import AzulRequester from '../request';
import { BrowserInfo, CardHolderInfo, MethodNotificationStatus, ThreeDSAuth } from './types';
import { sleep } from '../../utils';

type SecurePaymentSession = {
  azulOrderId: string;
  termUrl: string;
  methodNotificationUrl: string;
};

export class Secure {
  private readonly requester: AzulRequester;
  private securePaymentSessions = new Map<string, SecurePaymentSession>();

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
        redirect: true;
        id: string;
        html: string;
      }
    | {
        redirect: false;
        id: string;
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
      this.securePaymentSessions.set(secureId, {
        azulOrderId: result.AzulOrderId,
        termUrl: input.threeDSAuth.TermUrl,
        methodNotificationUrl: input.threeDSAuth.MethodNotificationUrl
      });

      return {
        redirect: true,
        id: secureId,
        html: challengeResponse({
          termUrl: input.threeDSAuth.TermUrl,
          creq: result.ThreeDSChallenge.CReq,
          redirectPostUrl: result.ThreeDSChallenge.RedirectPostUrl
        })
      };
    } else if (result.ResponseMessage === '3D_SECURE_2_METHOD') {
      this.securePaymentSessions.set(secureId, {
        azulOrderId: result.AzulOrderId,
        termUrl: input.threeDSAuth.TermUrl,
        methodNotificationUrl: input.threeDSAuth.MethodNotificationUrl
      });

      let form: string = result.ThreeDSMethod.MethodForm;

      if (!input.useIframe) {
        form = form.replace('target=', '');
      }

      return {
        redirect: true,
        id: secureId,
        html: form
      };
    } else {
      return {
        redirect: false,
        id: secureId,
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

  async post3DS(id: string, cRes: string) {
    const session = this.securePaymentSessions.get(id);

    if (typeof session === 'undefined') {
      throw new Error('Invalid ID');
    }

    return await this.process3DsChallenge({
      azulOrderId: session.azulOrderId,
      cRes
    });
  }

  private async process3DsChallenge(input: { azulOrderId: string; cRes: string }) {
    return await this.requester.safeRequest(
      {
        azulOrderId: input.azulOrderId,
        cRes: input.cRes
      },
      Process.Process3DsChallenge
    );
  }

  async capture3DS(id: string): Promise<
    | {
        redirect: true;
        html: string;
      }
    | {
        redirect: false;
        value: any;
      }
  > {
    if (!this.securePaymentSessions.has(id)) {
      throw new Error('Invalid ID');
    }

    const process3DResult = await this.get3DResult(id);

    if (process3DResult.ResponseMessage === '3D_SECURE_CHALLENGE') {
      return {
        redirect: true,
        html: challengeResponse({
          creq: process3DResult.ThreeDSChallenge.CReq,
          termUrl: this.securePaymentSessions.get(id)!.termUrl,
          redirectPostUrl: process3DResult.ThreeDSChallenge.RedirectPostUrl
        })
      };
    }

    return {
      redirect: false,
      value: process3DResult
    };
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
      azulOrderId: this.securePaymentSessions.get(id)!.azulOrderId,
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
