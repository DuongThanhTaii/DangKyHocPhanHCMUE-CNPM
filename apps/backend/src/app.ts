import "dotenv/config";
import { PhaseSchedulerService } from "./services/PhaseSchedulerService";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import forgotRouter from "./modules/auth/forgotPassword.router";
import changePassRouter from "./modules/auth/changePassword.router";
import dmRouter from "./modules/dm/dm.router";
import paymentRoutes from "./presentation/http/routes/payment.routes";
import tuitionRoutes from "./presentation/http/routes/tuition.routes";

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

app.use("/api/auth", forgotRouter, changePassRouter);
app.use("/api/dm", dmRouter);
// ✅ Payment routes (Clean Architecture)
app.use("/api/payment", paymentRoutes);

// ✅ Tuition routes (Clean Architecture)
app.use("/api/tuition", tuitionRoutes);

// app.use("/api/auth", changePassRouter);

export default app;
