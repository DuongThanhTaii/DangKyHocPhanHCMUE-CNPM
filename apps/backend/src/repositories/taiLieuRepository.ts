import { PrismaClient, tai_lieu } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class TaiLieuRepository extends BaseRepository<tai_lieu> {
    constructor(prisma: PrismaClient) {
        super(prisma, "tai_lieu");
    }

    /**
     * Lấy danh sách tài liệu theo lớp học phần
     */
    async findByLopHocPhanId(lop_hoc_phan_id: string) {
        return this.model.findMany({
            where: { lop_hoc_phan_id },
            orderBy: { created_at: "desc" },
        });
    }

    /**
     * Tạo tài liệu mới
     */
    async createDocument(data: {
        lop_hoc_phan_id: string;
        ten_tai_lieu: string;
        file_path: string;
        file_type?: string | null;
        uploaded_by: string;
    }) {
        return this.model.create({ data });
    }

    /**
     * Xóa tài liệu theo ID
     */
    async deleteById(id: string) {
        return this.model.delete({
            where: { id },
        });
    }

    /**
     * Update tên tài liệu (không đổi file)
     */
    async updateTenTaiLieu(id: string, ten_tai_lieu: string) {
        return this.model.update({
            where: { id },
            data: { ten_tai_lieu },
        });
    }
}
