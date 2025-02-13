import express from 'express';
import AzulAPI from '../src/azul-api/api';
import { ChallengeIndicator } from '../src/azul-api/secure/types';
import { TEST_CARDS } from '../tests/fixtures/cards';
import { generateOrderNumber } from '../tests/fixtures/order';
import 'dotenv/config';

const app = express();
app.use(express.urlencoded({ extended: true }));

const CARDS = [
  {
    number: TEST_CARDS.SECURE_3DS_FRICTIONLESS_WITH_3DS.number,
    label: 'Sin fricción con 3DSMethod',
    expiration: TEST_CARDS.SECURE_3DS_FRICTIONLESS_WITH_3DS.expiration,
    cvv: TEST_CARDS.SECURE_3DS_FRICTIONLESS_WITH_3DS.cvv
  },
  {
    number: TEST_CARDS.SECURE_3DS_FRICTIONLESS_NO_3DS.number,
    label: 'Sin fricción sin 3DS', // Correct label
    expiration: TEST_CARDS.SECURE_3DS_FRICTIONLESS_NO_3DS.expiration,
    cvv: TEST_CARDS.SECURE_3DS_FRICTIONLESS_NO_3DS.cvv
  },
  {
    number: TEST_CARDS.SECURE_3DS_CHALLENGE_WITH_3DS.number,
    label: 'Desafío con 3DSMethod (Limite RD$ 50)',
    expiration: TEST_CARDS.SECURE_3DS_CHALLENGE_WITH_3DS.expiration,
    cvv: TEST_CARDS.SECURE_3DS_CHALLENGE_WITH_3DS.cvv
  },
  {
    number: TEST_CARDS.SECURE_3DS_CHALLENGE_NO_3DS.number,
    label: 'Desafío sin 3DSMethod',
    expiration: TEST_CARDS.SECURE_3DS_CHALLENGE_NO_3DS.expiration,
    cvv: TEST_CARDS.SECURE_3DS_CHALLENGE_NO_3DS.cvv
  }
];

const azul = new AzulAPI({
  auth1: process.env.AUTH1!,
  auth2: process.env.AUTH2!,
  merchantId: process.env.MERCHANT_ID!,
  certificate: process.env.AZUL_CERT!,
  key: process.env.AZUL_KEY!
});

// Configuration for channel, posInputMode, and acquirerRefData
const SALE_CONFIG = {
  channel: 'EC', // E-Commerce channel
  posInputMode: 'E-Commerce',
  acquirerRefData: '1' as '0' | '1', // Type assertion to match the enum type
  forceNo3DS: '0' as '0' | '1' // Add forceNo3DS here, default to '0' (3DS enabled)
};

app.get('/', (req, res) => {
  res.send(
    `
    <h1>3DS Example</h1>
    <form action="/buy" method="post">
      <label for="card">Card:</label>
      <select name="card" id="card">
        ${CARDS.map((card) => `<option value="${card.number}">${card.label}</option>`)}
      </select>
      <br>
      <label for="amount">Amount:</label>
      <input type="number" name="amount" id="amount" value="10.00" step="0.01">
      <br>
      <label for="itbis">ITBIS:</label>
      <input type="number" name="itbis" id="itbis" value="1.80" step="0.01" readonly>
      <br><br>
      <button type="submit">Buy</button>
    </form>
    <script>
      const amountInput = document.getElementById('amount');
      const itbisInput = document.getElementById('itbis');

      amountInput.addEventListener('input', () => {
        const amount = parseFloat(amountInput.value);
        const itbis = amount * 0.18;
        itbisInput.value = itbis.toFixed(2);
      });

      // Trigger the calculation on initial load
      amountInput.dispatchEvent(new Event('input'));
    </script>
    `
  );
});

