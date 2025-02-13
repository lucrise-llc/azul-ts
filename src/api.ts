import { Process } from './processes';
import { Secure } from './secure/secure';
import { parsePEM } from './parse-certificate';
import DataVault from './data-vault/data-vault';
import AzulRequester, { Config } from './request';
import ProcessPayment from './process-payment/process-payment';
import {
  PostSchema,
  PostSchemaInput,
  SearchResponse,
  SearchSchema,
  SearchSchemaInput
} from './schemas';
import {
  PaymentResponse,
  paymentResponseSchema,
  verifySchema,
  VerifyResponse
} from './process-payment/schemas';

class AzulAPI {
  private requester: AzulRequester;

  public vault: DataVault;
  public payments: ProcessPayment;
  public secure: Secure;
  public certificate: string;
  public key: string;

  constructor(config: Config) {
    config.key = parsePEM(config.key, 'key');
    config.certificate = parsePEM(config.certificate, 'certificate');

    this.requester = new AzulRequester(config);
    this.vault = new DataVault(this.requester);
    this.payments = new ProcessPayment(this.requester);
    this.secure = new Secure(this.requester);
    this.certificate = config.certificate;
    this.key = config.key;
  }

  /**
   * ### Transacción para anular venta, post o hold
   * Las transacciones de venta o post se pueden anular antes de los 20 minutos de haber
   * recibido la respuesta de aprobación.
   * Las transacciones de hold que no han sido posteadas no tienen límite de tiempo para
   * anularse.
   */
  async void(azulOrderId: string): Promise<PaymentResponse> {
    const response = await this.requester.safeRequest({ azulOrderId }, Process.Void);
    return paymentResponseSchema.parse(response);
  }

  /**
   * ### Transacción para hacer captura o posteo del Hold
   * El método "Post" permite capturar un "Hold" realizado previamente para su liquidación.
   * El monto del "Post" puede ser igual o menor al monto del "Hold". En caso de que el
   * monto del Post sea menor al Hold, se envía un mensaje de reverso para liberar los
   * fondos retenidos a la tarjeta.
   */
  async post(input: PostSchemaInput): Promise<PaymentResponse> {
    const response = await this.requester.safeRequest(PostSchema.parse(input), Process.Post);
    return paymentResponseSchema.parse(response);
  }

  /**
   * Método VerifyPayment
   * Este método permite verificar la respuesta enviada por el webservice de una
   * transacción anterior (procesada por el método ProccesPayment) identificada por el
   * campo CustomOrderId.
   * Si existe más de una transacción con este identificador este método devolverá los
   * valores de la última transacción (más reciente) de ellas.
   */
  async verifyPayment(customOrderId: string): Promise<VerifyResponse> {
    const response = await this.requester.safeRequest({ customOrderId }, Process.VerifyPayment);
    return verifySchema.parse(response);
  }

  /**
   * Este método permite extraer los detalles de una o varias transacciones
   * vía Webservices, anteriormente procesadas de un rango de fechas
   * previamente seleccionado.
   */
  async search(input: SearchSchemaInput): Promise<SearchResponse> {
    const response = await this.requester.safeRequest(
      SearchSchema.parse(input),
      Process.SearchPayments
    );
    return paymentResponseSchema.parse(response);
  }
}

export default AzulAPI;
