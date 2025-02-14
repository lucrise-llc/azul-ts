import AzulRequester from '../request';
import { PostRequest, PostRequestSchema } from './schemas';
import { SaleResponse, saleResponseSchema } from '../sale/schemas';

/**
 * ### Transacción para hacer captura o posteo del Hold
 * El método "Post" permite capturar un "Hold" realizado previamente para su liquidación.
 * El monto del "Post" puede ser igual o menor al monto del "Hold". En caso de que el
 * monto del Post sea menor al Hold, se envía un mensaje de reverso para liberar los
 * fondos retenidos a la tarjeta.
 */
export async function post(input: PostRequest, requester: AzulRequester): Promise<SaleResponse> {
  const response = await requester.safeRequest(PostRequestSchema.parse(input), 'ProcessPost');
  return saleResponseSchema.parse(response);
}
