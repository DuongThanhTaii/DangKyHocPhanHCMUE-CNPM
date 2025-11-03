import { injectable } from "inversify";
import { PrismaClient } from "@prisma/client";
import { ITaiKhoanRepository, TaiKhoanDTO } from "../../../application/ports/qlSinhVienPDT/repositories/ITaiKhoanRepository";

@injectable()
export class PrismaTaiKhoanRepository implements ITaiKhoanRepository {
    constructor(private prisma: PrismaClient) { }

    async findByUsername(username: string): Promise<TaiKhoanDTO | null> {
        const taiKhoan = await this.prisma.tai_khoan.findUnique({
            where: { ten_dang_nhap: username },
            select: { id: true, ten_dang_nhap: true },
        });

        if (!taiKhoan) return null;

        return {
            id: taiKhoan.id,
            tenDangNhap: taiKhoan.ten_dang_nhap,
        };
    }

    async create(data: { tenDangNhap: string; matKhau: string; loaiTaiKhoan: string; trangThaiHoatDong: boolean }) {
        const result = await this.prisma.tai_khoan.create({
            data: {
                ten_dang_nhap: data.tenDangNhap,
                mat_khau: data.matKhau,
                loai_tai_khoan: data.loaiTaiKhoan,
                trang_thai_hoat_dong: data.trangThaiHoatDong,
            },
        });
        return result.id;
    }
}
