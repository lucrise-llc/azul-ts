import { randomUUID } from 'crypto';

import { Azul } from '../src/api';
import { env } from '../src/tests/instance';
import 'dotenv/config';

const azul = new Azul({
  auth1: env.AUTH1,
  auth2: env.AUTH2,
  merchantId: env.MERCHANT_ID,
  certificate: env.AZUL_CERT,
  key: env.AZUL_KEY
});

const amount = 100; // RD$100
const ITBIS = 10; // RD$10
const customOrderId = randomUUID();

/**
 * ### Hold: Transacción para retención o reserva de fondos en la tarjeta
 * Se puede separar la autorización del posteo o captura en dos mensajes distintos:
 * 1. Hold: pre-autorización y reserva de los fondos en la tarjeta del cliente.
 * 2. Post: se hace la captura o el “posteo” de la transacción.
 *
 * Al utilizar el Hold y Post se deben considerar los siguientes puntos:
 * 1. Para evitar que el banco emisor elimine la pre-autorización, el Post debe ser
 * realizado antes de 7 días de haber hecho el Hold.
 * 2. Luego de realizado el Hold, el comercio no va a recibir la liquidación de los
 * fondos hasta que someta el Post.
 * 3. El Post solamente se puede hacer una vez por cada Hold realizado. Si se
 * desea dividir el posteo en múltiples capturas, se debe usar la
 * funcionalidad de Captura Múltiple o Split Shipment.
 * 4. El Post puede ser igual, menor o mayor al monto original. El posteo por un
 * monto mayor no debe sobrepasar el 15% del monto original.
 * 5. El Void libera o cancela los fondos retenidos.
 */
const hold = await azul.hold({
  type: 'card',
  cardNumber: '5424180279791732',
  expiration: '202812',
  CVC: '732',
  amount,
  ITBIS,
  customOrderId
});

if (hold.type === 'error') {
  throw new Error(`Hold failed: ${hold.ResponseMessage}`);
}

const post = await azul.post({
  azulOrderId: hold.AzulOrderId,
  amount,
  ITBIS
});

if (post.type === 'error') {
  throw new Error(`Post failed: ${post.ResponseMessage}`);
}
