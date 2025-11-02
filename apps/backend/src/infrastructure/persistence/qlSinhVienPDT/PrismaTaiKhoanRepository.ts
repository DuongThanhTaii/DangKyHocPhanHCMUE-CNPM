import { PrismaClient, Prisma } from "@prisma/client";
import { ITaiKhoanRepository, CreateTaiKhoanData } from "../../../application/ports/qlSinhVienPDT/repositories/ITaiKhoanRepository";

export class PrismaTaiKhoanRepository implements ITaiKhoanRepository {
    constructor(private db: PrismaClient | Prisma.TransactionClient) { }

    async findByUsername(username: string): Promise<{ id: string } | null> {
        const record = await this.db.tai_khoan.findUnique({
            where: { ten_dang_nhap: username },
            select: { id: true },
        });
        return record;
    }

    async create(data: CreateTaiKhoanData): Promise<string> {
        const record = await this.db.tai_khoan.create({
            data: {
                ten_dang_nhap: data.tenDangNhap,
                mat_khau: data.matKhau,
                loai_tai_khoan: data.loaiTaiKhoan,
                trang_thai_hoat_dong: data.trangThaiHoatDong,
            },
        });
        return record.id;
    }

    async update(id: string, data: { matKhau?: string; trangThaiHoatDong?: boolean }): Promise<void> {
        const updateData: any = {};
        if (data.matKhau) updateData.mat_khau = data.matKhau;
        if (data.trangThaiHoatDong !== undefined) updateData.trang_thai_hoat_dong = data.trangThaiHoatDong;

        await this.db.tai_khoan.update({
            where: { id },
            data: updateData,
        });
    }

    async delete(id: string): Promise<void> {
        await this.db.tai_khoan.delete({ where: { id } });
    }
}
