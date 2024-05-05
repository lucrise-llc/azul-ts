import AzulAPI from '../../src/azul-api/api';
import 'dotenv/config';

const azul = new AzulAPI({
  auth1: process.env.AUTH1!,
  auth2: process.env.AUTH2!,
  merchantId: process.env.MERCHANT_ID!,
  certificatePath: process.env.CERTIFICATE_PATH!,
  keyPath: process.env.KEY_PATH!
});

describe('DataVault', () => {
  let dataVaultToken: string;

  it('Can create a DataVault token', async () => {
    const result = await azul.valut.create({
      cardNumber: '6011000990099818',
      expiration: '202412',
      CVC: '818'
    });

    expect(result).toBeDefined();
    expect(result.IsoCode).toBe('00');
    expect(result.DataVaultToken).toBeDefined();
    dataVaultToken = result.DataVaultToken!;
  }, 10000);

  it('Can make a payment with a DataVault token', async () => {
    const result = await azul.valut.sale({
      dataVaultToken,
      amount: 100,
      ITBIS: 10
    });

    expect(result).toBeDefined();
    expect(result.IsoCode).toBe('00');
  }, 10000);

  it('Can delete a DataVault token', async () => {
    const result = await azul.valut.delete(dataVaultToken);

    expect(result).toBeDefined();
    expect(result.IsoCode).toBe('00');
  }, 10000);

  it('After deleting a DataVault token, it should not be possible to make a payment with it', async () => {
    const result = await azul.valut.sale({
      dataVaultToken,
      amount: 100,
      ITBIS: 10
    });

    expect(result).toBeDefined();
    expect(result.IsoCode).not.toBe('00');
  }, 10000);
});
