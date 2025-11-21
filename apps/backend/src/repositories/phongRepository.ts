import { PrismaClient, phong } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class PhongRepository extends BaseRepository<phong> {
    constructor(prisma: PrismaClient) {
        super(prisma, "phong");
    }

    /**
     * Lấy tất cả phòng học có sẵn (chưa được gán khoa)
     */
    async getAllAvailableRooms() {
        return this.model.findMany({
            where: {
                khoa_id: null,
            },
            include: {
                co_so: {
                    select: {
                        ten_co_so: true,
                    },
                },
            },
            orderBy: {
                suc_chua: "asc",
            },
        });
    }

    /**
     * Lấy tất cả phòng học kèm thông tin cơ sở
     */
    async getAllWithCoSo() {
        return this.model.findMany({
            include: {
                co_so: {
                    select: {
                        ten_co_so: true,
                    },
                },
            },
            orderBy: [
                { co_so_id: "asc" },
                { ma_phong: "asc" },
            ],
        });
    }

    /**
     * Lấy phòng học theo cơ sở
     */
    async findByCoSo(coSoId: string) {
        return this.model.findMany({
            where: {
                co_so_id: coSoId,
            },
            include: {
                co_so: {
                    select: {
                        ten_co_so: true,
                    },
                },
            },
            orderBy: {
                ma_phong: "asc",
            },
        });
    }

    /**
     * Lấy phòng học theo khoa ID
     */
    async findByKhoaId(khoaId: string) {
        return this.model.findMany({
            where: {
                khoa_id: khoaId,
            },
            include: {
                co_so: {
                    select: {
                        ten_co_so: true,
                    },
                },
            },
            orderBy: [
                { co_so_id: "asc" },
                { ma_phong: "asc" },
            ],
        });
    }

    /**
     * Gán phòng học cho khoa (chỉ cập nhật khoa_id)
     */
    async assignRoomsToKhoa(phongHocIds: string[], khoaId: string) {
        return this.model.updateMany({
            where: {
                id: { in: phongHocIds },
            },
            data: {
                khoa_id: khoaId,
            },
        });
    }

    /**
     * Xóa gán phòng học khỏi khoa (set khoa_id = null)
     */
    async unassignRoomsFromKhoa(phongHocIds: string[]) {
        return this.model.updateMany({
            where: {
                id: { in: phongHocIds },
            },
            data: {
                khoa_id: null,
            },
        });
    }

    /**
     * Đánh dấu phòng học đã được sử dụng
     */
    async markRoomsAsUsed(phongHocIds: string[]) {
        return this.model.updateMany({
            where: {
                id: { in: phongHocIds },
            },
            data: {
                da_dc_su_dung: true,
            },
        });
    }

    /**
     * Lấy tên phòng theo danh sách IDs
     */
    async getTenPhongByIds(phongHocIds: string[]): Promise<Map<string, string>> {
        const phongs = await this.model.findMany({
            where: {
                id: { in: phongHocIds },
            },
            select: {
                id: true,
                ma_phong: true,
            },
        });

        return new Map(phongs.map((p: any) => [p.id, p.ma_phong]));
    }
}