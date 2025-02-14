import AzulRequester from '../request';
import { SaleRequest, saleRequestSchema, SaleResponse, saleResponseSchema } from './schemas';

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
export async function sale(input: SaleRequest, requester: AzulRequester): Promise<SaleResponse> {
  const response = await requester.request({
    body: {
      ...saleRequestSchema.parse(input),
      trxType: 'Sale'
    },
    url: requester.url
  });

  return saleResponseSchema.parse(response);
}
