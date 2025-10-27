import { BaseRepository } from "./baseRepository";
import { PrismaClient, ghi_danh_hoc_phan } from "@prisma/client";

export class GhiDanhHocPhanRepository extends BaseRepository<ghi_danh_hoc_phan> {
    constructor(prisma: PrismaClient) {
        super(prisma, "ghi_danh_hoc_phan");
    }

    /**
     * Đếm số sinh viên đã ghi danh theo học phần
     */
    async getSoSinhVienGhiDanhByHocPhan(hocPhanId: string): Promise<number> {
        return this.model.count({
            where: {
                hoc_phan_id: hocPhanId,
                trang_thai: {
                    in: ["da_ghi_danh", "da_duyet"],
                },
            },
        });
    }

    /**
     * Kiểm tra sinh viên đã ghi danh học phần này chưa
     */
    async isAlreadyRegistered(
        sinhVienId: string,
        hocPhanId: string
    ): Promise<boolean> {
        const count = await this.model.count({
            where: {
                sinh_vien_id: sinhVienId,
                hoc_phan_id: hocPhanId,
                trang_thai: {
                    in: ["da_ghi_danh", "da_duyet"],
                },
            },
        });
        return count > 0;
    }

    /**
     * Lấy danh sách ghi danh của sinh viên kèm relations
     */
    async findBySinhVienWithRelations(sinhVienId: string) {
        return this.model.findMany({
            where: {
                sinh_vien_id: sinhVienId,
                trang_thai: {
                    in: ["da_ghi_danh", "da_duyet"],
                },
            },
            include: {
                hoc_phan: {
                    include: {
                        mon_hoc: {
                            include: {
                                khoa: {
                                    select: {
                                        ten_khoa: true,
                                    },
                                },
                                de_xuat_hoc_phan: {
                                    where: {
                                        trang_thai: "da_duyet_pdt",
                                    },
                                    include: {
                                        giang_vien: {
                                            include: {
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

    /**
     * Lấy nhiều bản ghi ghi danh theo IDs
     */
    async findByIds(ids: string[]): Promise<ghi_danh_hoc_phan[]> {
        return this.model.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });
    }

    /**
     * Xóa nhiều bản ghi ghi danh
     */
    async deleteMany(ids: string[]): Promise<void> {
        await this.model.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });
    }

    /**
     * Lấy danh sách sinh viên đã ghi danh học phần (kèm thông tin sinh viên)
     */
    async getSinhVienGhiDanhByHocPhan(hocPhanId: string) {
        return this.model.findMany({
            where: {
                hoc_phan_id: hocPhanId,
                trang_thai: {
                    in: ["da_ghi_danh", "da_duyet"],
                },
            },
            include: {
                sinh_vien: {
                    include: {
                        users: {
                            select: {
                                ho_ten: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                ngay_ghi_danh: "asc",
            },
        });
    }

    /**
     * Check sinh viên đã ghi danh học phần chưa
     */
    async isStudentRegistered(sinh_vien_id: string, hoc_phan_id: string): Promise<boolean> {
        const count = await this.model.count({
            where: {
                sinh_vien_id,
                hoc_phan_id,
                trang_thai: "da_ghi_danh",
            },
        });
        return count > 0;
    }
}