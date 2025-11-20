import { UnitOfWork } from "../repositories/unitOfWork";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";
import type { HocPhanForCreateLopHocPhanDTO } from "../dtos/taoLophocPhanDTO";
export class HocPhanService {
    private uow = UnitOfWork.getInstance();

    /**
     * Lấy danh sách học phần để TLK tạo lớp
     */
    async getHocPhansForCreateLop(
        hocKyId: string
    ): Promise<ServiceResult<HocPhanForCreateLopHocPhanDTO[]>> {
        try {
            const hocPhans = await this.uow.hocPhanRepository.findForCreateLop(hocKyId);

            const dtos: HocPhanForCreateLopHocPhanDTO[] = hocPhans.map((hp) => {
                // ✅ Lấy giảng viên từ de_xuat_hoc_phan
                const deXuat = hp.mon_hoc.de_xuat_hoc_phan?.[0];
                const tenGiangVien = deXuat?.giang_vien?.users?.ho_ten || "Chưa phân công";
                const giangVienId = deXuat?.giang_vien?.id


                return {
                    id: hp.id,
                    maHocPhan: hp.mon_hoc.ma_mon,
                    tenHocPhan: hp.mon_hoc.ten_mon,
                    soTinChi: hp.mon_hoc.so_tin_chi,
                    soSinhVienGhiDanh: hp._count.ghi_danh_hoc_phan,
                    tenGiangVien,
                    giangVienId,
                };
            });

            return ServiceResultBuilder.success(
                "Lấy danh sách học phần thành công",
                dtos
            );
        } catch (error) {
            console.error("Error getting hoc phans for create lop:", error);
            return ServiceResultBuilder.failure(
                "Lỗi khi lấy danh sách học phần",
                "INTERNAL_ERROR"
            );
        }
    }
}