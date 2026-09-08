import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";

import {
  getWatchlistController,
  addToWatchlistController,
  removeFromWatchlistController,
} from "../controllers/watchlist.controller";

import {
  getWatchlistSchema,
  addToWatchlistSchema,
  removeFromWatchlistSchema,
} from "../validators/watchlist.validator";

const router = Router();

router.get(
  "/",
  authMiddleware,
  validateRequest(getWatchlistSchema),
  getWatchlistController,
);

router.post(
  "/",
  authMiddleware,
  validateRequest(addToWatchlistSchema),
  addToWatchlistController,
);

router.delete(
  "/:companyId",
  authMiddleware,
  validateRequest(removeFromWatchlistSchema),
  removeFromWatchlistController,
);

export default router; 