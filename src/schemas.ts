import z from 'zod';

export const channel = z.string().max(3).optional().default('EC');
export const azulOrderId = z.string().max(8);
export const amount = z.number().int().positive();
export const ITBIS = z.number().int().nonnegative();
export const cardNumber = z.string().max(19).optional();
export const expiration = z.string().length(6).optional();
export const CVC = z.string().length(3).optional();
export const posInputMode = z.string().max(10).optional().default('E-Commerce');
export const orderNumber = z.string().max(15).optional();
export const customerServicePhone = z.string().max(32).optional();
export const ECommerceURL = z.string().max(32).optional();
export const customOrderId = z.string().max(75).optional();
export const altMerchantName = z.string().max(25).optional();
export const dataVaultToken = z.string().max(36).optional();
export const saveToDataVault = z.enum(['1', '2']).optional();
export const forceNo3DS = z.enum(['0', '1']).optional();
