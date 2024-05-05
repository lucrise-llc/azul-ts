import { z } from 'zod';
export declare const Create: z.ZodObject<
  {
    /**
     * Número de tarjeta a la cual se le ha de cargar la
     * transacción.
     * La longitud del campo se determina por la tarjeta,
     * no se debe rellenar con ceros (0), espacios, ni
     * caracteres especiales
     */
    cardNumber: z.ZodString;
    /**
     * Fecha expiración/vencimiento de la tarjeta
     * Formato YYYYMM Ej.: 201502
     */
    expiration: z.ZodString;
    /**
     * Código de seguridad de la tarjeta (CVV2 o CVC).
     */
    CVC: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    cardNumber: string;
    expiration: string;
    CVC: string;
  },
  {
    cardNumber: string;
    expiration: string;
    CVC: string;
  }
>;
export type DataVaultResponse = Partial<{
  /**
   * Marca de la tarjeta
   */
  Brand: string;
  /**
   * Número de tarjeta enmascarada (ej. XXXXXX…XXXX).
   */
  CardNumber: string;
  /**
   * Token generado por SDP.
   */
  DataVaultToken: string;
  /**
   * Descripción del error.
   * Valor sólo presente si la transacción produjo un error. En caso
   * de no presentar error ese campo viaja en blanco
   */
  ErrorDescription: string;
  /**
   * Fecha expiración del token. Formato YYYYMM
   */
  Expiration: string;
  /**
   * Indica si el Token fue creado con CVV.
   */
  HasCVV: boolean;
  /**
   * Código ISO-8583 recibido de respuesta.
   * Cuando la transacción es exitosa se recibe el valor “00”
   */
  IsoCode: string;
  /**
   * Mensaje de respuesta
   */
  ReponseMessage: string;
}>;
export type CreateInput = z.input<typeof Create>;
export declare const DataVaultSaleSchema: z.ZodObject<
  {
    /**
     * Modo de ingreso.
     * Este valor es proporcionado por AZUL, junto a los
     * datos de acceso a cada ambiente
     */
    posInputMode: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    /**
     * Monto total de la transacción (Impuestos
     * incluidos.)
     * Se envía sin coma ni punto; los dos últimos dígitos
     * representan los decimales.
     * Ej. 1000 equivale a 10.00
     * Ej. 1748321 equivale a 17,483.21
     */
    amount: z.ZodNumber;
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
    ITBIS: z.ZodNumber;
    /**
     * Número de orden asociado a la transacción. Puede
     * viajar nulo, pero siempre debe de estar presente.
     */
    orderNumber: z.ZodOptional<z.ZodString>;
    /**
     * Uso Interno AZUL
     * Valor Fijo: 1
     */
    acquirerRefData: z.ZodDefault<z.ZodOptional<z.ZodEnum<['0', '1']>>>;
    /**
     * Número de servicio para atención telefónica del
     * establecimiento. Ej.: 8095442985
     */
    customerServicePhone: z.ZodOptional<z.ZodString>;
    /**
     * Dirección web del afiliado.ProcessPayment
     * transacción. Este campo debe ser enviado si se
     * desea implementar el método de VerifyPayment.
     */
    customOrderId: z.ZodOptional<z.ZodString>;
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
    altMerchantName: z.ZodOptional<z.ZodString>;
    /**
     * Valor del token generado por SDP en caso de que
     * se desee realizar una transacción con dicho token.
     * Si se manda el valor de esto, no se deben enviar los
     * valores de CardNumber, Expiration. El envío de
     * CVC si es ecommerce puede ser o no mandatorio
     * depende de lo conversado con Negocios SDP. Si es
     * MOTO la transacción, no se debería enviar CVC.
     */
    dataVaultToken: z.ZodString;
    /**
     * Valores posibles 0 =no, 1 = Si. Si se envía el valor en
     * ‘0’, la transacción se procesa con 3D Secure. Si se
     * envía el valor en ‘1’ la transacción se procesa sin
     * 3D Secure.
     */
    forceNo3DS: z.ZodOptional<z.ZodEnum<['0', '1']>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    amount: number;
    ITBIS: number;
    dataVaultToken: string;
    posInputMode: string;
    acquirerRefData: '0' | '1';
    orderNumber?: string | undefined;
    altMerchantName?: string | undefined;
    customerServicePhone?: string | undefined;
    customOrderId?: string | undefined;
    forceNo3DS?: '0' | '1' | undefined;
  },
  {
    amount: number;
    ITBIS: number;
    dataVaultToken: string;
    orderNumber?: string | undefined;
    altMerchantName?: string | undefined;
    posInputMode?: string | undefined;
    acquirerRefData?: '0' | '1' | undefined;
    customerServicePhone?: string | undefined;
    customOrderId?: string | undefined;
    forceNo3DS?: '0' | '1' | undefined;
  }
>;
export type DataVaultSaleInput = z.input<typeof DataVaultSaleSchema>;
//# sourceMappingURL=shemas.d.ts.map
