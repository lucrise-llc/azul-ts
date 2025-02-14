import AzulRequester from '../request';
import { SearchResponse, searchRequestSchema, SearchRequest } from './schemas';

/**
 * Este método permite extraer los detalles de una o varias transacciones
 * vía Webservices, anteriormente procesadas de un rango de fechas
 * previamente seleccionado.
 */
export async function search(
  input: SearchRequest,
  requester: AzulRequester
): Promise<SearchResponse> {
  const response = await requester.request(searchRequestSchema.parse(input), 'SearchPayments');
  return response as SearchResponse;
}
