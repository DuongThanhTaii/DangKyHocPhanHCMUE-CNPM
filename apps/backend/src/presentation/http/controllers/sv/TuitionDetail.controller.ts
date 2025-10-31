import { Request, Response } from "express";
import { container } from "../../../../infrastructure/di/container";
import { GetTuitionDetailsUseCase } from "../../../../application/use-cases/tuition/GetTuitionDetails.usecase";
import { ServiceResultBuilder } from "../../../../types/serviceResult";

export class TuitionDetailController {
    async getTuitionDetails(req: Request, res: Response) {
        try {
            const sinhVienId = req.auth!.sub;
            const { hoc_ky_id } = req.query;

            if (!hoc_ky_id) {
                return res.status(400).json(ServiceResultBuilder.failure("Thiếu học kỳ ID"));
            }

            const useCase = container.get<GetTuitionDetailsUseCase>(GetTuitionDetailsUseCase);
            const result = await useCase.execute(sinhVienId, hoc_ky_id as string);

            return res.status(result.isSuccess ? 200 : 400).json(result);
        } catch (err: any) {
            return res.status(500).json(ServiceResultBuilder.failure(err.message));
        }
    }
}
