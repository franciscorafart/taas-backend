import * as dotenv from "dotenv";
dotenv.config();
import * as http from "http";

import app from "./app";
import { logError } from "./helpers/logger";

const port = process.env.PORT || 8000;

const initialize = async () => {
  try {
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
