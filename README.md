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

- Support for both Azul Payment Page and API (WebService)
- Type-safe request and response handling.
- Throughly tested and documented.

## Installation

```bash
$ npm install @lucrise/azul-ts
```

## Configuration

```typescript
import AzulAPI from '@lucrise/azul-ts';

const azul = new AzulAPI({
  auth1: 'your-auth1',
  auth2: 'your-auth2',
  merchantId: 'your-merchant-id',
  certificatePath: 'your-certificate-path',
  keyPath: 'your-key-path'
});
```

The `auth1` and `auth2` are the authentication credentials provided by Azul.
The `merchantId` is the merchant ID provided by Azul.
The `certificatePath` is the path to the certificate sent to youby Azul.
The `keyPath` is the path to the private key that generated the CSR file you sent to Azul in order to obtain the certificate.

## Usage

### Payment Page

To use the Azul Payment page, you need to initialize the `AzulPage` class with your merchant ID, auth key, merchant name, merchant type, and environment.

```typescript
import AzulPage from '../azul-page';

const azul = new AzulPage({
  merchantId: process.env.MERCHANT_ID!,
  authKey: process.env.AUTH_KEY!,
  merchantName: 'RapidoTickets',
  merchantType: 'Ecommerce',
  environment: 'dev'
});
```

Then, you can create a form that will redirect the user to the Azul Payment Page.

For example, let's assume you are calling the `createForm` from the frontend after clicking the "Pay now" button.

You'd need to pass the following parameters to the `createForm` function:

```typescript
import express from 'express';

const app = express();

app.get('/pay-now', async (req, res) => {
  res.send(
    azul.createForm({
      orderNumber: req.query.orderNumber,
      amount: req.query.amount,
      ITBIS: req.query.ITBIS,
      approvedUrl: 'https://rapidotickets.com/approved',
      declinedUrl: 'https://rapidotickets.com/declined',
      cancelUrl: 'https://rapidotickets.com/canceled'
    })
  );
});

app.listen(3000);
```

Upon submitting the form, the user will be redirected to the Azul Payment Page, where they can enter their payment information and complete the transaction.

This form is invisible to the user, it only serves as a way to redirect them to the Azul Payment Page.

![Azul Payment Page](.github/azul-payment-page.png)

Depending whether the transaction was successful or not, you'll need to redirect the user to the appropriate route.

The `approvedUrl`, `declinedUrl`, and `cancelUrl` parameters are used to specify the URLs that the user will be redirected to after a successful or unsuccessful transaction. You'll need to handle these escenarios accordingly.

Let's assume the user successfully completes the transaction. The user will be redirected to the `approvedUrl` route with the following queryparameters:

```
https://rapidotickets.com/?OrderNumber=1234&Amount=1000&Itbis=100&AuthorizationCode=OK7433&DateTime=20240502233454&ResponseCode=ISO8583&IsoCode=00&ResponseMessage=APROBADA&ErrorDescription=&RRN=2024050223345744343807&AuthHash=ead90f9eecf951f612a11bb6f722786ea2c68b78a147f40a13a7ec4be9ee0bd315eee55a5a96169e61516155e4b66c39ad764338de87c24b7ac88bf819965596&CustomOrderId=&CardNumber=54241802****1732&DataVaultToken=&DataVaultExpiration=&DataVaultBrand=&AzulOrderId=44343807&DCCOffered=1&DCCApplied=0&DCCCurrency=840&DCCCurrencyAlpha=USD&DCCExchangeRate=00185&DCCMarkup=500&DCCAmount=019&Discounted=0
```
