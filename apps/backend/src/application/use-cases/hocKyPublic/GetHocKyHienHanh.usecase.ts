import { injectable, inject } from "inversify";
import { IUnitOfWork } from "../../ports/hocKyPublic/IUnitOfWork";
import { HocKyHienHanhOutputDTO } from "../../dtos/hocKyPublic/HocKyHienHanhOutput.dto";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

@injectable()
export class GetHocKyHienHanhUseCase {
    constructor(
        @inject(IUnitOfWork) private unitOfWork: IUnitOfWork
    ) { }

    async execute(): Promise<ServiceResult<HocKyHienHanhOutputDTO | null>> {
        try {
            const hocKy = await this.unitOfWork.getHocKyRepository().findHienHanh();

            if (!hocKy) {
                return ServiceResultBuilder.success("Không có học kỳ hiện hành", null);
            }

            const nienKhoa = await this.unitOfWork.getNienKhoaRepository().findById(hocKy.nienKhoaId);

            const output: HocKyHienHanhOutputDTO = {
                id: hocKy.id,
                tenHocKy: hocKy.tenHocKy,
                maHocKy: hocKy.maHocKy,
                nienKhoa: {
                    id: nienKhoa?.id || hocKy.nienKhoaId,
                    tenNienKhoa: nienKhoa?.tenNienKhoa || "",
                },
                // ✅ FIX: Return null if not exist
                ngayBatDau: hocKy.ngayBatDau ?? null,
                ngayKetThuc: hocKy.ngayKetThuc ?? null,
            };

            return ServiceResultBuilder.success("Lấy học kỳ hiện hành thành công", output);
        } catch (error: any) {
            console.error("[GetHocKyHienHanhUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi lấy học kỳ hiện hành",
                "GET_HOC_KY_HIEN_HANH_FAILED"
            );
        }
    }
}

// ✅ GIỮ NGUYÊN - Single object, không phải array
