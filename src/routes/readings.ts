import { Router } from "express";
import { threeSpread } from "../useCases/gpt";
import checkRedisToken from "../middleware/checkRedisToken";

const router = Router();

router.post("/three-spread", checkRedisToken, threeSpread);

export default router;
