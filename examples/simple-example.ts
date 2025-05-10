import { Azul } from '../src/api';
import { env } from '../src/tests/instance';

const azul = new Azul({
  auth1: env.AUTH1,
  auth2: env.AUTH2,
  merchantId: env.MERCHANT_ID,
  certificate: env.AZUL_CERT,
  key: env.AZUL_KEY,
  environment: 'development',
  channel: 'EC'
});

const result = await azul.sale({
  type: 'card',
  cardNumber: '6011000990099818',
  expiration: '202412',
  CVC: '818',
  amount: 1000,
  ITBIS: 100
});

if (result.type === 'success') {
  console.log('Success');
}

if (result.type === 'error') {
  console.error(`Payment failed: ${result.ErrorDescription}`);
}
