import { PrismaClient, dang_ky_tkb } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class DangKyTKBRepository extends BaseRepository<dang_ky_tkb> {
    constructor(prisma: PrismaClient) {
        super(prisma, "dang_ky_tkb");
    }

    /**
     * Tạo record đăng ký TKB
     */
    async createDangKyTKB(data: {
        dang_ky_id: string;
        sinh_vien_id: string;
        lop_hoc_phan_id: string;
    }) {
        return this.model.create({ data });
    }

    /**
     * Lấy danh sách lớp học phần đã đăng ký của sinh viên trong học kỳ (để check conflict)
     */
    async findRegisteredLopHocPhansByHocKy(sinh_vien_id: string, hoc_ky_id: string) {
        return this.model.findMany({
            where: {
                sinh_vien_id,
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
                            select: {
                                mon_hoc_id: true,
                                id_hoc_ky: true,
                            },
                        },
                    },
                },
            },
        });
    }
}
