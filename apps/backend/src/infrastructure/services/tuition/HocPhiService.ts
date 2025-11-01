import { injectable, inject } from "inversify";
import { PrismaClient } from "@prisma/client";
import { IHocPhiService } from "../../../application/ports/tuition/IHocPhiService";
import { ITuitionRepository } from "../../../application/ports/tuition/ITuitionRepository";
@injectable()
export class HocPhiService implements IHocPhiService {
    constructor(
        @inject(PrismaClient) private prisma: PrismaClient,
        @inject(ITuitionRepository) private tuitionRepo: ITuitionRepository
    ) { }

    async updatePaymentStatus(sinhVienId: string, hocKyId: string): Promise<void> {
        await this.tuitionRepo.updatePaymentStatus(sinhVienId, hocKyId);
    }

    async computeTuition(sinhVienId: string, hocKyId: string): Promise<number> {
        // 1. Lấy chi tiết học phí (object DTO)
        const chiTietHocPhi = await this.tuitionRepo.getChiTietHocPhi(sinhVienId, hocKyId);

        // 2. Tính tổng học phí từ chiTiet (array)
        if (!chiTietHocPhi) {
            throw new Error("Không tìm thấy chi tiết học phí");
        }

        const tongHocPhi = chiTietHocPhi.chiTiet.reduce((sum: number, item: any) => sum + item.thanhTien, 0);

        // 3. Kiểm tra xem đã có record chưa
        const hocPhi = await this.tuitionRepo.findBySinhVienAndHocKy(sinhVienId, hocKyId);

        if (hocPhi) {
            // Update
            await this.tuitionRepo.updateTongHocPhi(sinhVienId, hocKyId, tongHocPhi);
        } else {
            // Create new
            await this.prisma.hoc_phi.create({
                data: {
                    sinh_vien_id: sinhVienId,
                    hoc_ky_id: hocKyId,
                    tong_hoc_phi: tongHocPhi,
                    trang_thai_thanh_toan: "chua_thanh_toan",
                },
            });
        }

        return tongHocPhi;
    }
}
