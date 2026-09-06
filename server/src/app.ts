import express from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";

import authRoutes from "./api/routes/auth.routes";
import { errorHandler } from "./api/middleware/errorHandler";
import companyRoutes from "./api/routes/company.routes";
import insiderRoutes from "./api/routes/insider.routes";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.use(pinoHttp());

app.use(express.json());

app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/insiders", insiderRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

export default app;