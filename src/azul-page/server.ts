import crypto from "crypto";
import { PaymentPageRequest } from "./schemas";

type AzulPageServerConfig = {
  merchantId: string;
  merchantName: string;
  merchantType: string;
  authKey: string;
  environment: "dev" | "prod";
};

type Session = {
  url: string;
};

class AzulPageServer {
  private config: AzulPageServerConfig;
  private azulURL: string;

  constructor(config: AzulPageServerConfig) {
    this.config = config;

    if (config.environment === "dev") {
      this.azulURL = "https://pruebas.azul.com.do/PaymentPage/";
    } else {
      this.azulURL = "https://pagos.azul.com.do/PaymentPage/";
    }
  }

  private authHash(paymentPageRequest: PaymentPageRequest) {
    const request = [
      this.config.merchantId,
      this.config.merchantName,
      this.config.merchantType,
      paymentPageRequest.currencyCode,
      paymentPageRequest.orderNumber,
      paymentPageRequest.amount,
      paymentPageRequest.itbis,
      
      paymentPageRequest.approvedUrl,
      paymentPageRequest.declinedUrl,
      paymentPageRequest.cancelUrl,
      
      paymentPageRequest.useCustomField1,
      paymentPageRequest.customField1Label,
      paymentPageRequest.customField1Value,
      
      paymentPageRequest.useCustomField2,
      paymentPageRequest.customField2Label,
      paymentPageRequest.customField2Value,

      this.config.authKey,
    ].join("");
    console.log("request: ", request)
    console.log("request comma: ", [
      this.config.merchantId,
      this.config.merchantName,
      this.config.merchantType,
      paymentPageRequest.currencyCode,
      paymentPageRequest.orderNumber,
      paymentPageRequest.amount,
      paymentPageRequest.itbis,
      
      paymentPageRequest.approvedUrl,
      paymentPageRequest.declinedUrl,
      paymentPageRequest.cancelUrl,
      
      paymentPageRequest.useCustomField1,
      paymentPageRequest.customField1Label,
      paymentPageRequest.customField1Value,
      
      paymentPageRequest.useCustomField2,
      paymentPageRequest.customField2Label,
      paymentPageRequest.customField2Value,

      this.config.authKey,
    ].join(" , "))
    console.log("request key value: ", {
      merchantId: this.config.merchantId,
      merchantName: this.config.merchantName,
      merchantType: this.config.merchantType,
      currencyCode: paymentPageRequest.currencyCode,
      orderNumber: paymentPageRequest.orderNumber,
      amount: paymentPageRequest.amount,
      itbis: paymentPageRequest.itbis,

      approvedUrl: paymentPageRequest.approvedUrl,
      declinedUrl: paymentPageRequest.declinedUrl,
      cancelUrl: paymentPageRequest.cancelUrl,

      useCustomField1: paymentPageRequest.useCustomField1,
      customField1Label: paymentPageRequest.customField1Label,
      customField1Value: paymentPageRequest.customField1Value,

      useCustomField2: paymentPageRequest.useCustomField2,
      customField2Label: paymentPageRequest.customField2Label,
      customField2Value: paymentPageRequest.customField2Value,
      
      authKey: this.config.authKey,

    })

    return crypto
      .createHmac("sha512", this.config.authKey)
      .update(request)
      .digest('hex')
  }

  generateCheckoutForm(userPaymentPageRequest: PaymentPageRequest) {
    const paymentPageRequestResult = PaymentPageRequest.safeParse(userPaymentPageRequest);
    
    if (!paymentPageRequestResult.success) {
      throw new Error("Invalid payment page request");
    }

    console.log("paymentPageRequestResult.data:", paymentPageRequestResult.data)
    const paymentPageRequest = paymentPageRequestResult.data;
    const authHash = this.authHash(paymentPageRequest);
    return `<html>
<body>
<form method="POST" action="${this.azulURL}">
<input type="hidden" id="MerchantId" name="MerchantId" value="${this.config.merchantId}" />
<input type="hidden" id="MerchantName" name="MerchantName" value="${this.config.merchantName}" />
<input type="hidden" id="MerchantType" name="MerchantType" value="${this.config.merchantType}" />
<input type="hidden" id="CurrencyCode" name="CurrencyCode" value="${paymentPageRequest.currencyCode}" />
<input type="hidden" id="OrderNumber" name="OrderNumber" value="${paymentPageRequest.orderNumber}" />
<input type="hidden" id="Amount" name="Amount" value="${paymentPageRequest.amount}" />
<input type="hidden" id="ITBIS" name="ITBIS" value="${paymentPageRequest.itbis}" />
<input type="hidden" id="ApprovedUrl" name="ApprovedUrl" value="${paymentPageRequest.approvedUrl}" />
<input type="hidden" id="DeclinedUrl" name="DeclinedUrl" value="${paymentPageRequest.declinedUrl}" />
<input type="hidden" id="CancelUrl" name="CancelUrl" value="${paymentPageRequest.cancelUrl}" />
<input type="hidden" id="UseCustomField1" name="UseCustomField1" value="${paymentPageRequest.useCustomField1}" />
<input type="hidden" id="UseCustomField2" name="UseCustomField2" value="${paymentPageRequest.useCustomField2}" />
<input type="hidden" id="AuthHash" name="AuthHash" value="${authHash}" />
<input type="submit" value="Pay Now" />
</body>
<html>`
  }

  async createSession(
    userPaymentPageRequest: PaymentPageRequest
  ): Promise<Session> {
    const paymentPageRequest = PaymentPageRequest.parse(userPaymentPageRequest);
    const authHash = this.authHash(paymentPageRequest);

    const url = new URL(this.azulURL);
    url.searchParams.set("MerchantId", this.config.merchantId);
    url.searchParams.set("MerchantName", this.config.merchantName);
    url.searchParams.set("MerchantType", this.config.merchantType);
    url.searchParams.set("CurrencyCode", paymentPageRequest.currencyCode);
    url.searchParams.set("OrderNumber", paymentPageRequest.orderNumber);
    url.searchParams.set("Amount", paymentPageRequest.amount.toString());
    url.searchParams.set("ITBIS", paymentPageRequest.itbis.toString());
    url.searchParams.set("ApprovedUrl", paymentPageRequest.approvedUrl);
    url.searchParams.set("DeclinedUrl", paymentPageRequest.declinedUrl);
    url.searchParams.set("CancelUrl", paymentPageRequest.cancelUrl);

    if (paymentPageRequest.useCustomField1) {
      url.searchParams.set(
        "UseCustomField1",
        paymentPageRequest.useCustomField1
      );

      url.searchParams.set(
        "CustomField1Label",
        paymentPageRequest.customField1Label!
      );

      url.searchParams.set(
        "CustomField1Value",
        paymentPageRequest.customField1Value!
      );
    }

    if (paymentPageRequest.useCustomField2) {
      url.searchParams.set(
        "UseCustomField2",
        paymentPageRequest.useCustomField2
      );

      url.searchParams.set(
        "CustomField2Label",
        paymentPageRequest.customField2Label!
      );

      url.searchParams.set(
        "CustomField2Value",
        paymentPageRequest.customField2Value!
      );
    }

    url.searchParams.set("AuthHash", authHash);

    const response = await fetch(url, {
      method: "POST",
      redirect: "manual",
    });

    if (response.status !== 302) {
      throw new Error("Failed to create session");
    }

    if (!response.redirected) {
      throw new Error("Failed to create session");
    }

    return {
      url: "https://" + url.host + response.headers.get("Location"),
    };
  }
}

export default AzulPageServer;
