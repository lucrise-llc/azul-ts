import AzulRequester from '../request';
import { SaleRequest, saleRequestSchema, SaleResponse, saleResponseSchema } from '../sale/schemas';

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
export async function hold(input: SaleRequest, requester: AzulRequester): Promise<SaleResponse> {
  const response = await requester.request({
    body: {
      ...saleRequestSchema.parse(input),
      trxType: 'Hold',
      acquirerRefData: '1'
    },
    url: requester.url
  });

  return saleResponseSchema.parse(response);
}
