import { generateGptTarotReading } from "../gateway/gpt";
import { findByEmail } from "../gateway/user";
import { logError } from "../helpers/logger";
import { ResponseStatus } from "../shared/enums";
import redisClient from "../config/redis-client";

export const threeSpreadFree = async (req, res) => {
  const { cards, question } = req.body;
  const { ip } = req;
  let currentReading = 0;

  try {
    if (!cards || !question) {
      res.status(400).send({
        status: ResponseStatus.BadRequest,
        success: false,
        msg: "Cards and question required",
      });
      return;
    }

    const redisResponse = await redisClient.get(ip);

    if (redisResponse === null || redisResponse === undefined) {
      await redisClient.set(ip, 3);
      currentReading = 3;
    } else {
      currentReading = Number(redisResponse);

      if (Number(redisResponse) <= 0) {
        res.status(401).send({
          status: ResponseStatus.Unauthorized,
          success: false,
          msg: "You have already used your free readings",
        });
        return;
      }
    }

    // const reading = "";
    const reading = await generateGptTarotReading({ question, cards });
    redisClient.set(ip, currentReading - 1);

    res.status(200).send({
      status: ResponseStatus.Ok,
      success: true,
      msg: "Tarot reading",
      data: reading,
    });
  } catch (err) {
    logError(`threeSpread error: ${err}`);
    res.status(500).send({
      status: ResponseStatus.Error,
      success: false,
      msg: "Error getting three spread",
    });
  }
};

export const threeSpread = async (req, res) => {
  const { cards, question } = req.body;
  const { email } = req.user;

  try {
    if (!cards || !question) {
      res.status(400).send({
        status: ResponseStatus.BadRequest,
        success: false,
        msg: "Cards and question required",
      });
      return;
    }

    const existingUser = await findByEmail(email);
    let credits = existingUser.credits;

    // User needs enough credits
    if (credits <= 0) {
      res.status(401).send({
        status: ResponseStatus.Unauthorized,
        success: false,
        msg: "Not enough credits for your reading!",
      });
      return;
    }

    const reading = await generateGptTarotReading({ question, cards });

    // TODO: Decouple: Use gateway function to update user
    existingUser.credits = credits - 1;
    await existingUser.save();

    res.status(200).send({
      status: ResponseStatus.Ok,
      success: true,
      msg: "Tarot reading",
      data: reading,
    });
  } catch (err) {
    logError(`threeSpread error: ${err}`);
    res.status(500).send({
      status: ResponseStatus.Error,
      success: false,
      msg: "Error getting three spread",
    });
  }
};
