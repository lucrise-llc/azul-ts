import express from "express";
import AzulPage from "../page";

const app = express();

const azul = new AzulPage({
  merchantId: process.env.MERCHANT_ID!,
  authKey: process.env.AUTH_KEY!,
  merchantName: "RapidoTickets",
  merchantType: "Ecommerce",
  environment: "dev",
});

app.get("/", (req, res) => {
  res.send(`
<form action="/buy-ticket" method="GET">
  <input type="submit" value="Pay now" />
</form>
  `);
});

app.get("/buy-ticket", async (req, res) => {
  res.send(
    azul.createForm({
      orderNumber: "1234",
      amount: 1000,
      ITBIS: 100,
      approvedUrl: "https://rapidotickets.com/",
      declinedUrl: "https://rapidotickets.com/",
      cancelUrl: "https://rapidotickets.com/",
    })
  );
});

app.listen(3000);
