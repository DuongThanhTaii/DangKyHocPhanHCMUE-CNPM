import { injectable, inject } from "inversify";
import { IBaoCaoRepository } from "../../ports/baoCaoThongKe/IBaoCaoRepository";
import { KhoaOutputDTO } from "../../dtos/baoCaoThongKe/BaoCaoOutput.dto";
import { BaoCaoTheoKhoa } from "../../../domain/entities/BaoCaoThongKe.entity";
import { BaoCaoAnalysisService } from "../../../domain/services/BaoCaoAnalysisService";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

@injectable()
export class GetDangKyTheoKhoaUseCase {
    private analysisService = new BaoCaoAnalysisService();

    constructor(
        @inject(IBaoCaoRepository) private baoCaoRepo: IBaoCaoRepository
    ) { }

    async execute(hocKyId: string): Promise<ServiceResult<KhoaOutputDTO>> {
        try {
            const statsData = await this.baoCaoRepo.getDangKyByKhoa(hocKyId);

            const entities = statsData.map((d) => BaoCaoTheoKhoa.create(d));
            const ketLuan = this.analysisService.generateKhoaConclusion(entities);

            const output: KhoaOutputDTO = {
                data: statsData.map((d) => ({
                    ten_khoa: d.tenKhoa,
                    so_dang_ky: d.soDangKy,
                })),
                ketLuan,
            };

            return ServiceResultBuilder.success("Lấy báo cáo theo khoa thành công", output);
        } catch (error: any) {
            console.error("[GetDangKyTheoKhoaUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi lấy báo cáo theo khoa",
                "GET_DANG_KY_KHOA_FAILED"
            );
        }
    }
}
