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

  findByMaKhoa(ma_khoa: string) {
    return this.prisma.khoa.findUnique({
      where: { ma_khoa },
      select: { id: true, ma_khoa: true, ten_khoa: true },
    });
  }

  /**
   * (Tuỳ chọn) Lấy map ma_khoa -> {id, ten_khoa} cho tối ưu hoá resolve hàng loạt
   */
  async mapByMaKhoa(activeOnly = true) {
    const rows = await this.listAll(activeOnly);
    const map = new Map<string, { id: string; ten_khoa: string }>();
    rows.forEach((r) => map.set(r.ma_khoa, { id: r.id, ten_khoa: r.ten_khoa }));
    return map;
  }
}
