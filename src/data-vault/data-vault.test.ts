import { describe, expect, it } from 'vitest';

import { azul } from '../tests/integration/instance';
import { TEST_CARDS } from '../tests/fixtures/cards';
import { expectSuccessfulPayment } from '../tests/utils';
import 'dotenv/config';

describe('DataVault', () => {
  let dataVaultToken: string;

  it('Can create a DataVault token', async () => {
    const card = TEST_CARDS.DISCOVER;

    const result = await azul.vault.create({
      cardNumber: card.number,
      expiration: card.expiration,
      CVC: card.cvv,
      channel: 'EC',
      store: process.env.MERCHANT_ID!,
      trxType: 'CREATE',
      saveToDataVault: '1'
    });

    expect(result).toBeDefined();
    dataVaultToken = result.DataVaultToken;
  }, 60000);

  it('Can make a payment with a DataVault token', async () => {
    const orderNumber = Date.now().toString().slice(-15);
    const result = await azul.payments.sale({
      dataVaultToken,
      cardNumber: '',
      expiration: '',
      amount: 100,
      ITBIS: 10,
      channel: 'EC',
      posInputMode: 'E-Commerce',
      customOrderId: orderNumber,
      orderNumber,
      acquirerRefData: '1',
      customerServicePhone: '8095551234',
      ECommerceURL: 'https://example.com',
      altMerchantName: 'Test Merchant'
    });

    expect(result).toBeDefined();
    expectSuccessfulPayment(result);
  }, 60000);

  it('Can delete a DataVault token', async () => {
    const result = await azul.vault.delete({
      dataVaultToken,
      channel: 'EC',
      store: process.env.MERCHANT_ID!,
      trxType: 'DELETE'
    });

    expect(result).toBeDefined();
  }, 60000);

  it('After deleting a DataVault token, it should not be possible to make a payment with it', async () => {
    const orderNumber = Date.now().toString().slice(-15);
    const result = await azul.payments.sale({
      dataVaultToken,
      cardNumber: '',
      expiration: '',
      amount: 100,
      ITBIS: 10,
      channel: 'EC',
      posInputMode: 'E-Commerce',
      customOrderId: `FAIL${orderNumber}`,
      orderNumber,
      acquirerRefData: '1',
      customerServicePhone: '8095551234',
      ECommerceURL: 'https://example.com',
      altMerchantName: 'Test Merchant'
    });

    expect(result).toBeDefined();
    expect(result.IsoCode).not.toBe('00');
  }, 60000);
});
