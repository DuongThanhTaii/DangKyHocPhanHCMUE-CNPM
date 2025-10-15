import { PrismaClient, Prisma } from "@prisma/client";

export class GiangVienRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.giang_vien.findMany({
      include: {
        users: {
          include: {
            tai_khoan: {
              select: {
                ten_dang_nhap: true,
                loai_tai_khoan: true,
                trang_thai_hoat_dong: true,
              },
            },
          },
        },
        khoa: { select: { id: true, ten_khoa: true } },
      },
      orderBy: { users: { ho_ten: "asc" } },
    });
  }

  async findById(id: string) {
    return this.prisma.giang_vien.findUnique({
      where: { id },
      include: {
        users: {
          include: { tai_khoan: { select: { ten_dang_nhap: true } } },
        },
        khoa: { select: { id: true, ten_khoa: true } },
      },
    });
  }

  async create(data: {
    ten_dang_nhap: string;
    mat_khau: string;
    ho_ten: string;
    khoa_id: string;
    trinh_do?: string;
    chuyen_mon?: string;
    kinh_nghiem_giang_day?: number;
  }) {
    const {
      ten_dang_nhap,
      mat_khau,
      ho_ten,
      khoa_id,
      trinh_do,
      chuyen_mon,
      kinh_nghiem_giang_day,
    } = data;

    // Bắt đầu transaction (3 bảng: tai_khoan → users → giang_vien)
    return this.prisma.$transaction(async (tx) => {
      const tai_khoan = await tx.tai_khoan.create({
        data: {
          ten_dang_nhap,
          mat_khau,
          loai_tai_khoan: "giang_vien",
          trang_thai_hoat_dong: true,
        },
      });

      const users = await tx.users.create({
        data: {
          id: tai_khoan.id,
          ho_ten,
          ma_nhan_vien: ten_dang_nhap,
          tai_khoan_id: tai_khoan.id,
        },
      });

      const gv = await tx.giang_vien.create({
        data: {
          id: users.id,
          khoa_id,
          trinh_do,
          chuyen_mon,
          kinh_nghiem_giang_day,
        },
      });

      return { ...gv, users, tai_khoan };
    });
  }

  async update(
    id: string,
    data: Partial<Prisma.giang_vienUpdateInput> & {
      ho_ten?: string;
      mat_khau?: string;
    }
  ) {
    return this.prisma.$transaction(async (tx) => {
      const { ho_ten, mat_khau, ...rest } = data;

      if (ho_ten) {
        await tx.users.update({
          where: { id },
          data: { ho_ten },
        });
      }

      if (mat_khau) {
        await tx.users.update({
          where: { id },
          data: {
            tai_khoan: { update: { mat_khau } },
          },
        });
      }

      const gv = await tx.giang_vien.update({
        where: { id },
        data: rest,
      });

      return gv;
    });
  }

  async delete(id: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.giang_vien.delete({ where: { id } });
      await tx.users.delete({ where: { id } });
      await tx.tai_khoan.delete({ where: { id } });
    });
  }
}
