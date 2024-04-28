import { Router } from "express";
import passport from "passport";
import checkRedisToken from "../middleware/checkRedisToken";
import { threeSpread } from "../useCases/gpt";

const router = Router();
import PP from "../config/passport";
PP(passport);

router.post(
  "/three-spread",
  passport.authenticate("jwt", { session: false }),
  checkRedisToken,
  threeSpread
);

export default router;
