import Transaction from "../Models/Transaction";
import Stripe from "stripe";
import User from "../schema/User";

const isProduction = process.env.NODE_ENV === "production";
const stripeKey = process.env.STRIPE_SECRET_KEY;

const endpointSecret = process.env.ENDPOINT_SECRET;

const domain = process.env.DOMAIN || "http://localhost:3000";
const stripe = new Stripe(stripeKey, {
  apiVersion: null,
});

export const createCheckoutSession = async (req, res) => {
  const lookupKey = req.body.lookup_key.toString();
  const { email } = req.user;
  try {
    const prices = await stripe.prices.list({
      expand: ["data.product"],
    });
    // const prices = await stripe.prices.list({
    //   lookup_keys: [lookupKey],
    //   expand: ["data.product"],
    // });
    const price = prices.data.find((p) => p.id === lookupKey);

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: "auto",
      line_items: [
        {
          price: price?.id,
          // For metered billing, do not pass quantity
          quantity: 1,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: `${domain}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}`,
      customer_email: email,
    });

    res.send({ status: 303, url: session.url, session_id: session.id });
  } catch (e) {
    console.log("error", e);
    res
      .status(500)
      .send({ success: false, msg: "Error creating checkout session" });
  }
};

export const createPortalSession = async (req, res) => {
  const userId = req.user._id.toString();
  try {
    const user = await User.findById(userId);
    if (user) {
      const checkoutSession = await stripe.checkout.sessions.retrieve(
        user.stripeCheckoutSessionId
      );

      const portalSession = await stripe.billingPortal.sessions.create({
        customer:
          typeof checkoutSession.customer == "string"
            ? checkoutSession.customer
            : checkoutSession.customer.id,
        return_url: domain,
      });
      res.send({ success: true, status: 303, url: portalSession.url });
    } else {
      res.status(400).send({ success: false, msg: "Could not find user" });
    }
  } catch (e) {
    console.log("createPortalSession use case error:", e);
    res
      .status(500)
      .send({ success: false, msg: "Error accessing portal session" });
  }
};

export const handleWebhookEvent = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event = req.body;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  const customerId = event?.data?.object?.customer;
  const subscriptionId = event?.data?.object?.id || ("" as string);
  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntentSucceeded = event.data.object;
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    case "account.updated":
      break;
    case "checkout.session.completed":
      console.log("checkout.session.completed", event);
      try {
        const customer = await stripe.customers.retrieve(customerId);
        console.log("customer", customer);
        const checkoutId = event?.data?.object?.id;
        // @ts-ignore
        const email = customer.email || "tech@rafartmusic.com";
        console.log({ checkoutId, email });
        // create a filter for a movie to update
        const filter = { email: email };

        // create a document that sets the plot of the movie
        const updateDoc = {
          $set: {
            stripeCheckoutSessionId: checkoutId,
          },
        };

        await User.updateOne(filter, updateDoc, {});
      } catch (e) {
        res.status(400).send("Error of checkout session registry");
      }
      break;
    case "customer.subscription.created":
      const subscriptionStart = event?.data?.object?.current_period_start || 0;
      const subscriptionEnd = event?.data?.object?.current_period_end || 0;
      try {
        const customer = await stripe.customers.retrieve(customerId);
        // @ts-ignore
        const email = customer.email;

        await _add(email, subscriptionId, subscriptionStart, subscriptionEnd);
      } catch (e) {
        res.status(400).send("Error of subscription registry");
      }
      break;
    case "customer.subscription.deleted":
      console.log("subscription deleted", event);
      try {
        const t = await Transaction.findOne({
          stripeSubscriptionId: subscriptionId,
        });
        const userId = t.userId;

        // DeleteTransaction
        await Transaction.deleteOne({
          stripeSubscriptionId: subscriptionId,
        });

        // Update stripeCheckoutSessionId
        const updateDoc = {
          $set: {
            stripeCheckoutSessionId: null,
          },
        };

        await User.updateOne({ _id: userId }, updateDoc, {});

        console.log("Transaction deleted and user updated!");
      } catch (e) {
        res.status(400).send("Error deleting transaction and updading user");
      }

      break;
    case "customer.subscription.resumed":
      break;
    case "customer.subscription.trial_will_end":
      break;
    case "customer.subscription.updated":
      // TODO: Is this when the subscription renews?
      // If so, add another transaction
      break;
    case "invoiceitem.created":
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};

const _add = async (
  email: string,
  subscriptionId: string,
  subscriptionStart: number,
  subscriptionEnd: number
) => {
  const start = new Date(subscriptionStart * 1000);
  const expiry = new Date(subscriptionEnd * 1000);

  const user = await User.findOne({
    email,
  });
  if (user) {
    const t = new Transaction({
      userId: user._id.toString(),
      date: start.toUTCString(),
      expiry: expiry.toUTCString(),
      dev: !isProduction,
      stripeSubscriptionId: subscriptionId,
    });

    t.save().then((res) => {
      console.log("res saving", res);
    });
  }
};

export const subscriptionActive = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const t = await Transaction.findOne({ userId: userId }); // NOTE: Could there be more than one or stripe will always have one per customer
    if (t) {
      const subscriptionId = t.stripeSubscriptionId;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const subscriptionEnd = subscription.current_period_end;
      const expiry = new Date(subscriptionEnd * 1000);
      res.status(200).send({ status: "success", expiry: expiry.toUTCString() });
    } else {
      res
        .status(400)
        .send({ status: "error", msg: "Couldn't get transaction" });
    }
  } catch (e) {
    res.status(500).send({ status: "error", msg: "Couldn't get subscription" });
  }
};
