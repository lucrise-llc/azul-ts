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
