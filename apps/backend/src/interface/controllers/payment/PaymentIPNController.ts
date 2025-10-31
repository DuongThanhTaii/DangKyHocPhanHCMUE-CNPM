import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { ProcessIPNUseCase } from "../../../application/use-cases/payment/ProcessIPN.usecase";

@injectable()
export class PaymentIPNController {
    constructor(
        @inject(ProcessIPNUseCase) private processIPNUseCase: ProcessIPNUseCase
    ) { }

    async handleIPN(req: Request, res: Response): Promise<void> {
        try {
            console.log("=== IPN RECEIVED ===");
            console.log("Headers:", JSON.stringify(req.headers, null, 2));
            console.log("Body:", JSON.stringify(req.body, null, 2));
            console.log("Query:", JSON.stringify(req.query, null, 2));

            // MoMo có thể gửi qua body hoặc query
            const ipnData = { ...req.body, ...req.query };

            const result = await this.processIPNUseCase.execute(ipnData);

            if (result.isSuccess) {
                console.log("✅ IPN processed successfully");
                // ⚠️ MoMo yêu cầu trả về 204 No Content hoặc 200 OK
                res.status(204).send();
            } else {
                console.error("❌ IPN processing failed:", result.message);
                // Vẫn trả về 204 để MoMo không retry
                res.status(204).send();
            }
        } catch (error) {
            console.error("❌ IPN handler error:", error);
            // Trả về 204 để tránh MoMo retry liên tục
            res.status(204).send();
        }
    }
}
