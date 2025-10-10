import { BaseRepository } from "./baseRepository";
import type { de_xuat_hoc_phan, PrismaClient } from "@prisma/client";

export class DeXuatHocPhanRepository extends BaseRepository<de_xuat_hoc_phan> {
    constructor(prisma: PrismaClient) {
        super(prisma, "de_xuat_hoc_phan");
    }

    // Method mới - Lấy với relations
    async findAllWithRelations(where?: any): Promise<any[]> {
        return this.model.findMany({
            where,
            include: {
                mon_hoc: {
                    select: {
                        ma_mon: true,
                        ten_mon: true,
                        so_tin_chi: true,
                    },
                },
                giang_vien: {
                    select: {
                        users: {
                            select: {
                                ho_ten: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });
    }
}