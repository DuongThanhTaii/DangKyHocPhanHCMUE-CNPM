import { injectable, inject } from "inversify";
import { IUnitOfWork } from "../../ports/pdtQuanLyHocKy/IUnitOfWork";
import { CreateBulkKyPhaseInputDTO } from "../../dtos/pdtQuanLyHocKy/CreateBulkKyPhase.dto";
import { PhaseTimeRange } from "../../../domain/value-objects/PhaseTimeRange.vo";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

@injectable()
export class CreateBulkKyPhaseUseCase {
    constructor(
        @inject(IUnitOfWork) private unitOfWork: IUnitOfWork
    ) { }

    async execute(input: CreateBulkKyPhaseInputDTO): Promise<ServiceResult<void>> {
        try {
            // Step 1: Validate học kỳ exists
            const hocKy = await this.unitOfWork.getHocKyRepository().findById(input.hocKyId);

            if (!hocKy) {
                return ServiceResultBuilder.failure("Không tìm thấy học kỳ", "HOC_KY_NOT_FOUND");
            }

            // Step 2: Validate time ranges không overlap
            const timeRanges = input.phases.map((p) =>
                PhaseTimeRange.create(new Date(p.startAt), new Date(p.endAt))
            );

            for (let i = 0; i < timeRanges.length; i++) {
                for (let j = i + 1; j < timeRanges.length; j++) {
                    if (timeRanges[i].overlaps(timeRanges[j])) {
                        return ServiceResultBuilder.failure(
                            `Phase "${input.phases[i].phase}" và "${input.phases[j].phase}" bị trùng thời gian`,
                            "PHASE_TIME_OVERLAP"
                        );
                    }
                }
            }

            // Step 3: Transaction - Delete old phases, create new
            await this.unitOfWork.transaction(async (repos) => {
                // Delete all existing phases for this học kỳ
                await repos.kyPhaseRepo.deleteByHocKyId(input.hocKyId);

                // Create new phases (Prisma will auto-generate UUID)
                await repos.kyPhaseRepo.createMany(
                    input.phases.map((p) => ({
                        hocKyId: input.hocKyId,
                        phase: p.phase,
                        startAt: new Date(p.startAt),
                        endAt: new Date(p.endAt),
                        isEnabled: p.isEnabled,
                    }))
                );
            });

            return ServiceResultBuilder.success("Tạo phases thành công");
        } catch (error: any) {
            console.error("[CreateBulkKyPhaseUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi tạo phases",
                "CREATE_BULK_KY_PHASE_FAILED"
            );
        }
    }
}
