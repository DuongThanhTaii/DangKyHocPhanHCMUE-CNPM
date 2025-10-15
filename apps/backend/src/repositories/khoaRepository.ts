import { khoa, PrismaClient } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class KhoaRepository extends BaseRepository<khoa> {
  constructor(prisma: PrismaClient) {
    super(prisma, "khoa");
  }

  listAll(activeOnly = true) {
    return this.prisma.khoa.findMany({
      where: activeOnly ? { trang_thai_hoat_dong: true } : {},
      select: { id: true, ma_khoa: true, ten_khoa: true },
      orderBy: { ten_khoa: "asc" },
    });
  }
}
