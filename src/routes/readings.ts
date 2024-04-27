import { Router } from "express";
import { threeSpread } from "../useCases/gpt";

const router = Router();

router.post("/three-spread", threeSpread);

export default router;
