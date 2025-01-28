import { z } from 'zod';
import { CVC, cardNumber, expiration, channel, saveToDataVault } from '../schemas';

export const Create = z.object({
  /**
   * Canal de pago.
   * Este valor es proporcionado por AZUL, junto a los
   * datos de acceso a cada ambiente
   */
  channel,
  /**
   * Identificador único del comercio (MID),
   * proporcionado por AZUL
   */
  store: z.string().max(11),
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
   * Valor = CREATE (Este valor es case sensitive)
   */
  trxType: z.literal('CREATE'),
  /**
   * Valores posibles 1 = si, 2 = no. Si se manda este
   * valor en 1, SDP le devolverá el token generado en
   * el campo DataVaultToken
   */
  saveToDataVault: z.literal('1')
});

export const Delete = z.object({
  /**
   * Canal de pago.
   * Este valor es proporcionado por AZUL, junto a los
   * datos de acceso a cada ambiente
   */
  channel,
  /**
   * Identificador único del comercio (MID),
   * proporcionado por AZUL
   */
  store: z.string().max(11),
  /**
   * Token generado por Azul.
   * Formato UUID (36 caracteres)
   */
  dataVaultToken: z.string().max(36),
  /**
   * Valor = DELETE (Este valor es case sensitive)
   */
  trxType: z.literal('DELETE')
});
