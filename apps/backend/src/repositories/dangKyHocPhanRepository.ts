import { PrismaClient, dang_ky_hoc_phan } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class DangKyHocPhanRepository extends BaseRepository<dang_ky_hoc_phan> {
    constructor(prisma: PrismaClient) {
        super(prisma, "dang_ky_hoc_phan");
    }

    async isAlreadyRegistered(sinh_vien_id: string, hoc_phan_id: string): Promise<boolean> {
        const count = await this.model.count({
            where: {
                sinh_vien_id,
                lop_hoc_phan: {
                    hoc_phan_id,
                },
            },
        });
        return count > 0;
    }

    async findStudentsByLHP(lop_hoc_phan_id: string) {
        return this.model.findMany({
            where: {
                lop_hoc_phan_id,
                trang_thai: "da_dang_ky",
            },
            include: {
                sinh_vien: {
                    include: {
                        users: true,
                        khoa: true,
                        nganh_hoc: true,
                    },
                },
            },
        });
    }
}
