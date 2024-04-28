import { generateGptTarotReading } from "../gateway/gpt";
import { findByEmail } from "../gateway/user";
import { logError } from "../helpers/logger";
import { ResponseStatus } from "../shared/enums";

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
