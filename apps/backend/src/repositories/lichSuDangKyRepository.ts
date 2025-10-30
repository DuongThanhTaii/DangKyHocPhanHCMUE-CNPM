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

    /**
     * Lấy lịch sử đăng ký theo sinh viên và học kỳ
     */
    async findBySinhVienAndHocKy(sinh_vien_id: string, hoc_ky_id: string) {
        return this.model.findUnique({
            where: {
                sinh_vien_id_hoc_ky_id: {
                    sinh_vien_id,
                    hoc_ky_id,
                },
            },
            include: {
                hoc_ky: {
                    select: {
                        ten_hoc_ky: true,
                        ma_hoc_ky: true,
                    },
                },
                chi_tiet_lich_su_dang_ky: {
                    include: {
                        dang_ky_hoc_phan: {
                            include: {
                                lop_hoc_phan: {
                                    include: {
                                        hoc_phan: {
                                            include: {
                                                mon_hoc: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        thoi_gian: "desc",
                    },
                },
            },
        });
    }

    /**
     * Lấy tất cả lịch sử đăng ký của sinh viên
     */
    async findAllBySinhVien(sinh_vien_id: string) {
        return this.model.findMany({
            where: {
                sinh_vien_id,
            },
            include: {
                hoc_ky: {
                    select: {
                        ten_hoc_ky: true,
                        ma_hoc_ky: true,
                        ngay_bat_dau: true,
                        ngay_ket_thuc: true,
                    },
                },
                chi_tiet_lich_su_dang_ky: {
                    include: {
                        dang_ky_hoc_phan: {
                            include: {
                                lop_hoc_phan: {
                                    include: {
                                        hoc_phan: {
                                            include: {
                                                mon_hoc: true,
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
                        },
                    },
                    orderBy: {
                        thoi_gian: "desc",
                    },
                },
            },
            orderBy: {
                ngay_tao: "desc",
            },
        });
    }
}
