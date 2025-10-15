import type { dot_dang_ky, PrismaClient } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class DotDangKyRepository extends BaseRepository<dot_dang_ky> {
    constructor(prisma: PrismaClient) {
        super(prisma, "dot_dang_ky");
    }

    /**
     * Xóa tất cả đợt đăng ký của học kỳ theo loại đợt
     */
    async deleteByHocKyAndLoaiDot(hocKyId: string, loaiDot: string): Promise<void> {
        await this.model.deleteMany({
            where: {
                hoc_ky_id: hocKyId,
                loai_dot: loaiDot,
            },
        });
    }

    /**
     * Lấy đợt đăng ký với thông tin khoa
     */
    async findByHocKyWithKhoa(hocKyId: string, loaiDot: string): Promise<any[]> {
        return this.model.findMany({
            where: {
                hoc_ky_id: hocKyId,
                loai_dot: loaiDot,
            },
            include: {
                khoa: {
                    select: {
                        ten_khoa: true,
                    },
                },
            },
            orderBy: {
                thoi_gian_bat_dau: "asc",
            },
        });
    }

    /**
     * Tìm đợt đăng ký toàn trường
     */
    async findToanTruongByHocKy(hocKyId: string, loaiDot: string): Promise<dot_dang_ky | null> {
        return this.model.findFirst({
            where: {
                hoc_ky_id: hocKyId,
                loai_dot: loaiDot,
                is_check_toan_truong: true,
                khoa_id: null,
            },
        });
    }

    /**
     * Xóa đợt theo khoa (không phải toàn trường)
     */
    async deleteTheoKhoaByHocKy(hocKyId: string, loaiDot: string): Promise<void> {
        await this.model.deleteMany({
            where: {
                hoc_ky_id: hocKyId,
                loai_dot: loaiDot,
                is_check_toan_truong: false,
            },
        });
    }

    /**
     * Xóa đợt toàn trường
     */
    async deleteToanTruongByHocKy(hocKyId: string, loaiDot: string): Promise<void> {
        await this.model.deleteMany({
            where: {
                hoc_ky_id: hocKyId,
                loai_dot: loaiDot,
                is_check_toan_truong: true,
            },
        });
    }

    /**
     * Xóa các đợt theo khoa không có trong danh sách ids
     */
    async deleteTheoKhoaNotInIds(hocKyId: string, loaiDot: string, ids: string[]): Promise<void> {
        await this.model.deleteMany({
            where: {
                hoc_ky_id: hocKyId,
                loai_dot: loaiDot,
                is_check_toan_truong: false,
                id: { notIn: ids.length > 0 ? ids : ["dummy-id"] },
            },
        });
    }

    /**
     * Tạo đợt đăng ký toàn trường
     */
    async createToanTruong(data: {
        hoc_ky_id: string;
        loai_dot: string;
        thoi_gian_bat_dau: Date;
        thoi_gian_ket_thuc: Date;
    }): Promise<dot_dang_ky> {
        return this.model.create({
            data: {
                ...data,
                is_check_toan_truong: true,
                khoa_id: null,
                gioi_han_tin_chi: 50,
            },
        });
    }

    /**
     * Tạo đợt đăng ký theo khoa
     */
    async createTheoKhoa(data: {
        hoc_ky_id: string;
        loai_dot: string;
        thoi_gian_bat_dau: Date;
        thoi_gian_ket_thuc: Date;
        khoa_id: string;
    }): Promise<dot_dang_ky> {
        return this.model.create({
            data: {
                ...data,
                is_check_toan_truong: false,
                gioi_han_tin_chi: 50,
            },
        });
    }

    /**
     * Update thời gian đợt đăng ký
     */
    async updateThoiGian(id: string, data: {
        thoi_gian_bat_dau: Date;
        thoi_gian_ket_thuc: Date;
        khoa_id?: string;
    }): Promise<dot_dang_ky> {
        return this.model.update({
            where: { id },
            data,
        });
    }
}