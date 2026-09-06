import { Router } from "express";
import { getProfile } from "../controllers/insider.controller";
import { validateRequest } from "../middleware/validateRequest";
import { getInsiderSchema } from "../validators/insider.validator";

const router = Router();

router.get(
  "/:id",
  validateRequest(getInsiderSchema),
  getProfile,
);

export default router;