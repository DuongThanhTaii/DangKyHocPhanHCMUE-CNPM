import { injectable, inject } from "inversify";
import { TYPES } from "../../../infrastructure/di/types";
import { IKyPhaseRepository } from "../../ports/pdtQuanLyPhase/repositories/IKyPhaseRepository";
import { IHocKyRepository } from "../../ports/pdtQuanLyPhase/repositories/IHocKyRepository";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

interface GetCurrentActivePhaseOutputDTO {
    phaseId: string;
    phase: string;
    hocKyId: string;
    tenHocKy: string;
    startAt: Date;
    endAt: Date;
    isEnabled: boolean;
}

@injectable()
export class GetCurrentActivePhaseUseCase {
    constructor(
        @inject(TYPES.PdtQuanLyPhase.IKyPhaseRepository) private kyPhaseRepo: IKyPhaseRepository,
        @inject(TYPES.PdtQuanLyPhase.IHocKyRepository) private hocKyRepo: IHocKyRepository
    ) { }

    async execute(): Promise<ServiceResult<GetCurrentActivePhaseOutputDTO | null>> {
        try {
            // Step 1: Lấy học kỳ hiện hành
            const hocKyHienHanh = await this.hocKyRepo.findHocKyHienHanh();
            if (!hocKyHienHanh) {
                return ServiceResultBuilder.failure(
                    "Không có học kỳ hiện hành",
                    "NO_HOC_KY_HIEN_HANH"
                );
            }

            // Step 2: Lấy tất cả phases của học kỳ hiện hành
            const phases = await this.kyPhaseRepo.findByHocKyId(hocKyHienHanh.id);

            // Step 3: Tìm phase đang enabled
            const activePhase = phases.find((p) => p.isEnabled);

            if (!activePhase) {
                return ServiceResultBuilder.success("Không có phase nào đang hoạt động", null);
            }

            // Step 4: Return result
            const output: GetCurrentActivePhaseOutputDTO = {
                phaseId: activePhase.id,
                phase: activePhase.phase,
                hocKyId: activePhase.hocKyId,
                tenHocKy: hocKyHienHanh.ten_hoc_ky,
                startAt: activePhase.startAt,
                endAt: activePhase.endAt,
                isEnabled: activePhase.isEnabled,
            };

            return ServiceResultBuilder.success("OK", output);
        } catch (error: any) {
            console.error("[GetCurrentActivePhaseUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi lấy phase hiện tại",
                "GET_CURRENT_PHASE_FAILED"
            );
        }
    }
}
