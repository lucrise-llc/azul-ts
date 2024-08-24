import AzulAPI from '../../src/azul-api/api';

export const azul = new AzulAPI({
  auth1: process.env.AUTH1!,
  auth2: process.env.AUTH2!,
  merchantId: process.env.MERCHANT_ID!,
  certificate: process.env.AZUL_CERT!,
  key: process.env.AZUL_KEY!
});
