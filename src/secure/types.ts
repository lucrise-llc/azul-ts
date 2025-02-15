export enum ChallengeIndicator {
  /**
   * Sin preferencias (no tiene preferencia si se debe realizar un desafío.
   * Este es el valor predeterminado)
   */
  NO_PREFERENCE = '01',

  /**
   * No solicitar ningún desafío (comercio prefiere que no se realice ningún desafío).
   */
  NO_CHALLENGE = '02',

  /**
   * Solicitar desafío: Preferencia del solicitante de 3DS (prefiere que se realice un
   * desafío; esto debe establecerse para transacciones de alto riesgo o valor)
   */
  CHALLENGE = '03',

  /**
   * Cuando solicitar desafío es mandatorio (existen mandatos locales o regionales
   * que indican que se debe realizar un desafío, actualmente en República
   * Dominicana no es mandatorio por lo que en este momento este valor no aplica
   * para nuestro país).
   */
  MANDATORY_CHALLENGE = '04'
}

export enum MethodNotificationStatus {
  /**
   * Ha enviado el elemento methodNotificationURL en la
   * solicitud de transacción de venta inicial y ha recibido la
   * notificación de ACS en 10 segundos, recibirá un mensaje HTTP
   * POST de ACS, que contendrá un identificador de transacción
   * único representado por threeDSServerTransID
   */
  RECEIVED = 'RECEIVED',
  /**
   * Ha enviado el elemento methodNotificationURL en la
   * solicitud de transacción de venta inicial y no ha recibido la
   * notificación de ACS en 10 segundos
   */
  EXPECTED_BUT_NOT_RECEIVED = 'EXPECTED_BUT_NOT_RECEIVED',
  /**
   * No ha enviado el elemento methodNotificationURL en la
   * solicitud de transacción de venta inicial
   */
  NOT_EXPECTED = 'NOT_EXPECTED'
}

export type CardHolderInfo = {
  /**
   * Ciudad de la dirección de facturación
   * Máximo 96 caracteres, incluyendo espacios
   */
  BillingAddressCity: string;

  /**
   * País de la dirección de facturación
   * Código ISO de 2 caracteres del país
   */
  BillingAddressCountry: string;

  /**
   * Dirección de facturación – Línea 1
   * Máximo 96 caracteres, incluyendo espacios
   */
  BillingAddressLine1: string;

  /**
   * Dirección de facturación – Línea 2
   * Máximo 96 caracteres, incluyendo espacios
   */
  BillingAddressLine2: string;

  /**
   * Dirección de facturación – Línea 3
   * Máximo 96 caracteres, incluyendo espacios
   */
  BillingAddressLine3: string;

  /**
   * Estado o provincia de la dirección de facturación
   * Máximo 96 caracteres, incluyendo espacios
   */
  BillingAddressState: string;

  /**
   * Código postal o “ZIP code” de la dirección de facturación
   * Máximo 24 caracteres, incluyendo espacios
   */
  BillingAddressZip: string;

  /**
   * Dirección de correo electrónico
   * Máximo 254 caracteres
   */
  Email: string;

  /**
   * Nombre tarjetahabiente
   * Máximo 96 caracteres, incluyendo espacios
   */
  Name: string;

  /**
   * Teléfono de la casa
   * Máximo 32 caracteres
   */
  PhoneHome: string;

  /**
   * Teléfono móvil
   * Máximo 32 caracteres
   */
  PhoneMobile: string;

  /**
   * Teléfono del trabajo
   * Máximo 32 caracteres
   */
  PhoneWork: string;

  /**
   * Ciudad de la dirección de envío
   * Máximo 96 caracteres, incluyendo espacios
   */
  ShippingAddressCity: string;

  /**
   * País de la dirección de envío
   * Código ISO de 2 caracteres del país
   */
  ShippingAddressCountry: string;

  /**
   * Dirección de envío – Línea 1
   * Máximo 96 caracteres, incluyendo espacios
   */
  ShippingAddressLine1: string;

  /**
   * Dirección de envío – Línea 2
   * Máximo 96 caracteres, incluyendo espacios
   */
  ShippingAddressLine2: string;

  /**
   * Dirección de envío – Línea 3
   * Máximo 96 caracteres, incluyendo espacios
   */
  ShippingAddressLine3: string;

  /**
   * Estado o provincia de la dirección de envío
   * Máximo 96 caracteres, incluyendo espacios
   */
  ShippingAddressState: string;

  /**
   * Código postal o “ZIP code” de la dirección de envío
   * Máximo 24 caracteres, incluyendo espacios
   */
  ShippingAddressZip: string;
};

export type BrowserInfo = {
  /**
   * Contiene los tipos de contenido que el cliente puede aceptar, ordenados por la calidad del contenido.
   */
  AcceptHeader: string;

  /**
   * Dirección IP del cliente.
   */
  IPAddress: string;

  /**
   * Idioma preferido del cliente, generalmente el idioma del navegador.
   */
  Language: string;

  /**
   * Profundidad de color de la pantalla del cliente.
   */
  ColorDepth: string;

  /**
   * Ancho de la pantalla del cliente.
   */
  ScreenWidth: string;

  /**
   * Alto de la pantalla del cliente.
   */
  ScreenHeight: string;

  /**
   * Zona horaria del cliente.
   */
  TimeZone: string;

  /**
   * Cadena que identifica al navegador del cliente.
   */
  UserAgent: string;

  /**
   * Indica si JavaScript está habilitado en el navegador del cliente.
   */
  JavaScriptEnabled: boolean;
};
