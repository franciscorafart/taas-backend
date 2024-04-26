import { Router } from "express";
import passport from "passport";
import checkRedisToken from "../middleware/checkRedisToken";
import {
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  signUp,
  user,
  validateToken,
} from "../useCases/auth";

const router = Router();
import PP from "../config/passport";
PP(passport);

/**
 * (POST Method)
 */

// //SignIn
router.post("/login", login);
router.post("/sign-up", signUp);

router.post("/request-password-reset", requestPasswordReset);

router.post("/validate-token", validateToken);

router.post("/reset-password", resetPassword);

router.get(
  "/user",
  passport.authenticate("jwt", { session: false }),
  checkRedisToken,
  user
);

router.get(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  checkRedisToken,
  logout
);

export default router;
