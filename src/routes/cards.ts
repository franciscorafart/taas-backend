import { Router } from "express";
import { retrieveFileUrlS3 } from "../helpers/s3";

const router = Router();

// Send file links from s3 to front end
router.post("/list", async (req, res) => {
  const files = req.body.files; // TODO: Array of card files

  const response = [];

  try {
    for (const filename of files) {
      const url = await retrieveFileUrlS3(filename, 86400);

      response.push({
        url: url,
      });
    }
  } catch (e) {
    res.status(400).send(`There was an error on S3: ${e}`);
    return;
  }

  res.json({ cards: response });
});

export default router;
