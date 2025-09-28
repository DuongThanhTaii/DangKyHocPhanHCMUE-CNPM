// apps/backend/src/modules/tlk/tlk.router.ts
import { Router } from "express";
import { prisma } from "../../db/prisma";
import { requireAuth, requireRole } from "../../middlewares/auth";

const r = Router();

/** Học kỳ + niên khóa hiện hành (dùng chung) */
r.get("/hien-hanh", requireAuth, async (_req, res) => {
  const hk = await prisma.hoc_ky.findFirst({
    where: { trang_thai_hien_tai: true },
    include: { nien_khoa: true },
  });
  if (!hk)
    return res.status(404).json({ error: "Chưa cấu hình học kỳ hiện hành" });
  res.json({
    hoc_ky_id: hk.id,
    ten_hoc_ky: hk.ten_hoc_ky,
    nien_khoa: hk.nien_khoa.ten_nien_khoa,
  });
});

/** Danh mục môn học theo khoa của TLK (suy từ JWT) */
r.get(
  "/tlk/mon-hoc",
  requireAuth,
  requireRole("tro_ly_khoa"),
  async (req, res) => {
    const khoa_id = (req.auth as any).khoa_id as string | undefined;
    if (!khoa_id)
      return res.status(400).json({ error: "Không xác định khoa của TLK" });

    const data = await prisma.mon_hoc.findMany({
      where: { khoa_id },
      select: { id: true, ma_mon: true, ten_mon: true, so_tin_chi: true },
      orderBy: [{ ma_mon: "asc" }],
    });
    res.json({ data });
  }
);

/** Giảng viên theo khoa (optional lọc theo môn) */
r.get(
  "/tlk/giang-vien",
  requireAuth,
  requireRole("tro_ly_khoa"),
  async (req, res) => {
    const khoa_id = (req.auth as any).khoa_id as string | undefined;
    if (!khoa_id)
      return res.status(400).json({ error: "Không xác định khoa của TLK" });

    const gvs = await prisma.giang_vien.findMany({
      where: { khoa_id },
      select: { id: true, user: { select: { ho_ten: true } } },
      orderBy: { user: { ho_ten: "asc" } },
    });
    res.json({
      data: gvs.map((g) => ({ id: g.id, ho_ten: g.user?.ho_ten || "" })),
    });
  }
);

/** Batch tạo đề xuất học phần */
r.post(
  "/tlk/de-xuat-hoc-phan/batch",
  requireAuth,
  requireRole("tro_ly_khoa"),
  async (req, res) => {
    const khoa_id = (req.auth as any).khoa_id as string | undefined;
    const nguoi_tao_id = req.auth!.sub;
    const { hoc_ky_id, danhSachDeXuat } = req.body as {
      hoc_ky_id: string;
      danhSachDeXuat: {
        mon_hoc_id: string;
        so_lop_du_kien: number;
        giang_vien_id?: string | null;
      }[];
    };

    if (!khoa_id)
      return res.status(400).json({ error: "Không xác định khoa của TLK" });
    if (
      !hoc_ky_id ||
      !Array.isArray(danhSachDeXuat) ||
      danhSachDeXuat.length === 0
    )
      return res.status(400).json({ error: "Dữ liệu không hợp lệ" });

    const monIds = danhSachDeXuat.map((d) => d.mon_hoc_id);
    const count = await prisma.mon_hoc.count({
      where: { id: { in: monIds }, khoa_id },
    });
    if (count !== monIds.length)
      return res.status(400).json({ error: "Có môn không thuộc khoa" });

    // dùng createMany cho hiệu năng
    await prisma.de_xuat_hoc_phan.createMany({
      data: danhSachDeXuat.map((d) => ({
        khoa_id,
        hoc_ky_id,
        mon_hoc_id: d.mon_hoc_id,
        so_lop_du_kien: Math.max(1, d.so_lop_du_kien || 1),
        giang_vien_de_xuat: d.giang_vien_id ?? null,
        nguoi_tao_id,
        trang_thai: "cho_duyet",
        cap_duyet_hien_tai: "truong_khoa",
      })),
    });

    res.json({ ok: true });
  }
);

export default r;
