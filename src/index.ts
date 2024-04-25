import * as dotenv from "dotenv";
dotenv.config();
import * as http from "http";
import mongoose from "mongoose";
import redisClient from "./config/redis-client";
import app from "./app";
import { logError } from "./helpers/logger";

const port = process.env.PORT || 8000;
const mongoUrl = process.env.MONGO || "mongodb://localhost/kurku";

const initialize = async () => {
  try {
    await redisClient.connect();

    redisClient.on("error", (error) => console.error(`Ups : ${error}`));
    redisClient.on("connect", async () => {
      console.log("Connected to our redis instance!");
    });

    mongoose.connect(mongoUrl, {});

    mongoose.connection.on("error", (err) => {
      console.log("err", err);
    });

    mongoose.connection.on("connected", (err, res) => {
      console.log("mongoose is connected");
    });

    const httpServer = http.createServer(app);

    httpServer.listen(port, () => {
      console.log(`Http running on port ${port}. DB connected`);
    });
  } catch (error) {
    logError(`Connection error: ${error}`);
  }
};

if (process.env.NODE_ENV !== "test") {
  // NOTE: No DB init on test environment.
  // Supertest initializes it for HTTP endpoint integration tests
  // and the code initializes it for entities functions
  initialize();
}

export default app;
