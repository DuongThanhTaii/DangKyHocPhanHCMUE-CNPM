import type { KyPhaseRepository } from "../repositories/kyPhaseRepository";
import type { CreateBulkKyPhaseRequest, KyPhaseResponseDTO } from "../dtos/kyPhaseDTO";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";
import { UnitOfWork } from "../repositories/unitOfWork";

export class KyPhaseService {
    constructor(
        private unitOfWork: UnitOfWork
    ) { }

    async CreateBulkKyPhase(
        request: CreateBulkKyPhaseRequest
    ): Promise<ServiceResult<KyPhaseResponseDTO[]>> {
        try {
            // Validate input
            if (!request.hocKyId || !request.phases || request.phases.length === 0) {
                return ServiceResultBuilder.failure(
                    "Thông tin học kỳ và danh sách phase không được để trống",
                    "INVALID_INPUT"
                );
            }

            // Validate từng phase
            for (const phaseItem of request.phases) {
                if (!phaseItem.phase || !phaseItem.startAt || !phaseItem.endAt) {
                    return ServiceResultBuilder.failure(
                        "Thông tin phase không đầy đủ",
                        "INVALID_PHASE_DATA"
                    );
                }

                const startAt = new Date(phaseItem.startAt);
                const endAt = new Date(phaseItem.endAt);

                if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
                    return ServiceResultBuilder.failure(
                        `Định dạng ngày không hợp lệ cho phase ${phaseItem.phase}`,
                        "INVALID_DATE_FORMAT"
                    );
                }

                if (startAt >= endAt) {
                    return ServiceResultBuilder.failure(
                        `Ngày bắt đầu phải trước ngày kết thúc cho phase ${phaseItem.phase}`,
                        "INVALID_DATE_RANGE"
                    );
                }
            }

            const result = await this.unitOfWork.transaction(async (tx) => {
                // Xóa tất cả phases cũ của học kỳ này
                await (tx as any).ky_phase.deleteMany({
                    where: {
                        hoc_ky_id: request.hocKyId,
                    },
                });

                // Prepare data for bulk insert
                const dataForDB = request.phases.map((phaseItem) => ({
                    hoc_ky_id: request.hocKyId,
                    phase: phaseItem.phase,
                    start_at: new Date(phaseItem.startAt),
                    end_at: new Date(phaseItem.endAt),
                    is_enabled: false,
                }));

                // Bulk insert
                await (tx as any).ky_phase.createMany({
                    data: dataForDB,
                });

                // Lấy lại data vừa tạo để trả về
                return await (tx as any).ky_phase.findMany({
                    where: {
                        hoc_ky_id: request.hocKyId,
                    },
                    orderBy: {
                        start_at: "asc",
                    },
                });
            });

            // Map DB model -> Response DTO
            const responseData: KyPhaseResponseDTO[] = result.map((item: any) => ({
                id: item.id,
                hocKyId: item.hoc_ky_id,
                phase: item.phase,
                startAt: item.start_at,
                endAt: item.end_at,
                isEnabled: item.is_enabled ?? false,
            }));

            return ServiceResultBuilder.success(
                `Tạo thành công ${responseData.length} phase cho học kỳ`,
                responseData
            );
        } catch (error) {
            console.error("Error creating bulk ky phase:", error);
            return ServiceResultBuilder.failure(
                "Lỗi hệ thống khi tạo phases",
                "INTERNAL_ERROR"
            );
        }
    }
}