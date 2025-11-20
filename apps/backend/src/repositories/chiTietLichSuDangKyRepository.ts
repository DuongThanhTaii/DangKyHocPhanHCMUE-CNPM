import { PrismaClient, chi_tiet_lich_su_dang_ky } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class ChiTietLichSuDangKyRepository extends BaseRepository<chi_tiet_lich_su_dang_ky> {
    constructor(prisma: PrismaClient) {
        super(prisma, "chi_tiet_lich_su_dang_ky");
    }

    /**
     * Tạo chi tiết lịch sử đăng ký
     */
    async createDetail(data: {
        lich_su_dang_ky_id: string;
        dang_ky_hoc_phan_id: string;
        hanh_dong: string;
    }) {
        return this.model.create({ data });
    }
}
