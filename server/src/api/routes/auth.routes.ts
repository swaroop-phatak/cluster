import { Router } from "express";
import { authRateLimiter } from "../middleware/authRateLimiter";
import {
  register,
  login,
  refresh,
  logout,
  me,
} from "../controllers/auth.controller";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { validateRequest } from "../middleware/validateRequest";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getNotificationPreferencesController,
  updateNotificationPreferencesController,
} from "../controllers/auth.controller";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validateRequest(registerSchema),
  register,
);

router.post(
  "/login",
  authRateLimiter,
  validateRequest(loginSchema),
  login,
);
router.post("/refresh", refresh);
router.post("/logout", authMiddleware, logout);

router.get("/me", authMiddleware, me);

router.get(
  "/me/notification-preferences",
  authMiddleware,
  getNotificationPreferencesController,
);

router.patch(
  "/me/notification-preferences",
  authMiddleware,
  updateNotificationPreferencesController,
);


export default router;