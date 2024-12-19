import { z } from 'zod';
import { CVC, cardNumber, expiration } from '../schemas';

export const Create = z.object({
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
  CVC
});

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
  ResponseMessage: string;
}>;

export type CreateInput = z.input<typeof Create>;
