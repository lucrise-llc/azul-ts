import {
  PostSchema,
  PostSchemaInput,
  SearchResponse,
  SearchSchema,
  SearchSchemaInput
} from './schemas';
import AzulRequester, { Config } from './request';
import DataVault from './data-vault/data-vault';
import ProcessPayment from './process-payment/process-payment';
import { ProcessPaymentResponse } from './process-payment/types';
import { Process } from './processes';
import { Secure } from './secure/secure';
import { getCertificate } from '../config';

class AzulAPI {
  private requester: AzulRequester;

  public vault: DataVault;
  public payments: ProcessPayment;
  public secure: Secure;
  public certificate: string;
  public key: string;

  constructor(config: Config) {
    try {
      const validatedConfig = {
        ...config,
        certificate: getCertificate(config.certificate),
        key: getCertificate(config.key)
      };

      this.requester = new AzulRequester(validatedConfig);
      this.vault = new DataVault(this.requester);
      this.payments = new ProcessPayment(this.requester);
      this.secure = new Secure(this.requester);
      this.certificate = validatedConfig.certificate;
      this.key = validatedConfig.key;
    } catch (error) {
      throw new Error(
        `Certificate error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * ### Transacción para anular venta, post o hold
   * Las transacciones de venta o post se pueden anular antes de los 20 minutos de haber
   * recibido la respuesta de aprobación.
   * Las transacciones de hold que no han sido posteadas no tienen límite de tiempo para
   * anularse.
   */
  async void(azulOrderId: string): Promise<ProcessPaymentResponse> {
    return await this.requester.safeRequest({ azulOrderId }, Process.Void);
  }

  /**
   * ### Transacción para hacer captura o posteo del Hold
   * El método "Post" permite capturar un "Hold" realizado previamente para su liquidación.
   * El monto del "Post" puede ser igual o menor al monto del "Hold". En caso de que el
   * monto del Post sea menor al Hold, se envía un mensaje de reverso para liberar los
   * fondos retenidos a la tarjeta.
   */
  async post(input: PostSchemaInput): Promise<ProcessPaymentResponse> {
    return await this.requester.safeRequest(PostSchema.parse(input), Process.Post);
  }

  /**
   * Método VerifyPayment
   * Este método permite verificar la respuesta enviada por el webservice de una
   * transacción anterior (procesada por el método ProccesPayment) identificada por el
   * campo CustomOrderId.
   * Si existe más de una transacción con este identificador este método devolverá los
   * valores de la última transacción (más reciente) de ellas.
   */
  async verifyPayment(customOrderId: string): Promise<
    ProcessPaymentResponse & {
      Found?: boolean;
      TransactionType?: string;
    }
  > {
    return await this.requester.safeRequest({ customOrderId }, Process.VerifyPayment);
  }

  /**
   * Este método permite extraer los detalles de una o varias transacciones
   * vía Webservices, anteriormente procesadas de un rango de fechas
   * previamente seleccionado.
   */
  async search(input: SearchSchemaInput): Promise<SearchResponse> {
    return await this.requester.safeRequest(SearchSchema.parse(input), Process.SearchPayments);
  }
}

export default AzulAPI;
