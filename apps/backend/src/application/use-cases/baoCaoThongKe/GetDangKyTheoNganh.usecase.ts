import { injectable, inject } from "inversify";
import { IBaoCaoRepository } from "../../ports/baoCaoThongKe/IBaoCaoRepository";
import { NganhOutputDTO } from "../../dtos/baoCaoThongKe/BaoCaoOutput.dto";
import { BaoCaoTheoNganh } from "../../../domain/entities/BaoCaoThongKe.entity";
import { BaoCaoAnalysisService } from "../../../domain/services/BaoCaoAnalysisService";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

@injectable()
export class GetDangKyTheoNganhUseCase {
    private analysisService = new BaoCaoAnalysisService();

    constructor(
        @inject(IBaoCaoRepository) private baoCaoRepo: IBaoCaoRepository
    ) { }

    async execute(hocKyId: string, khoaId?: string): Promise<ServiceResult<NganhOutputDTO>> {
        try {
            const statsData = await this.baoCaoRepo.getDangKyByNganh(hocKyId, khoaId);

            const entities = statsData.map((d) => BaoCaoTheoNganh.create(d));
            const ketLuan = this.analysisService.generateNganhConclusion(entities);

            const output: NganhOutputDTO = {
                data: statsData.map((d) => ({
                    ten_nganh: d.tenNganh,
                    so_dang_ky: d.soDangKy,
                })),
                ketLuan,
            };

            return ServiceResultBuilder.success("Lấy báo cáo theo ngành thành công", output);
        } catch (error: any) {
            console.error("[GetDangKyTheoNganhUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi lấy báo cáo theo ngành",
                "GET_DANG_KY_NGANH_FAILED"
            );
        }
    }
}
