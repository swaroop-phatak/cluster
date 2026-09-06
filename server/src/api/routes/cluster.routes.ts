import { Router } from "express";
import {
  getFeed,
  getDetail,
} from "../controllers/cluster.controller";
import { validateRequest } from "../middleware/validateRequest";
import {
  getClusterFeedSchema,
  getClusterDetailSchema,
} from "../validators/cluster.validator";

const router = Router();

router.get(
  "/",
  validateRequest(getClusterFeedSchema),
  getFeed,
);

router.get(
  "/:id",
  validateRequest(getClusterDetailSchema),
  getDetail,
);

export default router;