import type { HocKyNienKhoaDTO, SetHocKyHienThanhRequest } from "../dtos/pdtDTO";
import type { NienKhoaWithHocKyFromDB } from "../repositories/hocKyRepository";
import type { HocKyDTO, HocKyHienHanhDTO } from "../dtos/pdtDTO";
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
    async GetHocKyHienHanh(): Promise<ServiceResult<HocKyHienHanhDTO | null>> {
        try {
            const hocKy = await this.unitOfWork.hocKyRepository.findHocKyHienHanh();

            if (!hocKy) {
                return ServiceResultBuilder.success(
                    "Không có học kỳ hiện hành",
                    null
                );
            }

            const data: HocKyHienHanhDTO = {
                id: hocKy.id,
                tenHocKy: hocKy.tenHocKy,
                nienKhoaId: hocKy.nienKhoaId,
                tenNienKhoa: hocKy.tenNienKhoa,
                ngayBatDau: hocKy.ngayBatDau,
                ngayKetThuc: hocKy.ngayKetThuc
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

    async SetHocKyHienHanh(request: SetHocKyHienThanhRequest): Promise<ServiceResult<HocKyDTO>> {
        try {
            if (!request.hocKyId) {
                return ServiceResultBuilder.failure(
                    "Học kỳ không được để trống",
                    "INVALID_INPUT"
                );
            }

            const existingHocKy = await this.unitOfWork.hocKyRepository.findById(request.hocKyId);
            if (!existingHocKy) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy học kỳ",
                    "HOC_KY_NOT_FOUND"
                );
            }

            const result = await this.unitOfWork.transaction(async (tx) => {
                await (tx as any).hoc_ky.updateMany({
                    where: {
                        trang_thai_hien_tai: true
                    },
                    data: {
                        trang_thai_hien_tai: false
                    }
                });

                return await (tx as any).hoc_ky.update({
                    where: {
                        id: request.hocKyId
                    },
                    data: {
                        trang_thai_hien_tai: true
                    }
                });
            });

            const data: HocKyDTO = {
                id: result.id,
                tenHocKy: result.ten_hoc_ky,
                ngayBatDau: result.ngay_bat_dau ?? null,
                ngayKetThuc: result.ngay_ket_thuc ?? null,
            };

            return ServiceResultBuilder.success(
                "Chuyển trạng thái học kỳ hiện hành thành công",
                data
            );
        } catch (error) {
            console.error("Error setting hoc ky hien hanh:", error);
            return ServiceResultBuilder.failure(
                "Lỗi hệ thống khi chuyển trạng thái học kỳ",
                "INTERNAL_ERROR"
            );
        }
    }

}
