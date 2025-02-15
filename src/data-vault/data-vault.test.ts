import { assert, describe, it } from 'vitest';

import { azul } from '../tests/instance';
import { TEST_CARDS } from '../tests/fixtures/cards';
import 'dotenv/config';

describe.concurrent('DataVault', () => {
  it('Can create a DataVault token', async () => {
    const card = TEST_CARDS.MASTERCARD_1;

    const result = await azul.vault.create({
      cardNumber: card.number,
      expiration: card.expiration,
      CVC: card.cvv
    });

    assert(result.type === 'success');
  });

  it('Should fail to create a DataVault token with an invalid card number', async () => {
    const result = await azul.vault.create({
      cardNumber: 'test',
      expiration: '122025',
      CVC: '123'
    });

    assert(result.type === 'error');
    assert(result.ErrorDescription === 'VALIDATION_ERROR:CardNumber');
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

    assert(result.type === 'success');
  });

  it('Should fail to delete a DataVault token with an invalid token', async () => {
    const result = await azul.vault.delete({
      dataVaultToken: 'test'
    });

    assert(result.type === 'error');
    assert(result.ErrorDescription === 'VALIDATION_ERROR:DataVaultToken');
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
