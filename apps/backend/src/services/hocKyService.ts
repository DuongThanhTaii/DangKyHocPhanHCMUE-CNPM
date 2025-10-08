import type { HocKyNienKhoaDTO } from "../dtos/pdtDTO";
import type { NienKhoaWithHocKyFromDB } from "../repositories/hocKyRepository";
import type { HocKyDTO } from "../dtos/pdtDTO";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";
import { UnitOfWork } from "../repositories/unitOfWork";
export class HocKyService {
    constructor(private unitOfWork: UnitOfWork) { }

    async GetHocKyNienKhoa(): Promise<HocKyNienKhoaDTO[]> {
        const nienKhoaList = await this.unitOfWork.hocKyRepository.findAllNienKhoaWithHocKy();

        return nienKhoaList.map((nienKhoa: NienKhoaWithHocKyFromDB) => ({
            id: nienKhoa.id,
            tenNienKhoa: nienKhoa.ten_nien_khoa,
            ngayBatDau: nienKhoa.ngay_bat_dau ?? null,
            ngayKetThuc: nienKhoa.ngay_ket_thuc ?? null,
            hocKy: nienKhoa.hoc_ky
                .map((hocKy) => ({
                    id: hocKy.id,
                    tenHocKy: hocKy.ten_hoc_ky,
                    ngayBatDau: hocKy.ngay_bat_dau ?? null,
                    ngayKetThuc: hocKy.ngay_ket_thuc ?? null,
                }))
                .sort((a, b) => {
                    const numA = parseInt(a.tenHocKy.match(/\d+/)?.[0] || "0");
                    const numB = parseInt(b.tenHocKy.match(/\d+/)?.[0] || "0");
                    return numA - numB;
                }),
        }));

    }
    async GetHocKyHienHanh(): Promise<ServiceResult<HocKyDTO | null>> {
        try {
            const hocKy = await this.unitOfWork.hocKyRepository.findHocKyHienHanh();

            if (!hocKy) {
                return ServiceResultBuilder.success(
                    "Không có học kỳ hiện hành",
                    null
                );
            }

            const data: HocKyDTO = {
                id: hocKy.id,
                tenHocKy: hocKy.ten_hoc_ky,
                ngayBatDau: hocKy.ngay_bat_dau ?? null,
                ngayKetThuc: hocKy.ngay_ket_thuc ?? null,
            };

            return ServiceResultBuilder.success(
                "Lấy thông tin học kỳ hiện hành thành công",
                data
            );
        } catch (error) {
            console.error("Error getting hoc ky hien hanh:", error);
            return ServiceResultBuilder.failure(
                "Lỗi hệ thống khi lấy học kỳ hiện hành",
                "INTERNAL_ERROR"
            );
        }
    }
}
