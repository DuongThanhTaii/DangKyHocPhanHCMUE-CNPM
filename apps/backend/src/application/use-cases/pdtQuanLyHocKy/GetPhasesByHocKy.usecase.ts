import { injectable, inject } from "inversify";
import { IUnitOfWork } from "../../ports/pdtQuanLyHocKy/IUnitOfWork";
import { KyPhaseDTO } from "../../dtos/pdtQuanLyHocKy/GetPhases.dto";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

@injectable()
export class GetPhasesByHocKyUseCase {
    constructor(
        @inject(IUnitOfWork) private unitOfWork: IUnitOfWork
    ) { }

    async execute(hocKyId: string): Promise<ServiceResult<KyPhaseDTO[]>> {
        try {
            const phases = await this.unitOfWork.getKyPhaseRepository().findByHocKyId(hocKyId);

            const output: KyPhaseDTO[] = phases.map((p) => ({
                id: p.id,
                phase: p.phase,
                startAt: p.startAt,
                endAt: p.endAt,
                isEnabled: p.isEnabled,
            }));

            return ServiceResultBuilder.success("Lấy danh sách phases thành công", output);
        } catch (error: any) {
            console.error("[GetPhasesByHocKyUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi lấy danh sách phases",
                "GET_PHASES_FAILED"
            );
        }
    }
}
