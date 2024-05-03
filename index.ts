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
    if (req.url.endsWith("/create-session")) {
      const { url: redirectURL } = await azulPageServer.createSession({
        currencyCode: "$",
        orderNumber: "1234",
        amount: 1000,
        itbis: 100,
        approvedUrl: "https://rapidotickets.com/",
        declinedUrl: "https://rapidotickets.com/",
        cancelUrl: "https://rapidotickets.com/",
      });
      return new Response(JSON.stringify({ redirectURL }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(`<html>
<head>
  <title>Payment Button</title>
</head>
<body>
  <button id="payButton">Pay Now</button>
  <script>
      document.getElementById('payButton').addEventListener('click', function() {
          fetch('/create-session')
              .then(response => response.json())
              .then(data => {
                  window.location.href = data.redirectURL;
              })
              .catch(error => console.error('Error:', error));
      });
  </script>
</body>
</html>`, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
});
