import { PrismaClient } from "@prisma/client";
import {
    IBaoCaoRepository,
    OverviewStatsData,
    KhoaStatsData,
    NganhStatsData,
    GiangVienStatsData,
} from "../../../application/ports/baoCaoThongKe/IBaoCaoRepository";

export class PrismaBaoCaoRepository implements IBaoCaoRepository {
    constructor(private prisma: PrismaClient) { }

    async getOverviewStats(
        hocKyId: string,
        khoaId?: string,
        nganhId?: string
    ): Promise<OverviewStatsData> {
        const where: any = { lop_hoc_phan: { hoc_phan: { id_hoc_ky: hocKyId } } };
        if (khoaId) where.sinh_vien = { khoa_id: khoaId };
        if (nganhId) where.sinh_vien = { ...where.sinh_vien, nganh_id: nganhId };

        const [svUnique, soDangKy, soLopHocPhan, taiChinh] = await Promise.all([
            this.prisma.dang_ky_hoc_phan.groupBy({
                by: ["sinh_vien_id"],
                where,
                _count: true,
            }),
            this.prisma.dang_ky_hoc_phan.count({ where }),
            this.prisma.lop_hoc_phan.count({
                where: { hoc_phan: { id_hoc_ky: hocKyId } },
            }),
            this.prisma.hoc_phi.aggregate({
                where: { hoc_ky_id: hocKyId, ...(khoaId && { sinh_vien: { khoa_id: khoaId } }) },
                _sum: { tong_hoc_phi: true },
            }),
        ]);

        const thucThu = Number(taiChinh._sum.tong_hoc_phi || 0);
        const kyVong = soLopHocPhan * 50 * 500000; // Example calculation

        return {
            svUnique: svUnique.length,
            soDangKy,
            soLopHocPhan,
            thucThu,
            kyVong,
        };
    }

    async getDangKyByKhoa(hocKyId: string): Promise<KhoaStatsData[]> {
        const result = await this.prisma.dang_ky_hoc_phan.groupBy({
            by: ["sinh_vien_id"],
            where: { lop_hoc_phan: { hoc_phan: { id_hoc_ky: hocKyId } } },
            _count: true,
        });

        const sinhVienIds = result.map((r) => r.sinh_vien_id);
        const sinhViens = await this.prisma.sinh_vien.findMany({
            where: { id: { in: sinhVienIds } },
            include: { khoa: true },
        });

        const khoaMap = new Map<string, { tenKhoa: string; count: number }>();
        sinhViens.forEach((sv) => {
            const key = sv.khoa_id;
            const existing = khoaMap.get(key) || { tenKhoa: sv.khoa.ten_khoa, count: 0 };
            khoaMap.set(key, { ...existing, count: existing.count + 1 });
        });

        return Array.from(khoaMap.entries()).map(([khoaId, data]) => ({
            khoaId,
            tenKhoa: data.tenKhoa,
            soDangKy: data.count,
        }));
    }

    async getDangKyByNganh(hocKyId: string, khoaId?: string): Promise<NganhStatsData[]> {
        const where: any = { lop_hoc_phan: { hoc_phan: { id_hoc_ky: hocKyId } } };
        if (khoaId) where.sinh_vien = { khoa_id: khoaId };

        const result = await this.prisma.dang_ky_hoc_phan.groupBy({
            by: ["sinh_vien_id"],
            where,
            _count: true,
        });

        const sinhVienIds = result.map((r) => r.sinh_vien_id);
        const sinhViens = await this.prisma.sinh_vien.findMany({
            where: { id: { in: sinhVienIds }, nganh_id: { not: null } },
            include: { nganh_hoc: true },
        });

        const nganhMap = new Map<string, { tenNganh: string; count: number }>();
        sinhViens.forEach((sv) => {
            if (!sv.nganh_id || !sv.nganh_hoc) return;
            const key = sv.nganh_id;
            const existing = nganhMap.get(key) || { tenNganh: sv.nganh_hoc.ten_nganh, count: 0 };
            nganhMap.set(key, { ...existing, count: existing.count + 1 });
        });

        return Array.from(nganhMap.entries()).map(([nganhId, data]) => ({
            nganhId,
            tenNganh: data.tenNganh,
            soDangKy: data.count,
        }));
    }

    async getTaiGiangVien(hocKyId: string, khoaId?: string): Promise<GiangVienStatsData[]> {
        const where: any = { hoc_phan: { id_hoc_ky: hocKyId }, giang_vien_id: { not: null } };
        if (khoaId) where.giang_vien = { khoa_id: khoaId };

        const result = await this.prisma.lop_hoc_phan.groupBy({
            by: ["giang_vien_id"],
            where,
            _count: true,
        });

        const gvIds = result.map((r) => r.giang_vien_id).filter((id): id is string => id !== null);
        const giangViens = await this.prisma.giang_vien.findMany({
            where: { id: { in: gvIds } },
            include: { users: true },
        });

        return result.map((r) => {
            const gv = giangViens.find((g) => g.id === r.giang_vien_id);
            return {
                giangVienId: r.giang_vien_id!,
                hoTen: gv?.users.ho_ten || "N/A",
                soLop: r._count,
            };
        });
    }
}
