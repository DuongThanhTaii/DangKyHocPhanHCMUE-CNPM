import { injectable } from "inversify";
import { PrismaClient } from "@prisma/client";
import { IUsersRepository } from "../../../application/ports/qlSinhVienPDT/repositories/IUsersRepository";

@injectable()
export class PrismaUsersRepository implements IUsersRepository {
    constructor(private prisma: PrismaClient) { }

    async create(data: { id: string; hoTen: string; taiKhoanId: string; maNhanVien: string; email: string }) {
        const result = await this.prisma.users.create({
            data: {
                id: data.id,
                ho_ten: data.hoTen,
                tai_khoan_id: data.taiKhoanId,
                ma_nhan_vien: data.maNhanVien,
                email: data.email,
            },
        });
        return result.id;
    }

    async update(id: string, data: { hoTen?: string }) {
        await this.prisma.users.update({
            where: { id },
            data: { ho_ten: data.hoTen },
        });
    }
}
