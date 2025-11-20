import { injectable, inject } from "inversify";
import { GetOverviewUseCase } from "./GetOverview.usecase";
import { GetDangKyTheoKhoaUseCase } from "./GetDangKyTheoKhoa.usecase";
import { GetDangKyTheoNganhUseCase } from "./GetDangKyTheoNganh.usecase";
import { GetTaiGiangVienUseCase } from "./GetTaiGiangVien.usecase";
import { IExportStrategy, ExportData } from "../../ports/baoCaoThongKe/services/IExportStrategy";
import { BaoCaoQueryDTO } from "../../dtos/baoCaoThongKe/BaoCaoQuery.dto";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

@injectable()
export class ExportBaoCaoUseCase {
    constructor(
        @inject(GetOverviewUseCase) private overviewUseCase: GetOverviewUseCase,
        @inject(GetDangKyTheoKhoaUseCase) private khoaUseCase: GetDangKyTheoKhoaUseCase,
        @inject(GetDangKyTheoNganhUseCase) private nganhUseCase: GetDangKyTheoNganhUseCase,
        @inject(GetTaiGiangVienUseCase) private giangVienUseCase: GetTaiGiangVienUseCase
    ) { }

    async execute(
        strategy: IExportStrategy,
        query: BaoCaoQueryDTO,
        charts?: any[]
    ): Promise<ServiceResult<Buffer>> {
        try {
            // Fetch all reports data
            const [overview, theoKhoa, theoNganh, taiGiangVien] = await Promise.all([
                this.overviewUseCase.execute(query),
                this.khoaUseCase.execute(query.hoc_ky_id),
                this.nganhUseCase.execute(query.hoc_ky_id, query.khoa_id),
                this.giangVienUseCase.execute(query.hoc_ky_id, query.khoa_id),
            ]);

            // Check if any failed
            if (!overview.isSuccess || !theoKhoa.isSuccess || !theoNganh.isSuccess || !taiGiangVien.isSuccess) {
                return ServiceResultBuilder.failure("Lỗi khi lấy dữ liệu báo cáo", "FETCH_DATA_FAILED");
            }

            const exportData: ExportData = {
                overview: overview.data,
                theoKhoa: theoKhoa.data,
                theoNganh: theoNganh.data,
                taiGiangVien: taiGiangVien.data,
            };

            // ✅ FIX: Pass metadata separately, not spreading query
            const buffer = await strategy.export(exportData, {
                hocKyId: query.hoc_ky_id,
                khoaId: query.khoa_id,
                nganhId: query.nganh_id,
                charts
            });

            return ServiceResultBuilder.success("Export báo cáo thành công", buffer);
        } catch (error: any) {
            console.error("[ExportBaoCaoUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi export báo cáo",
                "EXPORT_FAILED"
            );
        }
    }
}
