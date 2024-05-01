import * as dotenv from "dotenv";
import mongoose from "mongoose";
import redisClient from "./redis-client";
import { logError } from "../helpers/logger";

dotenv.config();
const mongoUrl = process.env.MONGO;

const PersistenceLayer = async () => {
  try {
    redisClient.connect();

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
  } catch (error) {
    logError(`Connection error: ${error}`);
  }
};

export default PersistenceLayer;
