import { PrismaClient, nganh_hoc } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class NganhHocRepository extends BaseRepository<nganh_hoc> {
    constructor(prisma: PrismaClient) {
        super(prisma, "nganh_hoc");
    }

    /**
     * Lấy tất cả ngành học kèm thông tin khoa
     */
    async findAllWithKhoa() {
        return this.model.findMany({
            include: {
                khoa: {
                    select: {
                        ma_khoa: true,
                        ten_khoa: true,
                    },
                },
            },
            orderBy: {
                ma_nganh: "asc",
            },
        });
    }

    /**
     * Lấy ngành học theo khoa
     */
    async findByKhoaId(khoa_id: string) {
        return this.model.findMany({
            where: {
                khoa_id,
            },
            include: {
                khoa: {
                    select: {
                        ma_khoa: true,
                        ten_khoa: true,
                    },
                },
            },
            orderBy: {
                ma_nganh: "asc",
            },
        });
    }
}
