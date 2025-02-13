import z from 'zod';

import {
  CVC,
  ECommerceURL,
  ITBIS,
  acquirerRefData,
  altMerchantName,
  amount,
  cardNumber,
  channel,
  customOrderId,
  customerServicePhone,
  dataVaultToken,
  expiration,
  orderNumber,
  posInputMode,
  saveToDataVault
} from '../schemas';

const BasePaymentSchema = z.object({
  /**
   * Canal de pago.
   * Este valor es proporcionado por AZUL, junto a los
   * datos de acceso a cada ambiente
   */
  channel,
  /**
   * Modo de ingreso.
   * Este valor es proporcionado por AZUL, junto a los
   * datos de acceso a cada ambiente
   */
  posInputMode,
  /**
   * Monto total de la transacción (Impuestos
   * incluidos.)
   * Se envía sin coma ni punto; los dos últimos dígitos
   * representan los decimales.
   * Ej. 1000 equivale a 10.00
   * Ej. 1748321 equivale a 17,483.21
   */
  amount,
  /**
   * Valor del ITBIS. Mismo formato que el campo
   * Amount. El valor enviado en el campo de ITBIS no
   * se carga como un monto adicional en la
   * transacción. En el campo de Amount debe enviarse
   * total a cargar incluyendo el ITBIS.
   * Si la transacción o el negocio están exentos, se
   * envía en cero colocando el valo "000".
   */
  ITBIS,
  /**
   * Número de orden asociado a la transacción. Puede
   * viajar nulo, pero siempre debe de estar presente.
   */
  orderNumber,
  /**
   * Uso Interno AZUL
   * Valor Fijo: 1
   */
  acquirerRefData,
  /**
   * Número de servicio para atención telefónica del
   * establecimiento. Ej.: 8095442985
   */
  customerServicePhone,
  /**
   * Dirección web del afiliado.
   */
  ECommerceURL,
  /**
   * Numero Identificador dada por el afiliado a la
   * transacción. Este campo debe ser enviado si se
   * desea implementar el método de VerifyPayment.
   */
  customOrderId,
  /**
   * Campo que permite al Comercio colocar un
   * nombre más descriptivo para que el
   * tarjetahabiente pueda identificarle en su estado de
   * cuenta. Se sugiere siempre colocar su nombre
   * comercial adecuadamente a fin de evitar disputas.
   * Si lo desea, puede agregar a su nombre algún
   * indicador único de orden.
   * El campo solo acepta un máximo de 25 caracteres.
   * No utilizar los siguientes caracteres especiales:
   * " Genera un error en el request.
   * \ Genera un error en el request.
   * ' Este carácter no se muestra en el mensaje del
   * emisor.
   */
  altMerchantName
});

const CardPaymentSchema = BasePaymentSchema.extend({
  /**
   * Número de tarjeta a la cual se le ha de cargar la
   * transacción.
   * La longitud del campo se determina por la tarjeta,
   * no se debe rellenar con ceros (0), espacios, ni
   * caracteres especiales
   */
  cardNumber,
  /**
   * Fecha expiración/vencimiento de la tarjeta
   * Formato YYYYMM Ej.: 201502
   */
  expiration,
  /**
   * Código de seguridad de la tarjeta (CVV2 o CVC).
   */
  CVC,
  /**
   * Valores posibles 1 = si, 2 = no. Si se manda este
   * valor en 1, SDP le devolverá el token generado en
   * el campo DataVaultToken
   */
  saveToDataVault,
  dataVaultToken: z.undefined()
});

const TokenPaymentSchema = BasePaymentSchema.extend({
  /**
   * Valor del token generado por SDP en caso de que
   * se desee realizar una transacción con dicho token.
   * Si se manda el valor de esto, no se deben enviar los
   * valores de CardNumber, Expiration. El envío de
   * CVC si es ecommerce puede ser o no mandatorio
   * depende de lo conversado con Negocios SDP. Si es
   * MOTO la transacción, no se debería enviar CVC.
   */
  dataVaultToken: z.string().max(36),
  cardNumber: z.literal(''),
  expiration: z.literal(''),
  CVC: z.undefined(),
  saveToDataVault: z.undefined()
});

