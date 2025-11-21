import { PrismaClient, Prisma } from "@prisma/client";

export class SinhVienRepository {
  constructor(private prisma: PrismaClient) {}

  async findPaged(p: { page: number; pageSize: number; q?: string }) {
    const { page, pageSize, q } = p;
    const where: Prisma.sinh_vienWhereInput = q
      ? {
          OR: [
            { ma_so_sinh_vien: { contains: q, mode: "insensitive" } },
            { lop: { contains: q, mode: "insensitive" } },
            { users: { ho_ten: { contains: q, mode: "insensitive" } } as any },
          ],
        }
      : {};
    const [items, total] = await Promise.all([
      this.prisma.sinh_vien.findMany({
        where,
        include: {
          users: { include: { tai_khoan: true } },
          khoa: true,
          nganh_hoc: true,
        },
        orderBy: { users: { created_at: "desc" } },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.sinh_vien.count({ where }),
    ]);
    return { items, total };
  }

  findById(id: string) {
    return this.prisma.sinh_vien.findUnique({
      where: { id },
      include: {
        users: { include: { tai_khoan: true } },
        khoa: true,
        nganh_hoc: true,
      },
    });
  }

  findByMSSV(ma_so_sinh_vien: string) {
    return this.prisma.sinh_vien.findUnique({ where: { ma_so_sinh_vien } });
  }

  create(data: {
    id: string; // = users.id
    ma_so_sinh_vien: string;
    khoa_id: string;
    lop?: string | null;
    khoa_hoc?: string | null;
    ngay_nhap_hoc?: Date | null;
    nganh_id?: string | null;
  }) {
    return this.prisma.sinh_vien.create({ data });
  }

  update(
    id: string,
    data: Partial<{
      ma_so_sinh_vien: string;
      khoa_id: string;
      lop: string | null;
      khoa_hoc: string | null;
      ngay_nhap_hoc: Date | null;
      nganh_id: string | null;
    }>
  ) {
    return this.prisma.sinh_vien.update({ where: { id }, data });
  }
}
