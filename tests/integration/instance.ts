import AzulAPI from '../../src/azul-api/api';
import { CONFIG } from '../../src/config';

export const azul = new AzulAPI({
  auth1: CONFIG.auth1,
  auth2: CONFIG.auth2,
  merchantId: CONFIG.merchantId,
  certificate: CONFIG.certificate,
  key: CONFIG.key
});
