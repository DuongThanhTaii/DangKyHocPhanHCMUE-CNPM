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

    /**
     * Check sinh viên đã đăng ký lớp học phần chưa
     */
    async isStudentRegistered(sinh_vien_id: string, lop_hoc_phan_id: string): Promise<boolean> {
        const count = await this.model.count({
            where: {
                sinh_vien_id,
                lop_hoc_phan_id,
            },
        });
        return count > 0;
    }

    /**
     * Lấy danh sách lop_hoc_phan_id mà sinh viên đã đăng ký
     */
    async findRegisteredLopHocPhanIds(sinhVienId: string, hocKyId: string): Promise<string[]> {
        const records = await this.model.findMany({
            where: {
                sinh_vien_id: sinhVienId,
                lop_hoc_phan: {
                    hoc_phan: {
                        id_hoc_ky: hocKyId,
                    },
                },
                trang_thai: "da_dang_ky",
            },
            select: {
                lop_hoc_phan_id: true,
            },
        });

        return records.map((r: any) => r.lop_hoc_phan_id);
    }

    /**
     * Lấy danh sách đăng ký của sinh viên theo học kỳ
     */
    async findBySinhVienAndHocKy(sinhVienId: string, hocKyId: string) {
        return this.model.findMany({
            where: {
                sinh_vien_id: sinhVienId,
                lop_hoc_phan: { hoc_phan: { id_hoc_ky: hocKyId } },
                trang_thai: "da_dang_ky",
            },
            include: {
                lop_hoc_phan: {
                    include: {
                        hoc_phan: { include: { mon_hoc: true } },
                        giang_vien: { select: { users: { select: { ho_ten: true } } } },
                    },
                },
            },
        });
    }

    /**
     * Check sinh viên đã đăng ký môn này (dù khác lớp) trong cùng học kỳ chưa
     */
    async hasRegisteredMonHocInHocKy(
        sinh_vien_id: string,
        mon_hoc_id: string,
        hoc_ky_id: string
    ): Promise<boolean> {
        const count = await this.model.count({
            where: {
                sinh_vien_id,
                trang_thai: "da_dang_ky",
                lop_hoc_phan: {
                    hoc_phan: {
                        mon_hoc_id,
                        id_hoc_ky: hoc_ky_id,
                    },
                },
            },
        });
        return count > 0;
    }

    /**
     * Tìm record đăng ký theo sinh viên và lớp học phần
     */
    async findBySinhVienAndLopHocPhan(sinh_vien_id: string, lop_hoc_phan_id: string) {
        return this.model.findUnique({
            where: {
                sinh_vien_id_lop_hoc_phan_id: {
                    sinh_vien_id,
                    lop_hoc_phan_id,
                },
            },
            include: {
                lop_hoc_phan: {
                    include: {
                        hoc_phan: true,
                    },
                },
            },
        });
    }

    /**
     * Lấy danh sách lớp đã đăng ký của sinh viên theo học kỳ (full include)
     */
    async findRegisteredWithFullInclude(sinh_vien_id: string, hoc_ky_id: string) {
        return this.model.findMany({
            where: {
                sinh_vien_id,
                trang_thai: "da_dang_ky",
                lop_hoc_phan: {
                    hoc_phan: {
                        id_hoc_ky: hoc_ky_id,
                    },
                },
            },
            include: {
                lop_hoc_phan: {
                    include: {
                        hoc_phan: {
                            include: {
                                mon_hoc: true,
                            },
                        },
                        lich_hoc_dinh_ky: {
                            include: {
                                phong: true,
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
                },
            },
        });
    }
}
