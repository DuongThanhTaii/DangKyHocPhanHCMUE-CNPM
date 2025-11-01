import "dotenv/config";
import { PhaseSchedulerService } from "./services/PhaseSchedulerService";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";

const app = express();

// ✅ Middleware setup
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "backend", time: new Date().toISOString() });
});

// ✅ Phase scheduler
const phaseSchedulerService = PhaseSchedulerService.getInstance();
phaseSchedulerService.start();

// ✅ Tất cả routes được mount từ routes.ts
app.use("/api", routes);

export default app;
