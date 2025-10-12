import { PrismaClient } from "@prisma/client";

export class UsersRepository {
  constructor(private prisma: PrismaClient) {}

  findById(id: string) {
    return this.prisma.users.findUnique({ where: { id } });
  }
  create(data: { ho_ten: string; tai_khoan_id: string }) {
    return this.prisma.users.create({ data });
  }
  update(id: string, data: Partial<{ ho_ten: string }>) {
    return this.prisma.users.update({ where: { id }, data });
  }
  delete(id: string) {
    return this.prisma.users.delete({ where: { id } });
  }
}
