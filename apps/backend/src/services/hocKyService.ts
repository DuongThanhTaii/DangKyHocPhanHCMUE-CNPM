import type { HocKyNienKhoaDTO } from "../dtos/pdtDTO";
import type { NienKhoaWithHocKyFromDB } from "../repositories/hocKyRepository";
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
}
