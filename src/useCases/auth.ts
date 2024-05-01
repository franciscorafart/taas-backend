// TODO: Make into helper functions
import redisClient from "../config/redis-client";
import * as jwt from "jsonwebtoken";

import {
  genEncryptedPassword,
  findByEmail,
  comparePassword,
  updateUser,
  createUser,
} from "../gateway/user";
import * as crypto from "crypto";
import { sendResetEmail } from "../helpers/email";
import { userToResponseUser } from "../utils/dataMappers";
import { ResponseStatus } from "../shared/enums";
import { logError } from "../helpers/logger";

const secret = process.env.SECRET;

export const login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await findByEmail(email);

    if (!user) {
      res.status(400).send({
        status: ResponseStatus.BadRequest,
        success: false,
        msg: "User not found.",
      });
    } else if (!user.confirmed) {
      res.status(400).send({
        status: ResponseStatus.BadRequest,
        success: false,
        msg: "Confirm user by setting password before login",
      });
    } else {
      // check if password matches
      const isMatch = await comparePassword(password, user.password);
      if (isMatch) {
        // if user is found and password is right create a token
        const userForToken = { email: user.email, id: user.id };
        let token = jwt.sign(JSON.stringify(userForToken), secret);
        // Save token in Redis with 30 days expiry
        const redisRes = await redisClient.set(token, "true");
        redisClient.expire(token, 60 * 60 * 24 * 30); // 30 days
        if (redisRes === "OK") {
          // return the information including token as JSON
          res.status(200).send({
            status: ResponseStatus.Ok,
            success: true,
            token: "JWT " + token,
            email: user.email,
            id: user.id,
            credits: user.credits,
          });
        } else {
          res.status(500).send({
            status: ResponseStatus.Error,
            success: false,
            msg: "Token not saved.",
          });
        }
      } else {
        res.status(400).send({
          status: ResponseStatus.BadRequest,
          success: false,
          msg: "Wrong password.",
        });
      }
    }
  } catch (err) {
    res.status(500).send({
      status: ResponseStatus.Error,
      success: false,
      msg: err,
    });
  }
};

export const signUp = async (req, res) => {
  const email = req.body.email;
  try {
    if (!email) {
      res.status(400).send({
        status: ResponseStatus.BadRequest,
        success: false,
        msg: "Email required",
      });
      return;
    }

    const existingUser = await findByEmail(email);

    if (existingUser) {
      res.status(401).send({
        status: ResponseStatus.BadRequest,
        success: false,
        msg: "User exists with that email.",
      });
      return;
    }

    // User won't be able to login until they reset their password
    const encryptedPass = await genEncryptedPassword("temporary-password");

    await createUser({
      email,
      // firstName: first,
      // lastName: last,
      confirmed: false,
      encryptedPassword: encryptedPass,
    });

    // Send reset password+ email
    const recoveryToken = crypto.randomBytes(20).toString("hex");

    const redisRes = await redisClient.set(recoveryToken, email);
    redisClient.expire(recoveryToken, 60 * 60); // 1hr

    if (redisRes === "OK") {
      if (process.env.NODE_ENV !== "test") {
        await sendResetEmail(email, recoveryToken);
      }
    } else {
      throw new Error("Token not saved");
    }

    res.status(200).send({
      status: ResponseStatus.Ok,
      success: true,
      msg: "User created",
      email: email,
    });
  } catch (err) {
    logError(err);
    res.status(500).send({
      status: ResponseStatus.Error,
      success: false,
      msg: "Error creating user",
    });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await findByEmail(email);

    if (!user) {
      res.status(401).send({
        status: ResponseStatus.BadRequest,
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
            status: ResponseStatus.Ok,
            success: true,
            msg: "Reset password request successful. Check your email.",
            email: email,
          });
        } else {
          res.status(500).send({
            status: ResponseStatus.Error,
            success: false,
            msg: "Reset password email sending failed. Try again later.",
          });
        }
      } else {
        res.status(500).send({
          status: ResponseStatus.Error,
          success: false,
          msg: "Reset password request failed. Try again later.",
        });
      }
    }
  } catch (err) {
    res.status(500).send({
      status: ResponseStatus.Error,
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
        status: ResponseStatus.Ok,
        success: true,
        msg: "Link valid",
        email: redisEmail,
      });
    } else {
      res.status(400).send(
        JSON.stringify({
          status: ResponseStatus.BadRequest,
          success: false,
          msg: "Link expired or invalid",
          email: redisEmail,
        })
      );
    }
  } catch (e) {
    res.status(500).send(
      JSON.stringify({
        status: ResponseStatus.Error,
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
      const user = await findByEmail(redisEmail);

      if (!user) {
        res.status(401).send({
          status: ResponseStatus.BadRequest,
          success: false,
          msg: "No user found for link",
        });
      } else {
        const newEncryptedPassword = await genEncryptedPassword(newPassword);
        updateUser(user, {
          encryptedPassword: newEncryptedPassword,
          confirmed: true,
        });

        await redisClient.del(recoveryToken);
        res.status(200).send({
          status: ResponseStatus.Ok,
          success: true,
          msg: "Password reset",
          email: redisEmail,
        });
      }
    } else {
      res.status(400).send(
        JSON.stringify({
          status: ResponseStatus.BadRequest,
          success: false,
          msg: "Recovery link expired or invalid",
        })
      );
    }
  } catch (e) {
    res.status(500).send(
      JSON.stringify({
        status: ResponseStatus.Error,
        success: false,
        msg: "Error validating",
      })
    );
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    await redisClient.del(token);
    res.json({
      status: ResponseStatus.Ok,
      success: true,
      msg: "Sign out successfully",
    });
  } catch (err) {
    if (err) {
      res.status(500).send({
        status: ResponseStatus.Error,
        success: false,
        msg: "Error login out",
      });
    }
  }
};

export const user = async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const u = req.user;
      res.status(200).send(
        JSON.stringify({
          status: ResponseStatus.Ok,
          success: true,
          data: userToResponseUser(u),
        })
      );
    } else {
      res.status(403).send(
        JSON.stringify({
          status: ResponseStatus.Unauthorized,
          success: false,
          msg: "Not logged",
        })
      );
    }
  } catch (e) {
    res
      .status(500)
      .send(
        JSON.stringify({ status: ResponseStatus.Error, success: false, msg: e })
      );
  }
};
