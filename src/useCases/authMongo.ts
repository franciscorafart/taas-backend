// TODO: Make into helper functions
import redisClient from "../config/redis-client";
import * as jwt from "jsonwebtoken";
import User from "../schema/User";
import * as crypto from "crypto";
import { sendConfirmationEmail, sendResetEmail } from "../helpers/email";
import { createUser } from "gateway/user";

const secret = process.env.SECRET;

export const signup = async (req, res) => {
  const { email, firstName, lastName, password } = req.body;
  try {
    if (!email || !password) {
      res
        .status(400)
        .send({ success: false, msg: "Please pass email and password." });
      return;
    } else {
      const newUser = createUser({
        email,
        firstName,
        lastName,
      });

      const confirmationToken = crypto.randomBytes(20).toString("hex");
      const redisRes = await redisClient.set(confirmationToken, req.body.email);
      redisClient.expire(confirmationToken, 60 * 60 * 24); // 1d

      if (redisRes === "OK") {
        const succesMail = await sendConfirmationEmail(
          req.body.email,
          confirmationToken
        );

        if (succesMail) {
          res.status(200).send({
            success: true,
            msg: "Successful created new user. Confirm your email",
            email: req.body.email,
          });
        } else {
          res.status(400).send({
            success: false,
            msg: "Successful created new user. Email confirmation failed, request it again later",
            email: req.body.email,
          });
        }
      }
    }
  } catch (e) {
    res.status(500).send({
      success: false,
      msg: e,
      email: req.body.email,
    });
  }
};

export const login = async (req, res) => {
  const email = req.body.email;
  const user = await User.findOne({
    email,
  });

  if (!user) {
    res.status(401).send({
      success: false,
      msg: "User not found.",
    });
  } else if (!user.confirmed) {
    res.status(401).send({
      success: false,
      msg: "Confirm email before login",
    });
  } else {
    // check if password matches
    try {
      user.comparePassword(req.body.password, async function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          const userForToken = {
            email: user.email,
            id: user._id,
            checkoutId: user.stripeCheckoutSessionId,
          };
          let token = jwt.sign(JSON.stringify(userForToken), secret);

          // Save token in Redis with 30 days expiry
          const redisRes = await redisClient.set(token, "true");
          redisClient.expire(token, 60 * 60 * 24 * 30); // 30 days
          if (redisRes === "OK") {
            // return the information including token as JSON
            res.json({
              success: true,
              token: "JWT " + token,
              email: user.email,
              id: user._id,
              checkoutId: user.stripeCheckoutSessionId,
            });
          } else {
            res.status(401).send({
              success: false,
              msg: "Token not saved.",
            });
          }
        } else {
          res.status(401).send({
            success: false,
            msg: "Wrong password.",
          });
        }
      });
    } catch (err) {
      console.log("error", err);
      res.status(500).send({
        success: false,
        msg: err,
      });
    }
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const email = req.body.email;
    // Find in database
    const user = await User.findOne({
      email,
    });

    if (!user) {
      res.status(401).send({
        success: false,
        msg: "No user found for email",
      });
    } else {
      const recoveryToken = crypto.randomBytes(20).toString("hex");

      const redisRes = await redisClient.set(recoveryToken, email);
      redisClient.expire(recoveryToken, 60 * 60); // 1hr

      if (redisRes === "OK") {
        const emailSuccess = await sendResetEmail(email, recoveryToken);
        if (emailSuccess) {
          res.status(200).send({
            success: true,
            msg: "Reset password request successful. Check your email.",
            email: email,
          });
        } else {
          res.status(401).send({
            success: false,
            msg: "Reset password request failed. Try again later.",
          });
        }
      } else {
        res.status(401).send({
          success: false,
          msg: "Reset password request failed. Try again later.",
        });
      }
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      msg: "Reset password request failed. Try again later.",
    });
  }
};

