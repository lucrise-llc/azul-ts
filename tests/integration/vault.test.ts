import { azul } from './instance';
import { describe, expect, it } from 'vitest';
import 'dotenv/config';
import { getCard } from '../fixtures/cards';
import {
  expectSuccessfulPayment,
  expectSuccessfulVaultResponse,
  expectSuccessfulVaultDeletion
} from '../utils';
import { generateOrderNumber } from '../fixtures/order';

describe('DataVault', () => {
  let dataVaultToken: string;

  it('Can create a DataVault token', async () => {
    const testCard = getCard('DISCOVER');
    const result = await azul.vault.create({
      cardNumber: testCard.number,
      expiration: testCard.expiration,
      CVC: testCard.cvv,
      channel: 'EC',
      store: process.env.MERCHANT_ID!,
      trxType: 'CREATE',
      saveToDataVault: '1'
    });

    expect(result).toBeDefined();
    expectSuccessfulVaultResponse(result);
    dataVaultToken = result.DataVaultToken!;
  }, 60000);

  it('Can make a payment with a DataVault token', async () => {
    const orderNumber = generateOrderNumber();
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
    expectSuccessfulVaultDeletion(result);
  }, 60000);

  it('After deleting a DataVault token, it should not be possible to make a payment with it', async () => {
    const orderNumber = generateOrderNumber();
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
