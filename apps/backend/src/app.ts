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

// ✅ FIX: Tăng limit cho JSON body (để handle base64 images)
app.use(express.json({ limit: '50mb' })); // Tăng từ mặc định 100kb lên 50mb
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
