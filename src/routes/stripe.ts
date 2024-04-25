import { Router } from "express";
import { getStripeIntent } from "../helpers/stripe";

const router = Router();

router.post("/get_intent", (req, res) => {
  const payload = req.body;
  const { amount, currency, paymentMethodId, customerEmail } = payload;

  getStripeIntent(amount, currency, paymentMethodId, customerEmail)
    .then((data) => {
      const state = { clientSecret: data.client_secret };
      const response = JSON.stringify(state);

      res.send(response);
    })
    .catch((e) => res.json(JSON.stringify({ stripe_error: e })));
});

export default router;