export const ProcessPaymentSchema = z.union([CardPaymentSchema, TokenPaymentSchema]);

export const RefundRequestSchema = z.intersection(
  ProcessPaymentSchema,
  z.object({
    OriginalDate: z.string().length(8),
    OriginalTrxTicketNr: z.string().length(4).optional()
  })
);

export const RefundSchema = z.object({
  /**
   * Canal de pago.
   * Este valor es proporcionado por AZUL, junto a los
   * datos de acceso a cada ambiente
   */
  channel,
  /**
   * Número de tarjeta a la cual se le ha de cargar la
   * transacción.
   * La longitud del campo se determina por la tarjeta,
   * no se debe rellenar con ceros (0), espacios, ni
   * caracteres especiales
   */
  cardNumber,
  /**
   * Fecha expiración/vencimiento de la tarjeta
   * Formato YYYYMM Ej.: 201502
   */
  expiration,
  /**
   * Modo de ingreso.
   * Este valor es proporcionado por AZUL, junto a los
   * datos de acceso a cada ambiente
   */
  posInputMode,
  /**
   * Monto total de la transacción (Impuestos
   * incluidos.)
   * Se envía sin coma ni punto; los dos últimos dígitos
   * representan los decimales.
   * Ej. 1000 equivale a 10.00
   * Ej. 1748321 equivale a 17,483.21
   */
  amount,
  /**
   * Valor del ITBIS. Mismo formato que el campo
   * Amount. El valor enviado en el campo de ITBIS no
   * se carga como un monto adicional en la
   * transacción. En el campo de Amount debe enviarse
   * total a cargar incluyendo el ITBIS.
   * Si la transacción o el negocio están exentos, se
   * envía en cero colocando el valo "000".
   */
  ITBIS,
  /**
   * Número de orden asociado a la transacción. Puede
   * viajar nulo, pero siempre debe de estar presente.
   */
  orderNumber,
  /**
   * Número de servicio para atención telefónica del
   * establecimiento. Ej.: 8095442985
   */
  customerServicePhone,
  /**
   * Dirección web del afiliado.
   */
  ECommerceURL,
  /**
   * Numero Identificador dada por el afiliado a la
   * transacción. Este campo debe ser enviado si se
   * desea implementar el método de VerifyPayment.
   */
  customOrderId,
  /**
   * Campo que permite al Comercio colocar un
   * nombre más descriptivo para que el
   * tarjetahabiente pueda identificarle en su estado de
   * cuenta. Se sugiere siempre colocar su nombre
   * comercial adecuadamente a fin de evitar disputas.
   * Si lo desea, puede agregar a su nombre algún
   * indicador único de orden.
   * El campo solo acepta un máximo de 25 caracteres.
   * No utilizar los siguientes caracteres especiales:
   * " Genera un error en el request.
   * \ Genera un error en el request.
   * ' Este carácter no se muestra en el mensaje del
   * emisor.
   */
  altMerchantName,
  /**
   * Valor del token generado por SDP en caso de que
   * se desee realizar una transacción con dicho token.
   * Si se manda el valor de esto, no se deben enviar los
   * valores de CardNumber, Expiration. El envío de
   * CVC si es ecommerce puede ser o no mandatorio
   * depende de lo conversado con Negocios SDP. Si es
   * MOTO la transacción, no se debería enviar CVC.
   */
  dataVaultToken,
  /**
   * Valores posibles 1 = si, 2 = no. Si se manda este
   * valor en 1, SDP le devolverá el token generado en
   * el campo DataVaultToken
   */
  saveToDataVault,
  /**
   * Número de orden Azul. Puede ser usado en vez del RRN para generar una
   * devolución. Importante dar prioridad a este valor sobre el RRN.
   */
  azulOrderId: z.string()
});
