import { prisma } from "../db/prisma";
import { Prisma } from "../../node_modules/.prisma/client";

export const MienGiamHocPhiRepository = {
  upsert(input: {
    sinh_vien_id: string;
    hoc_ky_id: string;
    loai: string;
    mien_phi?: boolean;
    ti_le_giam?: number;
    ghi_chu?: string;
  }) {
    const tiLe = input.mien_phi
      ? new Prisma.Decimal(100)
      : input.ti_le_giam != null
      ? new Prisma.Decimal(input.ti_le_giam)
      : new Prisma.Decimal(0);

    return prisma.mien_giam_hoc_phi.upsert({
      where: {
        sinh_vien_id_hoc_ky_id_loai: {
          sinh_vien_id: input.sinh_vien_id,
          hoc_ky_id: input.hoc_ky_id,
          loai: input.loai,
        },
      },
      update: {
        mien_phi: !!input.mien_phi,
        ti_le_giam: tiLe,
        ghi_chu: input.ghi_chu,
      },
      create: {
        sinh_vien_id: input.sinh_vien_id,
        hoc_ky_id: input.hoc_ky_id,
        loai: input.loai,
        mien_phi: !!input.mien_phi,
        ti_le_giam: tiLe,
        ghi_chu: input.ghi_chu,
      },
    });
  },

  findFirstBySVHK(sinh_vien_id: string, hoc_ky_id: string) {
    return prisma.mien_giam_hoc_phi.findFirst({
      where: { sinh_vien_id, hoc_ky_id },
      orderBy: { id: "desc" },
    });
  },

  listBySemester(hoc_ky_id: string) {
    return prisma.mien_giam_hoc_phi.findMany({
      where: { hoc_ky_id },
      orderBy: { id: "desc" },
      include: {
        sinh_vien: {
          select: {
            id: true,
            ma_so_sinh_vien: true,
            nganh_hoc: { select: { ten_nganh: true } },
            users: { select: { ho_ten: true, email: true } },
          },
        },
      },
    });
  },

  delete(sinh_vien_id: string, hoc_ky_id: string, loai: string) {
    return prisma.mien_giam_hoc_phi.delete({
      where: { sinh_vien_id_hoc_ky_id_loai: { sinh_vien_id, hoc_ky_id, loai } },
    });
  },
};
