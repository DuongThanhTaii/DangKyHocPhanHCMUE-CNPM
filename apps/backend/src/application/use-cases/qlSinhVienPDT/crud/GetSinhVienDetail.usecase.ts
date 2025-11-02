import { injectable, inject } from "inversify";
import { IUnitOfWork } from "../../../ports/qlSinhVienPDT/IUnitOfWork";
import { SinhVienDetailDTO } from "../../../dtos/qlSinhVienPDT/crud/SinhVienDetail.dto";
import { ServiceResult, ServiceResultBuilder } from "../../../../types/serviceResult";

@injectable()
export class GetSinhVienDetailUseCase {
    constructor(
        @inject(IUnitOfWork) private unitOfWork: IUnitOfWork
    ) { }

    async execute(id: string): Promise<ServiceResult<SinhVienDetailDTO>> {
        try {
            const sinhVien = await this.unitOfWork.getSinhVienRepository().findById(id);

            if (!sinhVien) {
                return ServiceResultBuilder.failure("Không tìm thấy sinh viên", "SINH_VIEN_NOT_FOUND");
            }

            // Repository should populate relations (khoa, nganh, users)
            // For now, return basic structure
            const detail: SinhVienDetailDTO = {
                id: sinhVien.id,
                maSoSinhVien: sinhVien.maSoSinhVien,
                hoTen: sinhVien.hoTen,
                email: `${sinhVien.maSoSinhVien}@student.hcmue.edu.vn`,
                khoa: {
                    id: sinhVien.khoaId,
                    maKhoa: "",
                    tenKhoa: "",
                },
                nganh: sinhVien.nganhId ? {
                    id: sinhVien.nganhId,
                    maNganh: "",
                    tenNganh: "",
                } : undefined,
                lop: sinhVien.lop || undefined,
                khoaHoc: sinhVien.khoaHoc || undefined,
                ngayNhapHoc: sinhVien.ngayNhapHoc || undefined,
                trangThaiHoatDong: true,
            };

            return ServiceResultBuilder.success("Lấy thông tin sinh viên thành công", detail);
        } catch (error: any) {
            console.error("[GetSinhVienDetailUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi lấy thông tin sinh viên",
                "GET_DETAIL_FAILED"
            );
        }
    }
}
