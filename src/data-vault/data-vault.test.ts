import { describe, expect, it } from 'vitest';

import { azul } from '../tests/integration/instance';
import { TEST_CARDS } from '../tests/fixtures/cards';
import 'dotenv/config';

describe('DataVault', () => {
  let dataVaultToken: string;

  it('Can create a DataVault token', async () => {
    const card = TEST_CARDS.DISCOVER;

    const result = await azul.vault.create({
      cardNumber: card.number,
      expiration: card.expiration,
      CVC: card.cvv
    });

    expect(result.IsoCode).toBe('00');
    dataVaultToken = result.DataVaultToken;
  });

  it('Can make a payment with a DataVault token', async () => {
    const result = await azul.payments.sale({
      type: 'token',
      dataVaultToken,
      amount: 100,
      ITBIS: 10
    });

    expect(result.IsoCode).toBe('00');
  });

  it('Can delete a DataVault token', async () => {
    const result = await azul.vault.delete({ dataVaultToken });
    expect(result.IsoCode).toBe('00');
  });

  it('After deleting a DataVault token, it should not be possible to make a payment with it', async () => {
    const promise = azul.payments.sale({
      type: 'token',
      dataVaultToken,
      amount: 100,
      ITBIS: 10
    });

    await expect(promise).rejects.toThrow();
  });
});
