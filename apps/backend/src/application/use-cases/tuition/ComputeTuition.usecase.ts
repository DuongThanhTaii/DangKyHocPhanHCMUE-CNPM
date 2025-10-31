import { injectable, inject } from "inversify";
import { IHocPhiService } from "../../ports/tuition/IHocPhiService";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

@injectable()
export class ComputeTuitionUseCase {
    constructor(
        @inject(IHocPhiService) private hocPhiService: IHocPhiService
    ) { }

    async execute(sinhVienId: string, hocKyId: string): Promise<ServiceResult<number>> {
        try {
            const tongHocPhi = await this.hocPhiService.computeTuition(sinhVienId, hocKyId);

            return ServiceResultBuilder.success("Tính học phí thành công", tongHocPhi);
        } catch (error: any) {
            console.error("[COMPUTE_TUITION] Error:", error);
            return ServiceResultBuilder.failure(error.message || "Lỗi khi tính học phí");
        }
    }
}
