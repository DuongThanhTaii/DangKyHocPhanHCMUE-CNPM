// src/modules/auth/changePassword.router.ts
import { Router } from "express";
import { prisma } from "../../db/prisma";
import { requireAuth } from "../../middlewares/auth";
import bcrypt from "bcrypt";

const r = Router();

r.post("/change-password", requireAuth, async (req, res) => {
  const userId = req.auth!.sub; // tuỳ bạn set trong middleware
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { tai_khoan: true },
    });
    if (!user?.tai_khoan)
      return res.status(400).json({ error: "Không tìm thấy tài khoản" });

    const ok = await bcrypt.compare(oldPassword, user.tai_khoan.mat_khau);
    if (!ok)
      return res.status(400).json({ error: "Mật khẩu hiện tại không đúng" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.tai_khoan.update({
      where: { id: user.tai_khoan.id },
      data: { mat_khau: hashed },
    });

    return res.json({ message: "Đổi mật khẩu thành công" });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: "Không thể đổi mật khẩu" });
  }
});

export default r;
