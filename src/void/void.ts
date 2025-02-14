import AzulRequester from '../request';
import { SaleResponse, saleResponseSchema } from '../sale/schemas';

/**
 * ### Transacción para anular venta, post o hold
 * Las transacciones de venta o post se pueden anular antes de los 20 minutos de haber
 * recibido la respuesta de aprobación.
 * Las transacciones de hold que no han sido posteadas no tienen límite de tiempo para
 * anularse.
 */
export async function voidTransaction(
  azulOrderId: string,
  requester: AzulRequester
): Promise<SaleResponse> {
  const response = await requester.safeRequest({ azulOrderId }, 'ProcessVoid');
  return saleResponseSchema.parse(response);
}
