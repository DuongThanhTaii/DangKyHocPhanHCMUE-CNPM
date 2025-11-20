import { injectable, inject } from "inversify";
import { IBaoCaoRepository } from "../../ports/baoCaoThongKe/IBaoCaoRepository";
import { BaoCaoQueryDTO } from "../../dtos/baoCaoThongKe/BaoCaoQuery.dto";
import { OverviewOutputDTO } from "../../dtos/baoCaoThongKe/BaoCaoOutput.dto";
import { BaoCaoOverview } from "../../../domain/entities/BaoCaoThongKe.entity";
import { BaoCaoAnalysisService } from "../../../domain/services/BaoCaoAnalysisService";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

@injectable()
export class GetOverviewUseCase {
    private analysisService = new BaoCaoAnalysisService();

    constructor(
        @inject(IBaoCaoRepository) private baoCaoRepo: IBaoCaoRepository
    ) { }

    async execute(query: BaoCaoQueryDTO): Promise<ServiceResult<OverviewOutputDTO>> {
        try {
            const stats = await this.baoCaoRepo.getOverviewStats(
                query.hoc_ky_id,
                query.khoa_id,
                query.nganh_id
            );

            const overview = BaoCaoOverview.create(stats);
            const ketLuan = this.analysisService.generateOverviewConclusion(overview);

            const output: OverviewOutputDTO = {
                svUnique: overview.svUnique,
                soDangKy: overview.soDangKy,
                soLopHocPhan: overview.soLopHocPhan,
                taiChinh: {
                    thuc_thu: overview.thucThu,
                    ky_vong: overview.kyVong,
                },
                ketLuan,
            };

            return ServiceResultBuilder.success("Lấy báo cáo tổng quan thành công", output);
        } catch (error: any) {
            console.error("[GetOverviewUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi lấy báo cáo tổng quan",
                "GET_OVERVIEW_FAILED"
            );
        }
    }
}
