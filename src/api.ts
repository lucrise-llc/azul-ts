import z from 'zod';
import https from 'https';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs/promises';
import { Prettify, capitalizeKeys } from './utils';

type TrxType = 'Sale' | 'Void' | 'Refund';

const channel = z.string().max(3).optional().default('EC');
const azulOrderId = z.string().max(8);
const amount = z.number().int().positive();
const ITBIS = z.number().int().positive();

const PostSchema = z.object({
  channel,
  azulOrderId,
  amount,
  ITBIS
});

const ProcessPaymentSchema = z.object({
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
  cardNumber: z.string().max(19),
  /**
   * Fecha expiración/vencimiento de la tarjeta
   * Formato YYYYMM Ej.: 201502
   */
  expiration: z.string().length(6),
  /**
   * Código de seguridad de la tarjeta (CVV2 o CVC).
   */
  CVC: z.string().length(3),
  /**
   * Modo de ingreso.
   * Este valor es proporcionado por AZUL, junto a los
   * datos de acceso a cada ambiente
   */
  posInputMode: z.string().max(10).optional().default('E-Commerce'),
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
  orderNumber: z.string().max(15).optional(),
  /**
   * Uso Interno AZUL
   * Valor Fijo: 1
   */
  acquirerRefData: z.enum(['0', '1']).optional(),
  /**
   * Número de servicio para atención telefónica del
   * establecimiento. Ej.: 8095442985
   */
  customerServicePhone: z.string().max(32).optional(),
  /**
   * Dirección web del afiliado.
   */
  ECommerceURL: z.string().max(32).optional(),
  /**
   * Numero Identificador dada por el afiliado a la
   * transacción. Este campo debe ser enviado si se
   * desea implementar el método de VerifyPayment.
   */
  customOrderId: z.string().max(75).optional(),
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
  altMerchantName: z.string().max(30).optional(),
  /**
   * Valor del token generado por SDP en caso de que
   * se desee realizar una transacción con dicho token.
   * Si se manda el valor de esto, no se deben enviar los
   * valores de CardNumber, Expiration. El envío de
   * CVC si es ecommerce puede ser o no mandatorio
   * depende de lo conversado con Negocios SDP. Si es
   * MOTO la transacción, no se debería enviar CVC.
   */
  dataVaultToken: z.string().max(100).optional(),
  /**
   * Valores posibles 1 = si, 2 = no. Si se manda este
   * valor en 1, SDP le devolverá el token generado en
   * el campo DataVaultToken
   */
  saveToDataVault: z.enum(['1', '2']).optional(),
  /**
   * Valores posibles 0 =no, 1 = Si. Si se envía el valor en
   * ‘0’, la transacción se procesa con 3D Secure. Si se
   * envía el valor en ‘1’ la transacción se procesa sin
   * 3D Secure.
   */
  forceNo3DS: z.enum(['0', '1']).optional()
});

const RefundRequestSchema = z
  .object({
    OriginalDate: z.string().length(8),
    OriginalTrxTicketNr: z.string().length(4).optional()
  })
  .merge(ProcessPaymentSchema);

type ProcessPaymentSchemaInput = z.input<typeof ProcessPaymentSchema>;

type AzulResponse = {
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
   * # de orden Azul. Puede ser usado en vez del RRN para generar una
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
  // CardNumber: string;
};

type AzulResponseWithOk = Prettify<
  Partial<AzulResponse> & {
    /**
     * Indica que la transacción fue exitosa.
     * Su valor es `true` si ResponseCode no es `Error` y ISOCode es `00`.
     */
    ok: boolean;
  }
>;

type AzulConfig = {
  auth1: string;
  auth2: string;
  merchantId: string;
  certificatePath: string;
  keyPath: string;
  environment?: 'dev' | 'prod';
  channel?: string;
};

enum AzulURL {
  DEV = 'https://pruebas.azul.com.do/webservices/JSON/Default.aspx',
  PROD = 'https://pagos.azul.com.do/webservices/JSON/Default.aspx'
}

class AzulAPI {
  private readonly config: AzulConfig;
  private readonly azulURL: string;
  private certificate: Buffer | undefined;
  private certificateKey: Buffer | undefined;

  constructor(config: AzulConfig) {
    this.config = config;

    if (this.config.channel === undefined) {
      this.config.channel = 'EC';
    }

    if (config.environment === undefined || config.environment === 'dev') {
      this.azulURL = AzulURL.DEV;
    } else {
      this.azulURL = AzulURL.PROD;
    }
  }

  async sale(saleRequest: ProcessPaymentSchemaInput): Promise<AzulResponseWithOk> {
    const validated = ProcessPaymentSchema.parse(saleRequest);
    const response = await this.request(validated, 'Sale');
    return this.checkAzulResponse(response);
  }

  async void(azulOrderId: string): Promise<AzulResponseWithOk> {
    const response = await this.request({ azulOrderId }, 'Void');
    return this.checkAzulResponse(response);
  }

  async refund(refundRequest: z.input<typeof RefundRequestSchema>): Promise<AzulResponseWithOk> {
    const validated = RefundRequestSchema.parse(refundRequest);
    const response = await this.request(validated, 'Refund');
    return this.checkAzulResponse(response);
  }

  async post(postRequest: z.input<typeof PostSchema>): Promise<AzulResponseWithOk> {
    const validated = PostSchema.parse(postRequest);
    const response = await this.request(validated);
    return this.checkAzulResponse(response);
  }

  async verifyPayment(customOrderId: string): Promise<AzulResponseWithOk> {
    const response = await this.request({ customOrderId });
    return this.checkAzulResponse(response);
  }

  private checkAzulResponse(json: any): AzulResponseWithOk {
    return {
      ...json,
      ok: json.ResponseCode !== 'Error' && json.IsoCode === '00'
    };
  }

  private async request(body: any, trxType?: TrxType) {
    if (trxType) {
      body.trxType = trxType;
    }

    const fullBody = capitalizeKeys({
      channel: this.config.channel,
      store: this.config.merchantId,
      ...body
    });

    const response = await fetch(this.azulURL, {
      method: 'POST',
      headers: {
        Auth1: this.config.auth1,
        Auth2: this.config.auth2,
        'Content-Type': 'application/json'
      },
      agent: new https.Agent(await this.getCertificates()),
      body: JSON.stringify(capitalizeKeys(fullBody))
    });

    return await response.json();
  }

  private async getCertificates(): Promise<{ cert: Buffer; key: Buffer }> {
    if (this.certificate && this.certificateKey) {
      return {
        cert: this.certificate,
        key: this.certificateKey
      };
    }

    this.certificate = await fs.readFile(path.resolve(__dirname, this.config.certificatePath));
    this.certificateKey = await fs.readFile(path.resolve(__dirname, this.config.keyPath));

    return {
      cert: this.certificate,
      key: this.certificateKey
    };
  }
}

export default AzulAPI;
