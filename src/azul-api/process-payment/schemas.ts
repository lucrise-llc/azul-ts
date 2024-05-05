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
  forceNo3DS,
  orderNumber,
  posInputMode,
  saveToDataVault
} from '../schemas';

export const ProcessPaymentSchema = z.object({
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
   * Código de seguridad de la tarjeta (CVV2 o CVC).
   */
  CVC,
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
   * envía en cero colocando el valo “000”.
   *
   * Este valor deberá también ser incluido en el cálculo
   * del hash.
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
   * “ Genera un error en el request.
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
   * Valores posibles 0 =no, 1 = Si. Si se envía el valor en
   * ‘0’, la transacción se procesa con 3D Secure. Si se
   * envía el valor en ‘1’ la transacción se procesa sin
   * 3D Secure.
   */
  forceNo3DS
});

export const RefundRequestSchema = z
  .object({
    OriginalDate: z.string().length(8),
    OriginalTrxTicketNr: z.string().length(4).optional()
  })
  .merge(ProcessPaymentSchema);

export type ProcessPaymentResponse = Partial<{
  /**
   * Código de autorización generado por el centro autorizador para la
   * transacción.
   * Sólo presente si la transacción fue aprobada. ISOCode = ISO8583 y
   * ResponseCode = 00
   */
  AuthorizationCode: string;
  /**
   * Numero Identificador dada por el afiliado a la transacción. Si no
   * fue provisto en la transacción, este campo viaja en blanco
   */
  CustomOrderId: string;
  /**
   * Fecha y hora de la transacción.
   * Formato YYYYMMDDHHMMSS.
   */
  DateTime: string;
  /**
   * Descripción del error.
   * Valor sólo presente si la transacción produjo un error. En caso de
   * no presentar error ese campo viaja en blanco
   */
  ErrorDescription: string;
  /**
   * Código ISO-8583 recibido de respuesta.
   * Nota: En la documentación de Azul, este campo se llama ISOCode
   */
  IsoCode: string;
  /**
   * Número de lote en que se registró la transacción
   */
  LotNumber: string;
  /**
   * Número de referencia
   * (Reference referral number).
   */
  RRN: string;
  /**
   * Número de orden Azul. Puede ser usado en vez del RRN para generar una
   * devolución. Importante dar prioridad a este valor sobre el RRN.
   */
  AzulOrderId: string;
  /**
   * Código de respuesta.
   * Puede contener uno de los siguientes valores:
   * Iso8583 = la transacción fue procesada. Se debe revisar el
   * campo ISOCode para ver la respuesta de la transacción Error =
   * La transacción no fue procesada.
   */
  ResponseCode: 'ISO8583' | 'Error';
  /**
   * Mensaje de respuesta ISO-8583.
   * Valor sólo presente si el ResponseCode = ISO8583
   */
  ReponseMessage: string;
  /**
   * Número del ticket correspondiente a la transacción
   */
  Ticket: string;
  /**
   * Tarjeta usada para la transacción, enmascarada
   * (XXXXXX******XXXX)
   */
  CardNumber: string;
}>;

export type ProcessPaymentSchemaInput = z.input<typeof ProcessPaymentSchema>;

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
   * Código de seguridad de la tarjeta (CVV2 o CVC).
   */
  // CVC,
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
   * envía en cero colocando el valo “000”.
   *
   * Este valor deberá también ser incluido en el cálculo
   * del hash.
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
   * “ Genera un error en el request.
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
   * Valores posibles 0 =no, 1 = Si. Si se envía el valor en
   * ‘0’, la transacción se procesa con 3D Secure. Si se
   * envía el valor en ‘1’ la transacción se procesa sin
   * 3D Secure.
   */
  forceNo3DS,
  /**
   * Número de orden Azul. Puede ser usado en vez del RRN para generar una
   * devolución. Importante dar prioridad a este valor sobre el RRN.
   */
  azulOrderId: z.string()
});

export type RefundSchemaInput = z.input<typeof RefundSchema>;
