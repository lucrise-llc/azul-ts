import { z } from 'zod';

import { RefundSchema } from './schemas';
import { ProcessPaymentSchema } from './schemas';

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
  ResponseMessage: string;
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

export type RefundSchemaInput = z.input<typeof RefundSchema>;
