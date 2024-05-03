import AzulPageServer from "./src/azul-page/server";

const azulPageServer = new AzulPageServer({
  merchantId: "",
  merchantName: "RapidoTickets",
  merchantType: "Ecommerce",
  authKey: "",
  environment: "dev",
});

Bun.serve({
  port: 8080,
  async fetch(req) {
    const { url: redirectURL } = await azulPageServer.createSession({
      currencyCode: "$",
      orderNumber: "1234",
      amount: 1000,
      itbis: 100,
      approvedUrl: "https://rapidotickets.com/",
      declinedUrl: "https://rapidotickets.com/",
      cancelUrl: "https://rapidotickets.com/",
    });

    // Redirect to the payment page
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectURL,
      },
    });
  },
});
