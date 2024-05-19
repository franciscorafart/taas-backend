import { TarotCard } from "shared/types";
import OpenAI from "openai";

const openai = setupOpenAI();

function setupOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    return new Error("OpenAI API key is not set");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export type TarotPayload = {
  question: string;
  cards: TarotCard[];
  model?: string;
};

export const generateGptTarotReading = async ({
  question,
  cards,
  model,
}: TarotPayload) => {
  const m = model || "gpt-3.5-turbo";
  try {
    // TODO: Check if requesting user has enough credits to make this request or first thre requests with Redis

    // check if openai is initialized correctly with the API key
    if (openai instanceof Error) {
      throw openai;
    }

    const completion = await openai.chat.completions.create({
      model: m,
      messages: [
        {
          role: "system",
          content:
            "you are an expert tarot reader. You will be given a list Three tarot cards, the first will represent the past, the second the present, and the third the possible future. You might also receive some text input from the person that want to read their cards. This could be a question,some context of their issue, or both. Your job is to return a detailed reading putting the cards in context of what the person asks. Please give a brief introduction to the what the general message is, then a specific explanation of the cards in the context of the question and the relationship between them, and finalizing with a recommendation of actions to take.",
        },
        {
          role: "user",
          content: `The cards are ${cards
            .map((c) => c.label)
            .join(", ")}. The question: ${question}`,
        },
      ],
      temperature: 1,
    });

    // const gptArgs = completion?.choices[0]?.message?.tool_calls?.[0]?.function.arguments;
    const responseContent = completion?.choices[0]?.message; // LLM Studio / chatGpt response

    if (!responseContent) {
      throw new Error("Bad response from OpenAI");
    }

    return responseContent.content || "";
  } catch (error: any) {
    console.error(error);
  }
};
