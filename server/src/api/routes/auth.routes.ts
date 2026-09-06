import { Router } from "express";
import { authRateLimiter } from "../middleware/authRateLimiter";
import {
  register,
  login,
  refresh,
  logout,
} from "../controllers/auth.controller";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { validateRequest } from "../middleware/validateRequest";
import { authMiddleware } from "../middleware/authMiddleware";

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


export default router;