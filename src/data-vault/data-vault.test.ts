import { assert, describe, it } from 'vitest';

import { azul } from '../tests/instance';
import { TEST_CARDS } from '../tests/fixtures/cards';
import 'dotenv/config';

describe('DataVault', () => {
  it('Can create a DataVault token', async () => {
    const card = TEST_CARDS.MASTERCARD_1;

    const result = await azul.vault.create({
      cardNumber: card.number,
      expiration: card.expiration,
      CVC: card.cvv
    });

    assert(result.IsoCode === '00');
  });

  it('Can make a payment with a DataVault token', async () => {
    const card = TEST_CARDS.MASTERCARD_1;

    const createDataVaultresult = await azul.vault.create({
      cardNumber: card.number,
      expiration: card.expiration,
      CVC: card.cvv
    });

    const result = await azul.sale({
      type: 'token',
      dataVaultToken: createDataVaultresult.DataVaultToken,
      amount: 100,
      ITBIS: 10
    });

    assert(result.type === 'success');
  });

  it('Can delete a DataVault token', async () => {
    const card = TEST_CARDS.MASTERCARD_1;

    const createDataVaultresult = await azul.vault.create({
      cardNumber: card.number,
      expiration: card.expiration,
      CVC: card.cvv
    });

    const result = await azul.vault.delete({
      dataVaultToken: createDataVaultresult.DataVaultToken
    });

    assert(result.IsoCode === '00');
  });

  it('After deleting a DataVault token, it should not be possible to make a payment with it', async () => {
    const card = TEST_CARDS.MASTERCARD_1;

    const createDataVaultresult = await azul.vault.create({
      cardNumber: card.number,
      expiration: card.expiration,
      CVC: card.cvv
    });

    const deleteDataVaultresult = await azul.vault.delete({
      dataVaultToken: createDataVaultresult.DataVaultToken
    });

    assert(deleteDataVaultresult.IsoCode === '00');

    const response = await azul.sale({
      type: 'token',
      dataVaultToken: createDataVaultresult.DataVaultToken,
      amount: 100,
      ITBIS: 10
    });

    assert(response.type === 'error');
  });
});
