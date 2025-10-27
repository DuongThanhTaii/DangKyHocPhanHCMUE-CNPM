import { PrismaClient, lich_su_dang_ky } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class LichSuDangKyRepository extends BaseRepository<lich_su_dang_ky> {
    constructor(prisma: PrismaClient) {
        super(prisma, "lich_su_dang_ky");
    }

    /**
     * Tìm hoặc tạo mới lịch sử đăng ký (upsert)
     */
    async findOrCreate(sinh_vien_id: string, hoc_ky_id: string) {
        return this.model.upsert({
            where: {
                sinh_vien_id_hoc_ky_id: {
                    sinh_vien_id,
                    hoc_ky_id,
                },
            },
            update: {},
            create: {
                sinh_vien_id,
                hoc_ky_id,
            },
        });
    }
}
