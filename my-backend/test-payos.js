import dotenv from "dotenv";
dotenv.config({ path: "./my-backend/.env" });
import PayOSPackage from "@payos/node";
const PayOS = PayOSPackage.PayOS || PayOSPackage;

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY
});

const run = async () => {
  try {
    const orderCode = Number(String(Date.now()).slice(-9) + Math.floor(Math.random() * 10).toString());
    console.log("orderCode:", orderCode);
    
    const body = {
      orderCode,
      amount: 1500000,
      description: "Thanh toan don hang",
      returnUrl: "http://localhost:5173/customer-dashboard?tab=rented",
      cancelUrl: "http://localhost:5173/customer-dashboard?tab=rented"
    };

    const paymentLinkRes = await payos.createPaymentLink(body);
    console.log("Success!", paymentLinkRes.checkoutUrl);
  } catch (error) {
    console.error("PayOS Error:", error);
  }
};
run();
