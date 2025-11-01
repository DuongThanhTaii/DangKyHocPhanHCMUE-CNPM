import { Request, Response } from "express";
import { prisma } from "../../db/prisma";
import bcrypt from "bcrypt";
import { signJwt } from "../../utils/jwt";

export const loginHandler = async (req: Request, res: Response) => {
    try {
        const { ten_dang_nhap, mat_khau } = req.body;

        // Validate input
        if (!ten_dang_nhap || !mat_khau) {
            return res.status(400).json({ error: "Thiếu thông tin đăng nhập" });
        }

        // Find account
        const account = await prisma.tai_khoan.findUnique({
            where: { ten_dang_nhap },
            include: { users: true },
        });

        if (!account || !account.trang_thai_hoat_dong) {
            return res.status(401).json({ error: "Tài khoản không hợp lệ" });
        }

        // Verify password
        const valid = await bcrypt.compare(mat_khau, account.mat_khau);
        if (!valid) {
            return res.status(401).json({ error: "Sai mật khẩu" });
        }

        const user = account.users[0];
        if (!user) {
            return res.status(401).json({ error: "Người dùng không tồn tại" });
        }

        // ✅ Nếu là sinh viên, lấy thêm thông tin sinh viên
        let mssv: string | undefined;
        let hoTen: string | undefined;
        let lop: string | undefined;
        let nganh: string | undefined;

        if (account.loai_tai_khoan === "sinh_vien") {
            const sinhVien = await prisma.sinh_vien.findUnique({
                where: { id: user.id },
                include: { nganh_hoc: true },
            });

            if (sinhVien) {
                mssv = sinhVien.ma_so_sinh_vien;
                hoTen = user.ho_ten;
                lop = sinhVien.lop || undefined;
                nganh = sinhVien.nganh_hoc?.ten_nganh || undefined;
            }
        }

        // ✅ Sign JWT với thông tin đầy đủ
        const token = signJwt({
            sub: user.id,
            tai_khoan_id: account.id,
            role: account.loai_tai_khoan as any,
            mssv,
            hoTen,
            lop,
            nganh,
        });

        return res.json({
            token,
            role: account.loai_tai_khoan,
            user: {
                id: user.id,
                hoTen: user.ho_ten,
                email: user.email,
                mssv,
                lop,
                nganh,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Lỗi máy chủ" });
    }
};
