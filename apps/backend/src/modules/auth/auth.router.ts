import { Router, Request, Response } from "express";
import { prisma } from "../../db/prisma";
import { z } from "zod";
import { verifyPassword, hashPassword } from "../../utils/password";
import { signJwt } from "../../utils/jwt";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// Body validator
const loginSchema = z.object({
  tenDangNhap: z.string().min(1, "Thiếu tên đăng nhập"),
  matKhau: z.string().min(1, "Thiếu mật khẩu"),
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { tenDangNhap, matKhau } = parsed.data;

    const tk = await prisma.tai_khoan.findUnique({
      where: { ten_dang_nhap: tenDangNhap },
      select: {
        id: true,
        ten_dang_nhap: true,
        mat_khau: true,
        loai_tai_khoan: true,
        trang_thai_hoat_dong: true,
      },
    });

    const invalidMsg = { error: "Sai tên đăng nhập hoặc mật khẩu" };
    if (!tk) return res.status(401).json(invalidMsg);
    if (!tk.trang_thai_hoat_dong)
      return res.status(403).json({ error: "Tài khoản đã bị khóa" });

    const ok = await verifyPassword(matKhau, tk.mat_khau);
    if (!ok) return res.status(401).json(invalidMsg);

    const user = await prisma.users.findFirst({
      where: { tai_khoan_id: tk.id },
      select: { id: true, ho_ten: true, ma_nhan_vien: true },
    });

    if (!user)
      return res.status(500).json({ error: "Tài khoản chưa gắn user" });

    // ✅ Nếu là sinh viên, lấy thêm thông tin sinh viên
    let mssv: string | undefined;
    let lop: string | undefined;
    let nganh: string | undefined;

    if (tk.loai_tai_khoan === "sinh_vien") {
      const sinhVien = await prisma.sinh_vien.findUnique({
        where: { id: user.id },
        select: {
          ma_so_sinh_vien: true,
          lop: true,
          nganh_hoc: {
            select: { ten_nganh: true },
          },
        },
      });

      if (sinhVien) {
        mssv = sinhVien.ma_so_sinh_vien;
        lop = sinhVien.lop || undefined;
        nganh = sinhVien.nganh_hoc?.ten_nganh || undefined;
      }
    }

    // ✅ Sign JWT với đầy đủ thông tin
    const token = signJwt({
      sub: user.id,
      tai_khoan_id: tk.id,
      role: tk.loai_tai_khoan as any,
      mssv,
      hoTen: user.ho_ten,
      lop,
      nganh,
    });

    // ✅ Trả về response đầy đủ
    return res.json({
      token,
      user: {
        id: user.id,
        hoTen: user.ho_ten,
        maNhanVien: user.ma_nhan_vien,
        loaiTaiKhoan: tk.loai_tai_khoan,
        mssv,
        lop,
        nganh,
      },
    });
  } catch (err) {
    console.error("Auth /login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/auth/me  -> trả thông tin user từ token
router.get("/me", requireAuth, async (req, res) => {
  const auth = req.auth!;
  const user = await prisma.users.findUnique({
    where: { id: auth.sub },
    select: { id: true, ho_ten: true, tai_khoan_id: true, ma_nhan_vien: true },
  });
  const tk = await prisma.tai_khoan.findUnique({
    where: { id: auth.tai_khoan_id },
    select: { loai_tai_khoan: true, ten_dang_nhap: true },
  });
  if (!user || !tk)
    return res.status(404).json({ error: "Không tìm thấy user" });

  res.json({
    id: user.id,
    ho_ten: user.ho_ten,
    ten_dang_nhap: tk.ten_dang_nhap,
    loai_tai_khoan: tk.loai_tai_khoan,
    ma_nhan_vien: user.ma_nhan_vien,
  });
});

// (Tuỳ chọn) đổi mật khẩu tự phục vụ
const changeSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6),
});
router.post("/change-password", requireAuth, async (req, res) => {
  const parsed = changeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { oldPassword, newPassword } = parsed.data;

  const tk = await prisma.tai_khoan.findUnique({
    where: { id: req.auth!.tai_khoan_id },
  });
  if (!tk) return res.status(404).json({ error: "Không tìm thấy tài khoản" });

  const ok = await verifyPassword(oldPassword, tk.mat_khau);
  if (!ok)
    return res.status(401).json({ error: "Mật khẩu hiện tại không đúng" });

  await prisma.tai_khoan.update({
    where: { id: tk.id },
    data: { mat_khau: await hashPassword(newPassword) },
  });

  res.json({ ok: true });
});

export default router;