app.post('/buy', async (req, res) => {
  const { card, amount, itbis } = req.body;

  const selectedCard = CARDS.find((c) => c.number === card);
  if (!selectedCard) {
    return res.status(400).send('Invalid card selected');
  }

  const orderId = generateOrderNumber();

  // Determine ForceNo3DS and RequestorChallengeIndicator based on the selected card
  let forceNo3DS = '0' as '0' | '1';
  let requestorChallengeIndicator = ChallengeIndicator.NO_PREFERENCE;

  if (selectedCard.label.includes('Sin fricción sin 3DS')) {
    forceNo3DS = '1';
    requestorChallengeIndicator = ChallengeIndicator.NO_CHALLENGE;
  } else if (selectedCard.label.includes('Sin fricción con 3DSMethod')) {
    forceNo3DS = '0';
    requestorChallengeIndicator = ChallengeIndicator.NO_CHALLENGE;
  } else if (selectedCard.label.includes('Desafío sin 3DSMethod')) {
    forceNo3DS = '1';
    requestorChallengeIndicator = ChallengeIndicator.CHALLENGE;
  } else if (selectedCard.label.includes('Desafío con 3DSMethod')) {
    forceNo3DS = '0';
    requestorChallengeIndicator = ChallengeIndicator.CHALLENGE;
  }

  try {
    const result = await azul.secure.sale({
      amount: Math.round(Number(amount) * 100),
      ITBIS: Math.round(Number(itbis) * 100),
      cardNumber: selectedCard.number,
      CVC: selectedCard.cvv,
      expiration: selectedCard.expiration,
      orderNumber: orderId,
      channel: SALE_CONFIG.channel,
      posInputMode: SALE_CONFIG.posInputMode,
      acquirerRefData: SALE_CONFIG.acquirerRefData,
      forceNo3DS: forceNo3DS, // Pass forceNo3DS here
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
        RequestorChallengeIndicator: requestorChallengeIndicator,
        MethodNotificationUrl: `http://localhost:3000/capture-3ds?id=${orderId}`,
        TermUrl: `http://localhost:3000/post-3ds?id=${orderId}`
      }
    });

    if (result.redirect) {
      res.send(`${result.html} <p>Redirecting for 3DS Challenge...</p>`);
    } else {
      const isoCode = result.value.IsoCode;
      const responseMessage = result.value.ResponseMessage;

      if (isoCode === '00' && responseMessage === 'APROBADA') {
        res.send(`<p>Transaction Approved!</p><pre>${JSON.stringify(result.value, null, 2)}</pre>`);
      } else {
        const message = result.value.Message || 'Unknown error';
        res.status(500).send(`<p>Error processing transaction: ${isoCode} - ${message}</p>`);
      }
    }
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).send('<p>Error processing transaction: - Unknown error</p>');
  }
});

app.post('/post-3ds', async (req, res) => {
  const { id } = req.query;
  const { cres } = req.body;

  // Check if id is an array and get the second element
  let secureId: string;
  if (Array.isArray(id)) {
    if (id.length < 2) {
      return res.status(400).send('Invalid ID: Secure ID missing');
    }
    secureId = String(id[1]);
  } else if (typeof id === 'string') {
    //This should never happen now
    return res.status(400).send('Invalid ID: Secure ID missing');
  } else {
    return res.status(400).send('Invalid ID');
  }

  try {
    const result = await azul.secure.post3DS(secureId, cres);
    res.send(`<p>Transaction Result:</p><pre>${JSON.stringify(result, null, 2)}</pre>`);
  } catch (error) {
    console.error('Error during post3DS:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    res.status(500).send(`<p>An error occurred: ${errorMessage}</p>`);
  }
});

app.post('/capture-3ds', async (req, res) => {
  const id = req.query.id;
  console.log('ID', id);

  // Check if id is an array and get the second element
  let secureId: string;
  if (Array.isArray(id)) {
    if (id.length < 2) {
      return res.status(400).send('Invalid ID: Secure ID missing');
    }
    secureId = String(id[1]);
  } else if (typeof id === 'string') {
    //This should never happen now
    return res.status(400).send('Invalid ID: Secure ID missing');
  } else {
    return res.status(400).send('Invalid ID');
  }

  try {
    const result = await azul.secure.capture3DS(secureId);
    if (result.redirect) {
      res.send(`${result.html} <p>Redirecting for 3DS Challenge...</p>`);
    } else {
      res.send(`<p>Transaction Result:</p><pre>${JSON.stringify(result.value, null, 2)}</pre>`);
    }
  } catch (error) {
    console.error('Error during capture3DS:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    res.status(500).send(`<p>An error occurred: ${errorMessage}</p>`);
  }
});

app.listen(3000, () => {
  console.log('3DS Example app listening on port 3000');
});
