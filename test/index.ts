import AzulPageServer from "../src/azul-page/server";

const azulPageServer = new AzulPageServer({
  merchantId: "",
  merchantName: "RapidoTickets",
  merchantType: "Tickets digitales",
  authKey: "",
  environment: "dev",
});

async function main() {
    const session = await azulPageServer.createSession({
        currencyCode: "DOP",
        orderNumber: "1234",
        amount: 1000,
        itbis: 100,
        approvedUrl: "https://rapidotickets.com/",
        declinedUrl: "https://rapidotickets.com/",
        cancelUrl: "https://rapidotickets.com/",
        
    });

    console.log(session.url);
}

main();
