import express from 'express';
import AzulAPI from '../src/azul-api/api';
import { ChallengeIndicator } from '../src/azul-api/secure/types';
import 'dotenv/config';

const app = express();
app.use(express.urlencoded({ extended: true }));

const CARDS = [
  {
    value: '4149011500000519',
    label: '3D Secure Method con desafío'
  },
  {
    value: '4265880000000007',
    label: 'Sin fricción con 3DSMethod'
  },
  {
    value: '4147463011110117',
    label: 'Sin fricción sin 3DSMethod'
  },
  {
    value: '4005520000000129',
    label: 'Desafío con 3DSMethod'
  },
  {
    value: '4147463011110059',
    label: 'Desafío sin 3DSMethod'
  },
  {
    value: '4149011500000527',
    label: 'Desafío'
  }
];

const azul = new AzulAPI({
  auth1: process.env.AUTH1!,
  auth2: process.env.AUTH2!,
  merchantId: process.env.MERCHANT_ID!,
  certificatePath: process.env.CERTIFICATE_PATH!,
  keyPath: process.env.KEY_PATH!
});

app.get('/', (req, res) => {
  res.send(
    `
    <h1>3DS Example</h1>
    <h2>Choose a card</h2>
    ${CARDS.map(
      (card) => `<a href="/buy?cardNumber=${card.value}"><button>${card.label}</button></a>`
    ).join('<br><br>')}
    `
  );
});

app.get('/buy', async (req, res) => {
  const cardNumber = req.query.cardNumber;

  if (typeof cardNumber !== 'string') {
    return res.status(400).send('Invalid card number');
  }

  const result = await azul.secure.sale({
    cardNumber,
    expiration: '202412',
    CVC: '818',
    customOrderId: '1234',
    amount: 1000,
    ITBIS: 100,
    browserInfo: {
      AcceptHeader:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signedexchange;v=b3;q=0.9',
      IPAddress: '127.0.0.1',
      Language: 'en-US',
      ColorDepth: '24',
      ScreenWidth: '2880',
      ScreenHeight: '1800',
      TimeZone: '240',
      UserAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36',
      JavaScriptEnabled: true
    },
    cardHolderInfo: {
      BillingAddressCity: 'Ciudad Facturación',
      BillingAddressCountry: 'País Facturación',
      BillingAddressLine1: 'Línea 1 Dirección Facturación',
      BillingAddressLine2: 'Línea 2 Dirección Facturación',
      BillingAddressLine3: 'Línea 3 Dirección Facturación',
      BillingAddressState: 'Estado o Provincia Facturación',
      BillingAddressZip: '99999',
      Email: 'correo@dominio.com',
      Name: 'Nombre Tarjetahabiente',
      PhoneHome: '8099999999',
      PhoneMobile: '8299999999',
      PhoneWork: '8499999999',
      ShippingAddressCity: 'Ciudad Envío',
      ShippingAddressCountry: 'País Envío',
      ShippingAddressLine1: 'Línea 1 Dirección Envío',
      ShippingAddressLine2: 'Línea 2 Dirección Envío',
      ShippingAddressLine3: 'Línea 3 Dirección Envío',
      ShippingAddressState: 'Estado o Provincia Facturación',
      ShippingAddressZip: '99999'
    },
    threeDSAuth: {
      TermUrl: 'http://localhost:3000/post-3ds',
      MethodNotificationUrl: 'http://localhost:3000/capture-3ds',
      RequestorChallengeIndicator: ChallengeIndicator.NO_PREFERENCE
    }
  });

  if (result.redirect) {
    res.send(result.html);
  } else {
    if (result.value.IsoCode === '00') {
      res.send(result.value);
    } else {
      res.status(500).send('Error');
    }
  }
});

app.post('/post-3ds', async (req, res) => {
  const { id } = req.query;
  const { cres } = req.body;

  if (typeof id !== 'string' || typeof cres !== 'string') {
    return res.status(400).send('Invalid ID');
  }

  res.send(await azul.secure.post3DS(id, cres));
});

app.post('/capture-3ds', async (req, res) => {
  const id = req.query.id;

  if (typeof id !== 'string') {
    return res.status(400).send('Invalid ID');
  }

  res.send(await azul.secure.capture3DS(id));
});

app.listen(3000);
