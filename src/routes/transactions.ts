import { Router, raw } from "express";
import * as passport from "passport";
import {
  createCheckoutSession,
  handleWebhookEvent,
  createPortalSession,
  subscriptionActive,
} from "../useCases/transactions";

const router = Router();

import checkRedisToken from "../middleware/checkRedisToken";
import PP from "../config/passport";
PP(passport);

/**
 * (POST Method)
 */

router.post(
  "/createCheckoutSession",
  passport.authenticate("jwt", { session: false }),
  checkRedisToken,
  createCheckoutSession
);

router.post(
  "/createPortalSession",
  passport.authenticate("jwt", { session: false }),
  checkRedisToken,
  createPortalSession
);

// TODO: Security? Maybe check request coming from stripe only
router.post("/webhook", raw({ type: "application/json" }), handleWebhookEvent);

router.get(
  "/subscriptionActive",
  passport.authenticate("jwt", { session: false }),
  checkRedisToken,
  subscriptionActive
);

export default router;
