import AzulPageServer from "./src/azul-page/server";

const azulPageServer = new AzulPageServer({
  merchantId: "",
  merchantName: "RapidoTickets",
  merchantType: "TicketsDigitales",
  authKey: "",
  environment: "dev",
});

Bun.serve({
  port: 8080,
  fetch(req) {
    const checkoutPageHTML = azulPageServer.generateCheckoutForm({
      currencyCode: "$",
      orderNumber: "1234",
      amount: 1000,
      itbis: 100,
      approvedUrl: "https://rapidotickets.com/",
      declinedUrl: "https://rapidotickets.com/",
      cancelUrl: "https://rapidotickets.com/",
    });

    return new Response(checkoutPageHTML, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
});
