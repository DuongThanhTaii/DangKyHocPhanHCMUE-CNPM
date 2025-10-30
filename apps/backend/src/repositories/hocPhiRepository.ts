import { prisma } from "../db/prisma";
import { Prisma } from "../../node_modules/.prisma/client";

export const HocPhiRepository = {
  upsertHocPhi(
    sinh_vien_id: string,
    hoc_ky_id: string,
    chinh_sach_id: string | null
  ) {
    return prisma.hoc_phi.upsert({
      where: { sinh_vien_id_hoc_ky_id: { sinh_vien_id, hoc_ky_id } },
      update: { chinh_sach_id, ngay_tinh_toan: new Date() },
      create: {
        sinh_vien_id,
        hoc_ky_id,
        tong_hoc_phi: new Prisma.Decimal(0),
        trang_thai_thanh_toan: "chua_thanh_toan",
        chinh_sach_id,
      },
    });
  },

  deleteChiTiet(hoc_phi_id: string) {
    return prisma.chi_tiet_hoc_phi.deleteMany({ where: { hoc_phi_id } });
  },

  createChiTiet(input: {
    hoc_phi_id: string;
    lop_hoc_phan_id: string;
    so_tin_chi: number;
    phi_tin_chi: any; // Decimal
    thanh_tien: any; // Decimal
  }) {
    return prisma.chi_tiet_hoc_phi.create({ data: input });
  },

  updateTong(hoc_phi_id: string, tong: any) {
    return prisma.hoc_phi.update({
      where: { id: hoc_phi_id },
      data: { tong_hoc_phi: tong, ngay_tinh_toan: new Date() },
      include: {
        chi_tiet_hoc_phi: true,
        chinh_sach_tin_chi: true,
        hoc_ky: true,
      },
    });
  },

  getOneOfStudent(sinh_vien_id: string, hoc_ky_id: string) {
    return prisma.hoc_phi.findUnique({
      where: { sinh_vien_id_hoc_ky_id: { sinh_vien_id, hoc_ky_id } },
      include: {
        chi_tiet_hoc_phi: true,
        chinh_sach_tin_chi: true,
        hoc_ky: true,
      },
    });
  },

  listOfStudent(sinh_vien_id: string) {
    return prisma.hoc_phi.findMany({
      where: { sinh_vien_id },
      orderBy: { ngay_tinh_toan: "desc" },
      include: {
        chi_tiet_hoc_phi: true,
        chinh_sach_tin_chi: true,
        hoc_ky: true,
      },
    });
  },
};
