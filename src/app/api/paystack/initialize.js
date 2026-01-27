// api/paystack/initialize.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { email, amount } = req.body; // amount in kobo (₦100 = 10000 kobo)

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount,
      callback_url: "https://yourwebsite.com/success",
    }),
  });

  const data = await response.json();
  res.status(200).json({ url: data.data.authorization_url });
}
