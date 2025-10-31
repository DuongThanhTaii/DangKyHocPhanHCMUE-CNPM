import { Router } from "express";
import { container } from "../../infrastructure/di/container";
import { PaymentIPNController } from "../controllers/payment/PaymentIPNController";

const router = Router();
const ipnController = container.get(PaymentIPNController);

// Route nhận IPN từ MoMo - KHÔNG cần authentication
router.post("/ipn", (req, res) => ipnController.handleIPN(req, res));

export default router;
