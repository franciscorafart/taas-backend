import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import authentication from "./routes/auth";
// import stripeRoute from "./routes/stripe";
import readings from "./routes/readings";

const isProduction = process.env.NODE_ENV === "production";

const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Secure Cors
const origin = {
  origin: isProduction
    ? ["https://taas-tarot.netlify.app"] // TODO: Update when domain purchased
    : "*",
};
app.use(cors(origin));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// routes
app.use("/auth", authentication);
app.use("/reading", readings);
// app.use("/stripe", stripeRoute);

export default app;
