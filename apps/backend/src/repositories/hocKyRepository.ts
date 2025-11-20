import type { hoc_ky, PrismaClient } from "@prisma/client";
import { BaseRepository } from "./baseRepository";
import { HocKyHienHanhDTO } from "../dtos/pdtDTO";

export type NienKhoaWithHocKyFromDB = {
  id: string;
  ten_nien_khoa: string;
  ngay_bat_dau: Date | null;
  ngay_ket_thuc: Date | null;
  hoc_ky: {
    id: string;
    ten_hoc_ky: string;
    ngay_bat_dau: Date | null;
    ngay_ket_thuc: Date | null;
  }[];
};

export class HocKyRepository extends BaseRepository<hoc_ky> {
  constructor(prisma: PrismaClient) {
    super(prisma, "hoc_ky");
  }

  async findAllNienKhoaWithHocKy(): Promise<NienKhoaWithHocKyFromDB[]> {
    return (this.prisma as any).nien_khoa.findMany({
      select: {
        id: true,
        ten_nien_khoa: true,
        ngay_bat_dau: true,
        ngay_ket_thuc: true,
        hoc_ky: {
          select: {
            id: true,
            ten_hoc_ky: true,
            ngay_bat_dau: true,
            ngay_ket_thuc: true,
          },
          orderBy: {
            id: "asc",
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });
  }
  async findHocKyHienHanh(): Promise<HocKyHienHanhDTO | null> {
    return this.model.findFirst({
      where: {
        trang_thai_hien_tai: true,
      },
      include: {
        nien_khoa: {
          select: {
            id: true,
            ten_nien_khoa: true,
          },
        },
      },
    });
  }

  async resetAllTrangThaiHienTai(): Promise<{ count: number }> {
    return this.model.updateMany({
      where: {
        trang_thai_hien_tai: true,
      },
      data: {
        trang_thai_hien_tai: false,
      },
    });
  }

  async setTrangThaiHienTai(hocKyId: string): Promise<hoc_ky> {
    return this.model.update({
      where: {
        id: hocKyId,
      },
      data: {
        trang_thai_hien_tai: true,
      },
    });
  }
}
