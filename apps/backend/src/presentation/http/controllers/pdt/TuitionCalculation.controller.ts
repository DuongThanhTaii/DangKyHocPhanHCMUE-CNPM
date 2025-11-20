import { Request, Response } from "express";
import { container } from "../../../../infrastructure/di/container";
import { CalculateTuitionForSemesterUseCase } from "../../../../application/use-cases/tuition/CalculateTuitionForSemester.usecase";
import { SendTuitionCalculationNotificationUseCase } from "../../../../application/use-cases/external/SendTuitionCalculationNotification.usecase";
import { ServiceResultBuilder } from "../../../../types/serviceResult";

export class TuitionCalculationController {
    async calculateForSemester(req: Request, res: Response) {
        try {
            const { hoc_ky_id } = req.body;
            const triggeredBy = req.auth!.sub;

            if (!hoc_ky_id) {
                return res.status(400).json(ServiceResultBuilder.failure("Thiếu học kỳ ID"));
            }

            // Execute tuition calculation
            const calculateUseCase = container.get<CalculateTuitionForSemesterUseCase>(
                CalculateTuitionForSemesterUseCase
            );
            const result = await calculateUseCase.execute(hoc_ky_id, triggeredBy);

            if (result.isSuccess && result.data) {
                // Send notification (async, don't wait)
                const notificationUseCase = container.get<SendTuitionCalculationNotificationUseCase>(
                    SendTuitionCalculationNotificationUseCase
                );
                notificationUseCase.execute(result.data, triggeredBy).catch((error: any) => {
                    console.error("[CONTROLLER] Email notification failed:", error);
                });
            }

            return res.status(result.isSuccess ? 200 : 400).json(result);
        } catch (err: any) {
            return res.status(500).json(ServiceResultBuilder.failure(err.message));
        }
    }
}
