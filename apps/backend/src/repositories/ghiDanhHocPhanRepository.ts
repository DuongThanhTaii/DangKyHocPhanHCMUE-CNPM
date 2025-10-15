import type { ghi_danh_hoc_phan, PrismaClient } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class GhiDanhHocPhanRepository extends BaseRepository<ghi_danh_hoc_phan> {
    constructor(prisma: PrismaClient) {
        super(prisma, "ghi_danh_hoc_phan");
    }

    // Kiểm tra sinh viên đã ghi danh học phần này chưa
    async isAlreadyRegistered(sinhVienId: string, hocPhanId: string): Promise<boolean> {
        const count = await this.model.count({
            where: {
                sinh_vien_id: sinhVienId,
                hoc_phan_id: hocPhanId,
            },
        });
        return count > 0;
    }

    // Lấy danh sách học phần đã ghi danh của sinh viên
    async findBySinhVienWithRelations(sinhVienId: string): Promise<any[]> {
        return this.model.findMany({
            where: {
                sinh_vien_id: sinhVienId,
            },
            include: {
                hoc_phan: {
                    include: {
                        mon_hoc: {
                            select: {
                                ma_mon: true,
                                ten_mon: true,
                                so_tin_chi: true,
                                khoa: {
                                    select: {
                                        ten_khoa: true,
                                    },
                                },
                                de_xuat_hoc_phan: {
                                    where: {
                                        trang_thai: "da_duyet_pdt",
                                    },
                                    select: {
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
                                    take: 1,
                                    orderBy: {
                                        created_at: "desc",
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                ngay_ghi_danh: "desc",
            },
        });
    }
}