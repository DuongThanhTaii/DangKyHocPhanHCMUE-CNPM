import { prisma } from "../../db/prisma";

export const tlkService = {
    async hienHanhHocKy() {
        const hk = await prisma.hoc_ky.findFirst({
            where: { trang_thai_hien_tai: true },
            include: { nien_khoa: true },
        });
        if (!hk) throw new Error("Chưa cấu hình học kỳ hiện hành");
        return {
            hoc_ky_id: hk.id,
            ten_hoc_ky: hk.ten_hoc_ky,
            nien_khoa: hk.nien_khoa.ten_nien_khoa,
        };
    },

    async danhMucMonHocTheoKhoa(user_id: string) {
        const tlk = await prisma.tro_ly_khoa.findUnique({
            where: { id: user_id },
            select: { khoa_id: true }
        });
        if (!tlk || !tlk.khoa_id) throw new Error("Không xác định trợ lý khoa");
        return prisma.mon_hoc.findMany({
            where: { khoa_id: tlk.khoa_id },
            select: { id: true, ma_mon: true, ten_mon: true, so_tin_chi: true },
            orderBy: [{ ma_mon: "asc" }],
        });
    },

    async giangVienTheoKhoa(user_id: string) {
        const tlk = await prisma.tro_ly_khoa.findUnique({
            where: { id: user_id },
            select: { khoa_id: true }
        });
        if (!tlk?.khoa_id) throw new Error("Không xác định khoa của TLK");
        const gvs = await prisma.giang_vien.findMany({
            where: { khoa_id: tlk.khoa_id },
            select: { id: true, users: { select: { ho_ten: true } } },
            orderBy: { users: { ho_ten: "asc" } },
        });
        return gvs.map((g) => ({ id: g.id, ho_ten: g.users?.ho_ten || "" }));
    },

    async batchDeXuatHocPhan(khoa_id: string, nguoi_tao_id: string, hoc_ky_id: string, danhSachDeXuat: any[]) {
        const monIds = danhSachDeXuat.map((d) => d.mon_hoc_id);
        const count = await prisma.mon_hoc.count({
            where: { id: { in: monIds }, khoa_id },
        });
        if (count !== monIds.length) throw new Error("Có môn không thuộc khoa");

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
        return { ok: true };
    },
};