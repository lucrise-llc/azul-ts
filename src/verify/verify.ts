import AzulRequester from '../request';
import { VerifyResponse, verifySchema } from './schemas';

/**
 * Método VerifyPayment
 * Este método permite verificar la respuesta enviada por el webservice de una
 * transacción anterior (procesada por el método ProccesPayment) identificada por el
 * campo CustomOrderId.
 * Si existe más de una transacción con este identificador este método devolverá los
 * valores de la última transacción (más reciente) de ellas.
 */
export async function verify(
  customOrderId: string,
  requester: AzulRequester
): Promise<VerifyResponse> {
  const response = await requester.request({ customOrderId }, 'VerifyPayment');
  return verifySchema.parse(response);
}
