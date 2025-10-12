import { PrismaClient } from "@prisma/client";

export class TaiKhoanRepository {
  constructor(private prisma: PrismaClient) {}

  findById(id: string) {
    return this.prisma.tai_khoan.findUnique({ where: { id } });
  }
  findByUsername(ten_dang_nhap: string) {
    return this.prisma.tai_khoan.findUnique({ where: { ten_dang_nhap } });
  }
  create(data: {
    ten_dang_nhap: string;
    mat_khau: string;
    loai_tai_khoan: string;
    trang_thai_hoat_dong?: boolean | null;
  }) {
    return this.prisma.tai_khoan.create({ data });
  }
  update(
    id: string,
    data: Partial<{ mat_khau: string; trang_thai_hoat_dong: boolean | null }>
  ) {
    return this.prisma.tai_khoan.update({ where: { id }, data });
  }
  delete(id: string) {
    return this.prisma.tai_khoan.delete({ where: { id } });
  }
}
