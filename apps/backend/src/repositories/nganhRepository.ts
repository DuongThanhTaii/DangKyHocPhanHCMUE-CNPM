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

  /**
   * Alias rõ nghĩa hơn cho list theo khoa
   */
  listByKhoa(params?: { khoa_id?: string }) {
    return this.listAll(params);
  }

  /**
   * Tìm ngành theo mã ngành (ma_nganh là unique)
   */
  findByMaNganh(ma_nganh: string) {
    return this.prisma.nganh_hoc.findUnique({
      where: { ma_nganh },
      select: { id: true, ma_nganh: true, ten_nganh: true, khoa_id: true },
    });
  }

  /**
   * (Tuỳ chọn) Lấy map ma_nganh -> {id, ten_nganh, khoa_id}
   * Hữu ích khi resolve nhiều mã ngành từ Excel
   */
  async mapByMaNganh(params?: { khoa_id?: string }) {
    const rows = await this.listAll(params);
    const map = new Map<
      string,
      { id: string; ten_nganh: string; khoa_id: string }
    >();
    rows.forEach((r) =>
      map.set(r.ma_nganh, {
        id: r.id,
        ten_nganh: r.ten_nganh,
        khoa_id: r.khoa_id,
      })
    );
    return map;
  }

  /**
   * (Tuỳ chọn) Tìm nhiều ngành theo danh sách mã (có thể lọc trong 1 khoa)
   */
  findManyByMaNganh(ma_list: string[], khoa_id?: string) {
    return this.prisma.nganh_hoc.findMany({
      where: {
        ma_nganh: { in: ma_list },
        ...(khoa_id ? { khoa_id } : {}),
      },
      select: { id: true, ma_nganh: true, ten_nganh: true, khoa_id: true },
      orderBy: { ten_nganh: "asc" },
    });
  }
}
