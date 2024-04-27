import { generateGptTarotReading } from "../gateway/gpt";
import { findByEmail } from "../gateway/user";
import { logError } from "../helpers/logger";
import { ResponseStatus } from "../shared/enums";

export const threeSpread = async (req, res) => {
  const { cards, question } = req.body;
  const email = req.user.email;

  try {
    if (!cards || !question) {
      res.status(400).send({
        status: ResponseStatus.BadRequest,
        success: false,
        msg: "Cards and question required",
      });
      return;
    }

    if (!email) {
      // Check redis for free readings (3)
      // Return error if no free readings
    }

    const existingUser = await findByEmail(email);

    // TODO: Check if user has enough credits to make this request

    const reading = await generateGptTarotReading({ question, cards });
    // TODO: Update user with less credits

    res.status(200).send({
      status: ResponseStatus.Ok,
      success: true,
      msg: "Tarot reading",
      data: reading,
    });
  } catch (err) {
    logError(err);
    res.status(500).send({
      status: ResponseStatus.Error,
      success: false,
      msg: "Error getting three spread",
    });
  }
};
