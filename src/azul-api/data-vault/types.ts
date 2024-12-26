import { z } from 'zod';
import { Create } from './schemas';

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
