import { injectable, inject } from "inversify";
import { IUnitOfWork } from "../../ports/hocKyPublic/IUnitOfWork";
import { HocKyHienHanhOutputDTO } from "../../dtos/hocKyPublic/HocKyHienHanhOutput.dto";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

@injectable()
export class GetHocKyHienHanhUseCase {
    constructor(
        @inject(IUnitOfWork) private unitOfWork: IUnitOfWork
    ) { }

    async execute(): Promise<ServiceResult<HocKyHienHanhOutputDTO>> {
        try {
            const hocKy = await this.unitOfWork.getHocKyRepository().findHienHanh();

            if (!hocKy) {
                return ServiceResultBuilder.failure(
                    "Không có học kỳ hiện hành",
                    "HOC_KY_HIEN_HANH_NOT_FOUND"
                );
            }

            const nienKhoa = await this.unitOfWork.getNienKhoaRepository().findById(hocKy.nienKhoaId);

            if (!nienKhoa) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy niên khóa",
                    "NIEN_KHOA_NOT_FOUND"
                );
            }

            const output: HocKyHienHanhOutputDTO = {
                id: hocKy.id,
                tenHocKy: hocKy.tenHocKy,
                maHocKy: hocKy.maHocKy,
                nienKhoa: {
                    id: nienKhoa.id,
                    tenNienKhoa: nienKhoa.tenNienKhoa,
                },
                ngayBatDau: hocKy.ngayBatDau || undefined,
                ngayKetThuc: hocKy.ngayKetThuc || undefined,
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
