<div align="center">
    <h1>azul-ts</h1>
    <big>Typescript library to seamlessly integrate with Azul payment gateway</big>
    <div>
    <br/>
        <a href="https://github.com/lucrise-llc/azul-ts/pulse"><img src="https://img.shields.io/github/last-commit/lucrise-llc/azul-ts.svg"/></a>
        <a href="https://github.com/lucrise-llc/azul-ts/pulls"><img src="https://img.shields.io/github/issues-pr/lucrise-llc/azul-ts.svg"/></a>
        <a href="https://github.com/lucrise-llc/azul-ts/issues"><img src="https://img.shields.io/github/issues-closed/lucrise-llc/azul-ts.svg"/></a>
    </div>
</div>
<br/>
</div>

## Introduction

This library is a Typescript wrapper for the Azul payment gateway API.

It provides a simple and intuitive interface for interacting with the Azul API, allowing you to easily integrate Azul payment gateway into your application.

## Features

- Support for Azul Payment API (WebService)
- Type-safe request and response handling.
- Throughly tested and documented.

## Installation

```bash
$ npm install @lucrise/azul-ts
```

## Usage

## API (WebService)

To use the Azul API, you need to initialize the `AzulAPI` class with your merchant ID, auth keys, and certificates.

```typescript
import AzulAPI from '@lucrise/azul-ts';

const azul = new AzulAPI({
  auth1: 'your-auth1',
  auth2: 'your-auth2',
  merchantId: 'your-merchant-id',
  certificate: 'path/to/certificate.crt',
  key: 'path/to/private.key',
  environment: 'dev',
  channel: 'EC'
});
```

The `auth1` and `auth2` are the authentication credentials provided by Azul.<br/>
The `merchantId` is the merchant ID provided by Azul.<br/>
The `certificate` is the certificate sent to you by Azul. Can be provided as a file path or PEM content directly.<br/>
The `key` is the private key that generated the CSR file. Can be provided as a file path or PEM content directly.<br/>
The `environment` determines which Azul endpoint to use ('dev' or 'prod'). Defaults to 'dev'.<br/>
The `channel` is the payment channel code provided by Azul. Defaults to 'EC'.<br/>

Then, you can use the `AzulAPI` class to make requests to the Azul API.

For example, let's assume you want to make a Sale transaction from your web application to a server running the Azul API.

```typescript
import express from 'express';

const app = express();

app.get('/pay-now', async (req, res) => {
  const result = await azul.payments.sale({
    cardNumber: req.query.cardNumber, // Card number without spaces or special chars
    expiration: req.query.expiration, // Format: YYYYMM (e.g., 202412)
    CVC: req.query.CVC, // 3 or 4 digits
    amount: req.query.amount, // Integer. Last 2 digits are decimals (e.g., 1000 = $10.00)
    ITBIS: req.query.ITBIS, // Integer. Last 2 digits are decimals (e.g., 100 = $1.00)
    customOrderId: req.query.customOrderId, // Optional. Max 75 chars. Used for payment verification
    orderNumber: req.query.orderNumber, // Optional. Max 15 chars
    channel: 'EC', // Optional. Defaults to 'EC'
    posInputMode: 'E-Commerce', // Optional. Defaults to 'E-Commerce'
    saveToDataVault: '2', // Optional. '1' to save card, '2' to not save
    altMerchantName: 'My Store' // Optional. Max 25 chars. Shown in card statement
  });

  res.send(result);
});

app.listen(3000);
```

The API does not require a redirection or any sort of form. It straights send your transaction data to the Azul WebService and result is returned in the response.

**NOTE: It is heavily recomended to set the `timeout` for this request to at least 120 seconds.**

For more examples, please take a look at our [tests](./tests) and [examples](./examples).
