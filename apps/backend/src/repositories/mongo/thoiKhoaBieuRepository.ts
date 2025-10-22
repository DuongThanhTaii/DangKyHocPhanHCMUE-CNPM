import { BaseMongoRepository } from "./baseMongoRepository";
import type { ThoiKhoaBieuMonHoc, DanhSachLop } from "../../../node_modules/.prisma/client-mongo";

export class ThoiKhoaBieuRepository extends BaseMongoRepository<ThoiKhoaBieuMonHoc> {
    constructor() {
        super("thoiKhoaBieuMonHoc"); 
    }

    /**
     * Tạo thời khóa biểu mới cho môn học
     */
    async createTKBMonHoc(
        maHocPhan: string,
        hocKyId: string,
        danhSachLop: DanhSachLop[]
    ): Promise<ThoiKhoaBieuMonHoc> {
        return this.model.create({
            data: {
                maHocPhan,
                hocKyId,
                danhSachLop,
            },
        });
    }

    /**
     * ✅ Tìm thời khóa biểu theo mã học phần và học kỳ
     */
    async findByMaHocPhanAndHocKy(
        maHocPhan: string,
        hocKyId: string
    ): Promise<ThoiKhoaBieuMonHoc | null> {
        return this.model.findUnique({
            where: {
                maHocPhan_hocKyId: {
                    maHocPhan,
                    hocKyId,
                },
            },
        });
    }

    /**
     * Lấy tất cả TKB của học kỳ
     */
    async findByHocKy(hocKyId: string): Promise<ThoiKhoaBieuMonHoc[]> {
        return this.model.findMany({
            where: { hocKyId },
            orderBy: { maHocPhan: "asc" },
        });
    }

    /**
     * Lấy tất cả TKB của nhiều mã học phần
     */
    async findByMaHocPhans(
        maHocPhans: string[],
        hocKyId: string
    ): Promise<ThoiKhoaBieuMonHoc[]> {
        return this.model.findMany({
            where: {
                maHocPhan: { in: maHocPhans },
                hocKyId,
            },
        });
    }

    /**
     * Update danh sách lớp
     */
    async updateDanhSachLop(
        id: string,
        danhSachLop: any[]
    ): Promise<ThoiKhoaBieuMonHoc> {
        return this.model.update({
            where: { id },
            data: { danhSachLop },
        });
    }

    /**
     * Thêm 1 lớp vào danh sách
     */
    async addLop(id: string, lopMoi: DanhSachLop): Promise<ThoiKhoaBieuMonHoc> {
        const current = await this.findById(id);
        if (!current) {
            throw new Error("Thời khóa biểu không tồn tại");
        }

        return this.model.update({
            where: { id },
            data: {
                danhSachLop: [...current.danhSachLop, lopMoi],
            },
        });
    }

    /**
     * Xóa 1 lớp khỏi danh sách (theo index)
     */
    async removeLop(id: string, lopIndex: number): Promise<ThoiKhoaBieuMonHoc> {
        const current = await this.findById(id);
        if (!current) {
            throw new Error("Thời khóa biểu không tồn tại");
        }

        const newDanhSachLop = current.danhSachLop.filter((_, index) => index !== lopIndex);

        return this.model.update({
            where: { id },
            data: { danhSachLop: newDanhSachLop },
        });
    }

    /**
     * Upsert: Tạo mới hoặc thêm lớp vào TKB đã có
     */
    async upsertLop(
        maHocPhan: string,
        hocKyId: string,
        lopMoi: DanhSachLop
    ): Promise<ThoiKhoaBieuMonHoc> {
        const existing = await this.findByMaHocPhanAndHocKy(maHocPhan, hocKyId);

        if (existing) {
            // Đã có TKB -> Thêm lớp vào
            return this.addLop(existing.id, lopMoi);
        } else {
            // Chưa có TKB -> Tạo mới
            return this.createTKBMonHoc(maHocPhan, hocKyId, [lopMoi]);
        }
    }
}