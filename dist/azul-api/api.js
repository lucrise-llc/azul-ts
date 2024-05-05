import { PostSchema, SearchSchema } from './schemas';
import AzulRequester from './request';
import DataVault from './data-vault/data-vault';
import ProcessPayment from './process-payment/process-payment ';
import { Process } from './processes';
class AzulAPI {
  constructor(config) {
    Object.defineProperty(this, 'requester', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, 'valut', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, 'payments', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.requester = new AzulRequester(config);
    this.valut = new DataVault(this.requester);
    this.payments = new ProcessPayment(this.requester);
  }
  /**
   * ### Transacción para anular venta, post o hold
   * Las transacciones de venta o post se pueden anular antes de los 20 minutos de haber
   * recibido la respuesta de aprobación.
   * Las transacciones de hold que no han sido posteadas no tienen límite de tiempo para
   * anularse.
   */
  async void(azulOrderId) {
    return await this.requester.safeRequest({ azulOrderId }, Process.Void);
  }
  /**
   * ### Transacción para hacer captura o posteo del Hold
   * El método “Post” permite capturar un “Hold” realizado previamente para su liquidación.
   * El monto del “Post” puede ser igual o menor al monto del “Hold”. En caso de que el
   * monto del Post sea menor al Hold, se envía un mensaje de reverso para liberar los
   * fondos retenidos a la tarjeta.
   */
  async post(input) {
    return await this.requester.safeRequest(PostSchema.parse(input), Process.Post);
  }
  /**
   * Método VerifyPayment
   * Este método permite verificar la respuesta enviada por el webservice de una
   * transacción anterior (procesada por el método ProccesPayment) identificada por el
   * campo CustomOrderId
   * Si existe más de una transacción con este identificador este método devolverá los
   * valores de la última transacción (más reciente) de ellas.
   */
  async verifyPayment(customOrderId) {
    return await this.requester.safeRequest({ customOrderId }, Process.VerifyPayment);
  }
  /**
   * Este método permite extraer los detalles de una o varias transacciones
   * vía Webservices, anteriormente procesadas de un rango de fechas
   * previamente seleccionado.
   */
  async search(input) {
    return await this.requester.safeRequest(SearchSchema.parse(input), Process.SearchPayments);
  }
}
export default AzulAPI;
//# sourceMappingURL=api.js.map
