// apps/backend/src/repositories/baoCaoRepository.ts
import { PrismaClient } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class BaoCaoRepository extends BaseRepository<any> {
  constructor(prisma: PrismaClient) {
    // "hoc_ky" chỉ để thỏa constructor của BaseRepository; model name không dùng nhiều ở repo này
    super(prisma, "hoc_ky");
  }

  /** Bộ lọc tiện dụng */
  private lhpFilter(hoc_ky_id: string, khoa_id?: string, nganh_id?: string) {
    return {
      hoc_phan: {
        id_hoc_ky: hoc_ky_id,
        ...(nganh_id
          ? { mon_hoc: { mon_hoc_nganh: { some: { nganh_id } } } }
          : {}),
        ...(khoa_id ? { mon_hoc: { khoa_id } } : {}),
      },
    };
  }

  async soSinhVienDaDangKy(
    hoc_ky_id: string,
    khoa_id?: string,
    nganh_id?: string
  ) {
    const rs = await this.prisma.dang_ky_hoc_phan.findMany({
      where: {
        trang_thai: "da_dang_ky",
        lop_hoc_phan: this.lhpFilter(hoc_ky_id, khoa_id, nganh_id),
      },
      select: { sinh_vien_id: true },
      distinct: ["sinh_vien_id"],
    });
    return rs.length;
  }

  async soBanGhiDangKy(hoc_ky_id: string, khoa_id?: string, nganh_id?: string) {
    return this.prisma.dang_ky_hoc_phan.count({
      where: {
        trang_thai: "da_dang_ky",
        lop_hoc_phan: this.lhpFilter(hoc_ky_id, khoa_id, nganh_id),
      },
    });
  }

  async soLopHocPhanMo(hoc_ky_id: string, khoa_id?: string, nganh_id?: string) {
    return this.prisma.lop_hoc_phan.count({
      where: this.lhpFilter(hoc_ky_id, khoa_id, nganh_id),
    });
  }

  async taiGiangVien(hoc_ky_id: string, khoa_id?: string) {
    const rows = await this.prisma.lop_hoc_phan.groupBy({
      by: ["giang_vien_id"],
      where: {
        hoc_phan: { id_hoc_ky: hoc_ky_id },
        ...(khoa_id ? { giang_vien: { khoa_id } } : {}),
        giang_vien_id: { not: null },
      },
      _count: { _all: true },
    });

    const gvIds = rows.map((r) => r.giang_vien_id!).filter(Boolean);
    const gvs = await this.prisma.giang_vien.findMany({
      where: { id: { in: gvIds } },
      select: { id: true, khoa_id: true, users: { select: { ho_ten: true } } },
    });
    const byId = new Map(gvs.map((g) => [g.id, g]));

    return rows
      .map((r) => ({
        giang_vien_id: r.giang_vien_id,
        ho_ten: byId.get(r.giang_vien_id!)?.users.ho_ten ?? "(Không rõ)",
        so_lop: r._count._all,
      }))
      .sort((a, b) => b.so_lop - a.so_lop);
  }

  async taiChinh(hoc_ky_id: string, khoa_id?: string, nganh_id?: string) {
    const tt = await this.prisma.payment_transactions.aggregate({
      where: { hoc_ky_id, status: "paid" },
      _sum: { amount: true },
    });
    const thuc_thu = Number(tt._sum.amount ?? 0);

    const expected = await this.prisma.hoc_phi.aggregate({
      where: {
        hoc_ky_id,
        ...(khoa_id || nganh_id
          ? {
              sinh_vien: {
                ...(khoa_id ? { khoa_id } : {}),
                ...(nganh_id ? { nganh_id } : {}),
              },
            }
          : {}),
      },
      _sum: { tong_hoc_phi: true },
    });

    return {
      thuc_thu,
      ky_vong: Number(expected._sum.tong_hoc_phi ?? 0),
    };
  }

  async dangKyTheoKhoa(hoc_ky_id: string) {
    const rows = await this.prisma.dang_ky_hoc_phan.groupBy({
      by: ["lop_hoc_phan_id"],
      where: {
        trang_thai: "da_dang_ky",
        lop_hoc_phan: { hoc_phan: { id_hoc_ky: hoc_ky_id } },
      },
      _count: { _all: true },
    });

    const lhpIds = rows.map((r) => r.lop_hoc_phan_id);
    const lhps = await this.prisma.lop_hoc_phan.findMany({
      where: { id: { in: lhpIds } },
      select: {
        id: true,
        hoc_phan: {
          select: {
            mon_hoc: {
              select: { khoa_id: true, khoa: { select: { ten_khoa: true } } },
            },
          },
        },
      },
    });

    const byId = new Map(lhps.map((x) => [x.id, x]));
    const agg = new Map<string, { ten_khoa: string; so_dang_ky: number }>();
    for (const r of rows) {
      const khoa = byId.get(r.lop_hoc_phan_id)?.hoc_phan.mon_hoc.khoa;
      if (!khoa) continue;
      const key = khoa.ten_khoa;
      const cur = agg.get(key) || { ten_khoa: key, so_dang_ky: 0 };
      cur.so_dang_ky += r._count._all;
      agg.set(key, cur);
    }
    return Array.from(agg.values()).sort((a, b) => b.so_dang_ky - a.so_dang_ky);
  }

  async dangKyTheoNganh(hoc_ky_id: string, khoa_id?: string) {
    const rows = await this.prisma.dang_ky_hoc_phan.findMany({
      where: {
        trang_thai: "da_dang_ky",
        lop_hoc_phan: {
          hoc_phan: {
            id_hoc_ky: hoc_ky_id,
            ...(khoa_id ? { mon_hoc: { khoa_id } } : {}),
          },
        },
      },
      select: {
        lop_hoc_phan: {
          select: {
            hoc_phan: {
              select: {
                mon_hoc: {
                  select: {
                    mon_hoc_nganh: {
                      select: {
                        nganh_hoc: { select: { id: true, ten_nganh: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const agg = new Map<
      string,
      { nganh_id: string; ten_nganh: string; so_dang_ky: number }
    >();
    for (const r of rows) {
      const list = r.lop_hoc_phan.hoc_phan.mon_hoc.mon_hoc_nganh || [];
      if (!list.length) {
        const key = "Khác/Không gán ngành";
        const cur = agg.get(key) || {
          nganh_id: "NA",
          ten_nganh: key,
          so_dang_ky: 0,
        };
        cur.so_dang_ky += 1;
        agg.set(key, cur);
      } else {
        for (const m of list) {
          const key = m.nganh_hoc.ten_nganh;
          const cur = agg.get(key) || {
            nganh_id: m.nganh_hoc.id,
            ten_nganh: key,
            so_dang_ky: 0,
          };
          cur.so_dang_ky += 1;
          agg.set(key, cur);
        }
      }
    }
    return Array.from(agg.values()).sort((a, b) => b.so_dang_ky - a.so_dang_ky);
  }
}
