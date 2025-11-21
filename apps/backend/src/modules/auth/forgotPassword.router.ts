import { Router } from "express";
import { prisma } from "../../db/prisma";
import crypto from "crypto";
import { sendEmail } from "../../utils/mailer"; // dùng nodemailer
import bcrypt from "bcrypt";

const router = Router();

// ✅ B1: Gửi email reset
router.post("/forgot-password", async (req, res) => {
  const { ten_dang_nhap, email } = req.body;
  try {
    const user = await prisma.users.findFirst({
      where: {
        email,
        tai_khoan: { ten_dang_nhap },
      },
      include: { tai_khoan: true },
    });

    if (!user) return res.status(400).json({ error: "Thông tin không hợp lệ" });

    // Sinh token ngẫu nhiên + lưu vào bảng
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 phút

    await prisma.reset_token.create({
      data: {
        tai_khoan_id: user.tai_khoan_id!,
        token,
        expires_at: expires,
      },
    });

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    await sendEmail(
      email,
      "Khôi phục mật khẩu",
      `Xin chào ${user.ho_ten},\n\nNhấn vào link sau để đổi mật khẩu:\n${resetLink}\n\nLink hết hạn sau 15 phút.`
    );

    res.json({ message: "Đã gửi email khôi phục mật khẩu" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

// ✅ B2: Xử lý đổi mật khẩu
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const record = await prisma.reset_token.findUnique({ where: { token } });
    if (!record || record.expires_at < new Date()) {
      return res
        .status(400)
        .json({ error: "Token không hợp lệ hoặc đã hết hạn" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.tai_khoan.update({
      where: { id: record.tai_khoan_id },
      data: { mat_khau: hashed },
    });

    // Xóa token sau khi dùng
    await prisma.reset_token.delete({ where: { token } });

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Không thể đổi mật khẩu" });
  }
});

export default router;
