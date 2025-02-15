import z from 'zod';

export const channel = z.string().max(3).default('EC');
export const azulOrderId = z.string().max(8);
export const amount = z.number().int().positive();
export const ITBIS = z.number().int().nonnegative();
export const cardNumber = z.string().max(19);
export const expiration = z.string().length(6);
export const CVC = z.string().length(3);
export const posInputMode = z.string().max(10).default('E-Commerce');
export const orderNumber = z.string().max(15);
export const customerServicePhone = z.string().max(32);
export const ECommerceURL = z.string().max(32);
export const customOrderId = z.string().max(75).optional();
export const saveToDataVault = z.enum(['1', '2']).optional();
export const forceNo3DS = z.enum(['0', '1']);
