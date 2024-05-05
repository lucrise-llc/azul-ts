import { ProcessPaymentSchema, RefundSchema } from './schemas';
export var ProcessPaymentTransaction;
(function (ProcessPaymentTransaction) {
  ProcessPaymentTransaction['SALE'] = 'Sale';
  ProcessPaymentTransaction['HOLD'] = 'Hold';
  ProcessPaymentTransaction['REFUND'] = 'Refund';
})(ProcessPaymentTransaction || (ProcessPaymentTransaction = {}));
class ProcessPayment {
  constructor(requester) {
    Object.defineProperty(this, 'requester', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.requester = requester;
  }
  /**
   * ### SALE: Transacción de venta
   * Esta es la transacción principal utilizada para someter una autorización de una tarjeta
   * por la venta de un bien o servicio.
   * Las ventas realizadas con la transacción “Sale” son capturadas automáticamente para
   * su liquidación, por lo que sólo pueden ser anuladas con una transacción de “Void” en
   * un lapso de no más de 20 minutos luego de recibir respuesta de aprobación.
   *
   * Luego de transcurridos estos 20 minutos, la transacción será liquidada y se debe realizar
   * una transacción de “Refund” o devolución para devolver los fondos a la tarjeta.
   */
  async sale(input) {
    return await this.requester.safeRequest({
      ...ProcessPaymentSchema.parse(input),
      trxType: ProcessPaymentTransaction.SALE
    });
  }
  /**
   * ### Refund: Transacción Devolución
   * La devolución o “Refund” permite reembolsarle los fondos a una tarjeta luego de haberse
   * liquidado la transacción.
   *
   * Para poder realizar una devolución se debe haber procesado exitosamente una
   * transacción de Venta o Post, y se deben utilizar los datos de la transacción original
   * para enviar la devolución.
   * 1. El monto a devolver puede ser el mismo o menor.
   * 2. Se permite hacer una devolución, múltiples devoluciones o devoluciones
   *
   * parciales para cada transacción realizada.
   * El límite de tiempo para procesar una devolución es de 6 meses transcurridos
   * después de la transacción original.
   */
  async refund(input) {
    return await this.requester.safeRequest({
      ...RefundSchema.parse(input),
      trxType: ProcessPaymentTransaction.REFUND
    });
  }
  /**
   * ### Hold: Transacción para retención o reserva de fondos en la tarjeta
   * Se puede separar la autorización del posteo o captura en dos mensajes distintos:
   * 1. Hold: pre-autorización y reserva de los fondos en la tarjeta del cliente.
   * 2. Post: se hace la captura o el “posteo” de la transacción.
   *
   * Al utilizar el Hold y Post se deben considerar los siguientes puntos:
   * 1. Para evitar que el banco emisor elimine la pre-autorización, el Post debe ser
   * realizado antes de 7 días de haber hecho el Hold.
   * 2. Luego de realizado el Hold, el comercio no va a recibir la liquidación de los
   * fondos hasta que someta el Post.
   * 3. El Post solamente se puede hacer una vez por cada Hold realizado. Si se
   * desea dividir el posteo en múltiples capturas, se debe usar la
   * funcionalidad de Captura Múltiple o Split Shipment.
   * 4. El Post puede ser igual, menor o mayor al monto original. El posteo por un
   * monto mayor no debe sobrepasar el 15% del monto original.
   * 5. El Void libera o cancela los fondos retenidos.
   */
  async hold(input) {
    return await this.requester.safeRequest({
      ...ProcessPaymentSchema.parse(input),
      trxType: ProcessPaymentTransaction.HOLD
    });
  }
}
export default ProcessPayment;
//# sourceMappingURL=process-payment%20.js.map
