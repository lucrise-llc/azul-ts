import AzulRequester from '../request';
import {
  processPaymentSchema,
  PaymentResponse,
  paymentResponseSchema,
  ProcessPaymentInput,
  refundRequestSchema,
  RefundRequestInput,
  refundResponseSchema,
  RefundResponse
} from './schemas';

export enum ProcessPaymentTransaction {
  SALE = 'Sale',
  HOLD = 'Hold',
  REFUND = 'Refund'
}

class ProcessPayment {
  private readonly requester: AzulRequester;

  constructor(requester: AzulRequester) {
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
  async sale(input: ProcessPaymentInput): Promise<PaymentResponse> {
    const response = await this.requester.safeRequest({
      ...processPaymentSchema.parse(input),
      trxType: ProcessPaymentTransaction.SALE
    });

    return paymentResponseSchema.parse(response);
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
  async refund(input: RefundRequestInput): Promise<RefundResponse> {
    const response = await this.requester.safeRequest({
      ...refundRequestSchema.parse(input),
      trxType: ProcessPaymentTransaction.REFUND
    });

    return refundResponseSchema.parse(response);
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
  async hold(input: ProcessPaymentInput): Promise<PaymentResponse> {
    const response = await this.requester.safeRequest({
      ...processPaymentSchema.parse(input),
      trxType: ProcessPaymentTransaction.HOLD,
      acquirerRefData: '1'
    });

    return paymentResponseSchema.parse(response);
  }
}

export default ProcessPayment;
