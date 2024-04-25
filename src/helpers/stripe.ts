const isProduction = process.env.NODE_ENV === "production";

const stripeKey = isProduction
  ? process.env.LIVE_STRIPE_SECRET_KEY
  : process.env.TEST_STRIPE_SECRET_KEY;

const stripe = require("stripe")(stripeKey);

export const getStripeIntent = async (
  amount: number,
  currency: string,
  paymentMethodId: string,
  customerEmail: string
) => {
  const description = "TaaS" + customerEmail;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: currency,
    payment_method_types: ["card"],
    description: description,
    receipt_email: customerEmail,
    payment_method: paymentMethodId,
    confirmation_method: "automatic",
    // confirm: true
  });

  return await paymentIntent;
};
