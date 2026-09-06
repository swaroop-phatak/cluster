import { Router } from "express";
import {
  search,
  getDashboard,
} from "../controllers/company.controller";
import { validateRequest } from "../middleware/validateRequest";
import {
  searchCompaniesSchema,
  getCompanySchema,
} from "../validators/company.validator";

const router = Router();

router.get(
  "/",
  validateRequest(searchCompaniesSchema),
  search,
);

router.get(
  "/:id",
  validateRequest(getCompanySchema),
  getDashboard,
);

export default router;