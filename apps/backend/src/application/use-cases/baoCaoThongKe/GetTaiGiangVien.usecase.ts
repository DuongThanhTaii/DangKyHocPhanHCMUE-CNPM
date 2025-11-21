import { injectable, inject } from "inversify";
import { IBaoCaoRepository } from "../../ports/baoCaoThongKe/IBaoCaoRepository";
import { GiangVienOutputDTO } from "../../dtos/baoCaoThongKe/BaoCaoOutput.dto";
import { BaoCaoTaiGiangVien } from "../../../domain/entities/BaoCaoThongKe.entity";
import { BaoCaoAnalysisService } from "../../../domain/services/BaoCaoAnalysisService";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

@injectable()
export class GetTaiGiangVienUseCase {
    private analysisService = new BaoCaoAnalysisService();

    constructor(
        @inject(IBaoCaoRepository) private baoCaoRepo: IBaoCaoRepository
    ) { }

    async execute(hocKyId: string, khoaId?: string): Promise<ServiceResult<GiangVienOutputDTO>> {
        try {
            const statsData = await this.baoCaoRepo.getTaiGiangVien(hocKyId, khoaId);

            const entities = statsData.map((d) => BaoCaoTaiGiangVien.create(d));
            const ketLuan = this.analysisService.generateTaiGiangVienConclusion(entities);

            const output: GiangVienOutputDTO = {
                data: statsData.map((d) => ({
                    ho_ten: d.hoTen,
                    so_lop: d.soLop,
                })),
                ketLuan,
            };

            return ServiceResultBuilder.success("Lấy báo cáo tải giảng viên thành công", output);
        } catch (error: any) {
            console.error("[GetTaiGiangVienUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi lấy báo cáo tải giảng viên",
                "GET_TAI_GIANG_VIEN_FAILED"
            );
        }
    }
}
