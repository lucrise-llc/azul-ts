import { azul } from './instance';
import { describe, expect, it } from 'vitest';
import 'dotenv/config';

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
  }, 60000);

  it('Can make a payment with a DataVault token', async () => {
    const result = await azul.valut.sale({
      dataVaultToken,
      amount: 100,
      ITBIS: 10
    });

    expect(result).toBeDefined();
    expect(result.IsoCode).toBe('00');
  }, 60000);

  it('Can delete a DataVault token', async () => {
    const result = await azul.valut.delete(dataVaultToken);

    expect(result).toBeDefined();
    expect(result.IsoCode).toBe('00');
  }, 60000);

  it('After deleting a DataVault token, it should not be possible to make a payment with it', async () => {
    const result = await azul.valut.sale({
      dataVaultToken,
      amount: 100,
      ITBIS: 10
    });

    expect(result).toBeDefined();
    expect(result.IsoCode).not.toBe('00');
  }, 60000);
});
