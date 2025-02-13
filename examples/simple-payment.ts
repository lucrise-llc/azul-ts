#!/usr/bin/env node
import 'dotenv/config';
import AzulAPI from '../src/api';
import { randomUUID } from 'crypto';
import { getCard } from '../tests/fixtures/cards';

/**
 * Simple payment workflow demonstration
 */
async function processPayment() {
  try {
    // Initialize Azul client
    const azul = new AzulAPI({
      auth1: process.env.AUTH1!,
      auth2: process.env.AUTH2!,
      merchantId: process.env.MERCHANT_ID!,
      certificate: process.env.AZUL_CERT!,
      key: process.env.AZUL_KEY!
    });

    // Test card details
    const testCard = getCard('VISA_TEST_CARD');
    const orderId = randomUUID();
    const amount = 100; // RD$100
    const ITBIS = 10; // RD$10

    console.log('🔍 Environment Verification:');
    console.log('Using Environment:', process.env.AZUL_ENV || 'dev');
    console.log(
      'Certificate Type:',
      process.env.AZUL_CERT?.startsWith('-----') ? 'PEM Content' : 'File Path'
    );
    console.log(
      'Key Type:',
      process.env.AZUL_KEY?.startsWith('-----') ? 'PEM Content' : 'File Path'
    );
    console.log('Certificate Length:', process.env.AZUL_CERT?.length);
    console.log('Key Length:', process.env.AZUL_KEY?.length);

    console.log('⏳ Creating payment hold...');
    const hold = await azul.payments.hold({
      cardNumber: testCard.number,
      expiration: testCard.expiration,
      CVC: testCard.cvv,
      customOrderId: orderId,
      amount,
      ITBIS
    });

    if (hold.IsoCode !== '00') {
      throw new Error(`Hold failed: ${hold.ResponseMessage}`);
    }
    console.log('✅ Hold created successfully');
    console.log(`🆔 Azul Order ID: ${hold.AzulOrderId}`);

    console.log('⏳ Posting payment...');
    const post = await azul.post({
      azulOrderId: hold.AzulOrderId!,
      amount,
      ITBIS
    });

    if (post.IsoCode !== '00') {
      throw new Error(`Post failed: ${post.ResponseMessage}`);
    }
    console.log('✅ Payment posted successfully');

    console.log('⏳ Verifying transaction...');
    const verification = await azul.verifyPayment(orderId);

    if (!verification.Found) {
      throw new Error('Payment verification failed: Transaction not found');
    }
    console.log('✅ Payment verified successfully');
    console.log('📄 Verification details:', verification);
  } catch (error) {
    console.error('💥 Payment workflow failed:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Execute the payment workflow
processPayment();
