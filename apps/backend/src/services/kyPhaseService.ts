import { UnitOfWork } from "../repositories/unitOfWork";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";
import {
    CreateBulkKyPhaseRequest,
    KyPhaseResponseDTO,
    PhasesByHocKyDTO,
    PhaseItemDetailDTO,
} from "../dtos/kyPhaseDTO";
import { KhoaDTO } from "../dtos/pdtDTO";

export class KyPhaseService {
    constructor(private unitOfWork: UnitOfWork) { }

    async CreateBulkKyPhase(
        request: CreateBulkKyPhaseRequest
    ): Promise<ServiceResult<KyPhaseResponseDTO[]>> {
        try {
            if (!request.hocKyId || !request.phases || request.phases.length === 0) {
                return ServiceResultBuilder.failure(
                    "Thông tin học kỳ và danh sách phase không được để trống",
                    "INVALID_INPUT"
                );
            }

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
                await (tx as any).ky_phase.deleteMany({
                    where: {
                        hoc_ky_id: request.hocKyId,
                    },
                });

                const dataForDB = request.phases.map((phaseItem) => ({
                    hoc_ky_id: request.hocKyId,
                    phase: phaseItem.phase,
                    start_at: new Date(phaseItem.startAt),
                    end_at: new Date(phaseItem.endAt),
                    is_enabled: false,
                }));

                await (tx as any).ky_phase.createMany({
                    data: dataForDB,
                });

                return await (tx as any).ky_phase.findMany({
                    where: {
                        hoc_ky_id: request.hocKyId,
                    },
                    orderBy: {
                        start_at: "asc",
                    },
                });
            });

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

    /**
     * Lấy danh sách phases theo học kỳ
     * @param hocKyId - ID của học kỳ
     */
    async getPhasesByHocKy(hocKyId: string): Promise<ServiceResult<PhasesByHocKyDTO>> {
        try {
            // Step 1: Kiểm tra học kỳ tồn tại
            const hocKy = await this.unitOfWork.hocKyRepository.findById(hocKyId);
            if (!hocKy) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy học kỳ",
                    "HOC_KY_NOT_FOUND"
                );
            }

            // Step 2: Lấy tất cả phases của học kỳ
            // ✅ Sửa orderBy: bat_dau -> start_at
            const kyPhases = await this.unitOfWork.kyPhaseRepository.findMany({
                where: { hoc_ky_id: hocKyId },
                orderBy: { start_at: "asc" }, // ✅ Đổi tên cột
            });

            // Step 3: Map sang DTO
            // ✅ Sửa tên các fields: bat_dau -> start_at, ket_thuc -> end_at, ten_phase -> phase, trang_thai -> is_enabled
            const phases: PhaseItemDetailDTO[] = kyPhases.map((phase: any) => ({
                id: phase.id,
                phase: phase.phase, // ✅ Đổi từ ten_phase
                startAt: new Date(phase.start_at).toISOString(), // ✅ Đổi từ bat_dau
                endAt: new Date(phase.end_at).toISOString(), // ✅ Đổi từ ket_thuc
                isEnabled: phase.is_enabled ?? false, // ✅ Đổi từ trang_thai
            }));

            const data: PhasesByHocKyDTO = {
                hocKyId: hocKy.id,
                tenHocKy: hocKy.ten_hoc_ky,
                phases,
            };

            return ServiceResultBuilder.success(
                "Lấy danh sách phases thành công",
                data
            );
        } catch (error) {
            console.error("Error getting phases by hoc ky:", error);
            return ServiceResultBuilder.failure(
                "Lỗi hệ thống khi lấy danh sách phases",
                "INTERNAL_ERROR"
            );
        }
    }

    async getDanhSachKhoa(): Promise<ServiceResult<KhoaDTO[]>> {
        try {
            const listKhoas = await this.unitOfWork.khoaRepository.findAll();

            const data: KhoaDTO[] = listKhoas.map((khoa: any) => ({
                id: khoa.id,
                tenKhoa: khoa.ten_khoa,
            }));
            return ServiceResultBuilder.success(
                "Lấy danh sách khoa thành công",
                data
            );
        } catch (error) {
            console.error("Error getting danh sach khoa:", error);

            return ServiceResultBuilder.failure(
                "Lỗi hệ thống khi lấy danh sách khoa",
                "INTERNAL_ERROR"
            );
        }
    }
}