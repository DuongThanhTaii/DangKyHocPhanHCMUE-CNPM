import type { hoc_phan, PrismaClient } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class HocPhanRepository extends BaseRepository<hoc_phan> {
    constructor(prisma: PrismaClient) {
        super(prisma, "hoc_phan");
    }

    // Method mới - Lấy học phần với relations
    async findAllWithRelations(where?: any): Promise<any[]> {
        return this.model.findMany({
            where,
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
                        // Navigate từ mon_hoc -> de_xuat_hoc_phan
                        de_xuat_hoc_phan: {
                            where: {
                                trang_thai: "da_duyet_pdt", // Chỉ lấy đề xuất đã duyệt PDT
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
            orderBy: {
                created_at: "desc",
            },
        });
    }

    /**
  * Lấy danh sách học phần để tạo lớp (kèm số SV ghi danh)
  */
    async findForCreateLop(hocKyId: string): Promise<any[]> {
        return this.model.findMany({
            where: {
                id_hoc_ky: hocKyId,
            },
            include: {
                mon_hoc: {
                    select: {
                        ma_mon: true,
                        ten_mon: true,
                        so_tin_chi: true,
                        // Navigate: mon_hoc -> de_xuat_hoc_phan -> giang_vien -> users
                        de_xuat_hoc_phan: {
                            where: {
                                trang_thai: "da_duyet_pdt", // Chỉ lấy đề xuất đã duyệt
                            },
                            select: {
                                giang_vien: {
                                    select: {
                                        users: {
                                            select: {
                                                ho_ten: true, // ✅ ho_ten nằm ở users, không phải giang_vien
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
                _count: {
                    select: {
                        ghi_danh_hoc_phan: {
                            where: {
                                trang_thai: {
                                    in: ["da_ghi_danh", "da_duyet"],
                                },
                            },
                        },
                    },
                },
            },
        });
    }
}