export const validateToken = async (req, res) => {
  try {
    const recoveryToken = req.body.recoveryToken;
    const redisEmail = await redisClient.get(recoveryToken);
    if (redisEmail) {
      res.status(200).send({
        success: true,
        msg: "Link valid",
        email: redisEmail,
      });
    } else {
      res.status(400).send(
        JSON.stringify({
          success: false,
          msg: "Link expired or invalid",
          email: redisEmail,
        })
      );
    }
  } catch (e) {
    res.status(500).send(
      JSON.stringify({
        success: false,
        msg: "Error validating token",
      })
    );
  }
};

export const resetPassword = async (req, res) => {
  try {
    const recoveryToken = req.body.recoveryToken;
    const newPassword = req.body.password;
    const redisEmail = await redisClient.get(recoveryToken);

    if (redisEmail) {
      const user = await User.findOne({
        email: redisEmail,
      });
      if (!user) {
        res.status(401).send({
          success: false,
          msg: "No user found for link",
        });
      } else {
        user.password = newPassword;
        user.save();
        await redisClient.del(recoveryToken);
        res.status(200).send({
          success: true,
          msg: "Password reset",
          email: redisEmail,
        });
      }
    } else {
      res.status(400).send(
        JSON.stringify({
          success: false,
          msg: "Recovery link expired or invalid",
        })
      );
    }
  } catch (e) {
    res.status(500).send(
      JSON.stringify({
        success: false,
        msg: "Error validating",
      })
    );
  }
};

export const resendConfirmation = async (req, res) => {
  try {
    const email = req.body.email;
    const confirmationToken = crypto.randomBytes(20).toString("hex");
    const redisRes = await redisClient.set(confirmationToken, email);
    redisClient.expire(confirmationToken, 60 * 60 * 24); // 1d

    if (redisRes === "OK") {
      const emailSuccess = await sendConfirmationEmail(
        email,
        confirmationToken
      );
      if (emailSuccess) {
        res.status(200).send({
          success: true,
          msg: "Re-sent user confirmation email",
          email: email,
        });
      } else {
        res.status(400).send(
          JSON.stringify({
            success: false,
            msg: "Confirm request email failed",
          })
        );
      }
    } else {
      res.status(400).send({
        success: false,
        msg: "Confirm request failed",
        email: email,
      });
    }
  } catch (e) {
    res.status(500).send(
      JSON.stringify({
        success: false,
        msg: "Confirm request failed",
      })
    );
  }
};

export const confirmUser = async (req, res) => {
  try {
    const confirmationToken = req.body.confirmationToken;
    const redisEmail = await redisClient.get(confirmationToken);
    if (redisEmail) {
      const user = await User.findOne({
        email: redisEmail,
      });
      if (!user) {
        res.status(401).send({
          success: false,
          msg: "No user found for token",
        });
      } else {
        user.confirmed = true;
        user.save();
        await redisClient.del(confirmationToken);
        res.status(200).send({
          success: true,
          msg: "User confirmed succesfully",
          email: redisEmail,
        });
      }
    } else {
      res.status(400).send(
        JSON.stringify({
          success: false,
          msg: "Recovery link expired or invalid",
          email: redisEmail,
        })
      );
    }
  } catch (e) {
    res.status(500).send(
      JSON.stringify({
        success: false,
        msg: "Error validating token",
      })
    );
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    await redisClient.del(token);
    res.json({ success: true, msg: "Sign out successfully" });
  } catch (err) {
    if (err) {
      res.status(500).send({ success: false, msg: "Error login out" });
    }
  }
};

export const user = async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      res.status(200).send(
        JSON.stringify({
          success: true,
          email: req.user.email,
          id: req.user._id,
          checkoutId: req.user.stripeCheckoutSessionId || "",
        })
      );
    } else {
      res.status(400).send(
        JSON.stringify({
          success: false,
          msg: "Not logged",
        })
      );
    }
  } catch (e) {
    res.status(500).send(JSON.stringify({ success: false, msg: e }));
  }
};
