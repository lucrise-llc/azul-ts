import { randomUUID } from 'crypto';
import { ProcessPaymentTransaction } from '../process-payment/process-payment';
import { ProcessPaymentSchema } from '../process-payment/schemas';
import { Process } from '../processes';
import AzulRequester from '../request';
import { MethodNotificationStatus, SecureSale } from './types';
import { sleep } from '../../utils';

/**
 * Represents a secure payment session with Azul.
 */
type SecurePaymentSession = {
  azulOrderId: string;
  termUrl: string;
  methodNotificationUrl: string;
};

/**
 * Class to handle secure payment operations with Azul, including 3DS authentication.
 */
export class Secure {
  private readonly requester: AzulRequester;
  /**
   * Stores active secure payment sessions, keyed by a unique secure ID.
   * @private
   */
  private securePaymentSessions = new Map<string, SecurePaymentSession>();

  /**
   * Stores the results of 3DS Method processing, keyed by secure ID.
   * @private
   */
  private processResult = new Map<string, any>();

  /**
   * Tracks whether 3DS Method processing is in progress for a given secure ID.
   * @private
   */
  private processLoading = new Map<string, boolean>();

  /**
   * Creates an instance of the `Secure` class.
   * @param requester - The AzulRequester instance used for making API requests.
   */
  constructor(requester: AzulRequester) {
    this.requester = requester;
  }

  async sale(input: SecureSale): Promise<
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
      forceNo3DS: input.forceNo3DS ?? '0',
      cardHolderInfo: input.cardHolderInfo,
      threeDSAuth: {
        ...input.threeDSAuth,
        TermUrl: input.threeDSAuth.TermUrl.includes('?')
          ? input.threeDSAuth.TermUrl + `&id=${secureId}`
          : input.threeDSAuth.TermUrl + `?id=${secureId}`,
        MethodNotificationUrl: input.threeDSAuth.MethodNotificationUrl.includes('?')
          ? input.threeDSAuth.MethodNotificationUrl + `&id=${secureId}`
          : input.threeDSAuth.MethodNotificationUrl + `?id=${secureId}`
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

  /**
   * Processes the 3DS Method notification status with Azul.
   * @param input - An object containing the Azul Order ID and the method notification status.
   * @returns A promise that resolves to the result of the API request.
   */
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

  /**
   * Handles the 3DS challenge response (cRes) from the client.
   * @param id - The unique secure ID associated with the transaction.
   * @param cRes - The challenge response string.
   * @returns A promise that resolves to the result of processing the challenge.
   * @throws {Error} If the provided ID is invalid.
   */
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

  /**
   * Sends the 3DS challenge response to Azul.
   * @param input - An object containing the Azul Order ID and the challenge response.
   * @returns A promise that resolves to the result of the API request.
   * @private
   */
  private async process3DsChallenge(input: { azulOrderId: string; cRes: string }) {
    return await this.requester.safeRequest(
      {
        azulOrderId: input.azulOrderId,
        cRes: input.cRes
      },
      Process.Process3DsChallenge
    );
  }

  /**
   * Captures the 3DS result after the method and challenge phases (if applicable).
   * @param id - The unique secure ID associated with the transaction.
   * @returns A promise that resolves to an object indicating whether a redirect is required,
   * along with the redirect HTML content (if a challenge is needed), or the final transaction result.
   * @throws {Error} If the provided ID is invalid.
   */
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

  /**
   * Retrieves the 3DS result, handling the asynchronous nature of the 3DS Method Notification.
   * Implements a 10-second timeout for receiving the Method Notification, as required by Azul.
   *
   * @param id - The unique secure ID associated with the transaction.
   * @returns A promise that resolves to the 3DS result.  If the Method Notification is not
   *  received within 10 seconds, the `methodNotificationStatus` is set to
   *  `EXPECTED_BUT_NOT_RECEIVED`.
   * @private
   */
  private async get3DResult(id: string) {
    // If we already have the result, return it
    if (this.processResult.has(id)) {
      return this.processResult.get(id);
    }

    // If we are already processing the result, wait for it to finish, or timeout
    if (this.processLoading.get(id)) {
      // Use Promise.race to implement the timeout
      const result = await Promise.race([
        (async () => {
          while (this.processLoading.get(id)) {
            await sleep(100);
          }
          return this.processResult.get(id);
        })(),
        (async () => {
          await sleep(10000); // 10-second timeout
          return { timeout: true }; // Indicate timeout
        })()
      ]);

      // Check if the result is due to a timeout
      if (result && typeof result === 'object' && 'timeout' in result && result.timeout) {
        // Handle timeout: set status to EXPECTED_BUT_NOT_RECEIVED
        this.processLoading.set(id, true); // Start processing (even though it timed out)
        const azulOrderId = this.securePaymentSessions.get(id)!.azulOrderId;
        const timeoutResult = await this.process3DS({
          azulOrderId,
          methodNotificationStatus: MethodNotificationStatus.EXPECTED_BUT_NOT_RECEIVED
        });
        this.processLoading.set(id, false);
        this.processResult.set(id, timeoutResult);
        return timeoutResult;
      } else {
        // Notification received within timeout, return the actual result
        return result;
      }
    }

    // Otherwise, start processing the result (notification received before get3DResult called)
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

/**
 * Generates the HTML for the 3DS challenge form.
 * @param creq - The challenge request data.
 * @param termUrl - The URL to which the challenge result should be posted.
 * @param redirectPostUrl - The URL to which the form should be submitted.
 * @returns The HTML string for the challenge form.
 */
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
