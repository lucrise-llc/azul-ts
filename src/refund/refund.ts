import AzulRequester from '../request';
import { RefundRequestInput } from './schemas';
import { refundRequestSchema, RefundResponse, refundResponseSchema } from './schemas';

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
export async function refund(
  input: RefundRequestInput,
  requester: AzulRequester
): Promise<RefundResponse> {
  const response = await requester.request({
    ...refundRequestSchema.parse(input),
    trxType: 'Refund'
  });

  return refundResponseSchema.parse(response);
}
