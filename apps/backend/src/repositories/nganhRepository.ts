import { PrismaClient } from "@prisma/client";

export class NganhRepository {
  constructor(private prisma: PrismaClient) {}

  listAll(params?: { khoa_id?: string }) {
    return this.prisma.nganh_hoc.findMany({
      where: params?.khoa_id ? { khoa_id: params.khoa_id } : {},
      select: { id: true, ma_nganh: true, ten_nganh: true, khoa_id: true },
      orderBy: { ten_nganh: "asc" },
    });
  }
}
