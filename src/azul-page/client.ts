import { PaymentPageRequest } from "./schemas";

type AzulPageClientConfig = {
  environment: "dev" | "prod";
};

class AzulPageClient {
  private config: AzulPageClientConfig;
  private azulURL: string;

  constructor(config: AzulPageClientConfig) {
    this.config = config;
    if (config.environment === "dev") {
      this.azulURL = "https://pruebas.azul.com.do/PaymentPage/";
    } else {
      this.azulURL = "https://pagos.azul.com.do/PaymentPage/";
    }
  }

  private async paymentRequest(handlerURL: string, data: PaymentPageRequest) {
    const response = await fetch(handlerURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Payment request failed");
    }

    const responseData = await response.json();

    const form = document.createElement("form");
    form.method = "POST";
    form.action = this.azulURL;
    form.style.display = "none";

    for (const key in responseData) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = responseData[key];
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  public handlePaymentForm({
    formId,
    handlerURL,
  }: {
    formId: string;
    handlerURL: string;
  }) {
    const form = document.getElementById(formId) as HTMLFormElement;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
    });
  }
}

// Browser
const azulClient = new AzulPageClient({
  environment: "dev",
});

azulClient.handlePaymentForm({
  formId: "payment-form",
  handlerURL: "/api/payment-handler",
});

