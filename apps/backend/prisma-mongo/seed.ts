import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

async function upsertAccountWithUser(params: {
  username: string;
  role:
    | "phong_dao_tao"
    | "truong_khoa"
    | "tro_ly_khoa"
    | "giang_vien"
    | "sinh_vien";
  fullName: string;
  employeeCode?: string | null;
}) {
  const passHash = await hashPassword("123456");

  // 1) Upsert tài_khoản theo username (có UNIQUE)
  const tk = await prisma.tai_khoan.upsert({
    where: { ten_dang_nhap: params.username },
    update: {},
    create: {
      ten_dang_nhap: params.username,
      mat_khau: passHash,
      loai_tai_khoan: params.role,
      trang_thai_hoat_dong: true,
    },
  });

  // 2) Tìm users theo tai_khoan_id (KHÔNG unique nên không upsert được)
  const exist = await prisma.users.findFirst({
    where: { tai_khoan_id: tk.id },
  });

  if (exist) {
    await prisma.users.update({
      where: { id: exist.id },
      data: {
        ho_ten: params.fullName,
        ma_nhan_vien: params.employeeCode ?? null,
      },
    });
  } else {
    await prisma.users.create({
      data: {
        ho_ten: params.fullName,
        ma_nhan_vien: params.employeeCode ?? null,
        tai_khoan_id: tk.id,
      },
    });
  }
}

async function main() {
  await upsertAccountWithUser({
    username: "pdt001",
    role: "phong_dao_tao",
    fullName: "PĐT 001",
    employeeCode: "PDT001",
  });

  await upsertAccountWithUser({
    username: "sv001",
    role: "sinh_vien",
    fullName: "Sinh Viên 001",
  });

  console.log("Seed done");
}

main().finally(() => prisma.$disconnect());
