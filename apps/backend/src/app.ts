import "dotenv/config";
import { PhaseSchedulerService } from "./services/PhaseSchedulerService";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import forgotRouter from "./modules/auth/forgotPassword.router";

const app = express();
app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// health
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "backend", time: new Date().toISOString() });
});

// API chính
app.use("/api", routes);
const phaseSchedulerService = PhaseSchedulerService.getInstance();
phaseSchedulerService.start();

app.use("/api/auth", forgotRouter);
export default app;
