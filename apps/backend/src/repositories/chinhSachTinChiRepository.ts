import { prisma } from "../db/prisma";

export const ChinhSachTinChiRepository = {
  findCandidates(params: {
    nganh_id?: string | null;
    khoa_id: string;
    hoc_ky_id: string;
  }) {
    const { nganh_id, khoa_id, hoc_ky_id } = params;
    return prisma.chinh_sach_tin_chi.findMany({
      where: {
        OR: [
          { nganh_id: nganh_id ?? undefined },
          { khoa_id },
          { hoc_ky_id },
          { nganh_id: null, khoa_id: null, hoc_ky_id: null },
        ],
      },
      orderBy: { ngay_hieu_luc: "desc" },
    });
  },

  upsertSimple(data: {
    id?: string;
    hoc_ky_id?: string | null;
    khoa_id?: string | null;
    nganh_id?: string | null;
    phi_moi_tin_chi: any; // Decimalish
    ngay_hieu_luc?: Date;
    ngay_het_hieu_luc?: Date | null;
  }) {
    if (data.id) {
      return prisma.chinh_sach_tin_chi.update({ where: { id: data.id }, data });
    }
    return prisma.chinh_sach_tin_chi.create({ data });
  },
};
