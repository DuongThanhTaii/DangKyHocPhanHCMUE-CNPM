import { PrismaClient, Prisma } from "@prisma/client";
import { IUsersRepository, CreateUserData } from "../../../application/ports/qlSinhVienPDT/repositories/IUsersRepository";

export class PrismaUsersRepository implements IUsersRepository {
    constructor(private db: PrismaClient | Prisma.TransactionClient) { }

    async findById(id: string): Promise<{ id: string; taiKhoanId: string } | null> {
        const record = await this.db.users.findUnique({
            where: { id },
            select: { id: true, tai_khoan_id: true },
        });

        // ✅ Fix: Handle nullable tai_khoan_id
        if (!record || !record.tai_khoan_id) return null;

        return { id: record.id, taiKhoanId: record.tai_khoan_id };
    }

    async create(data: CreateUserData): Promise<string> {
        const record = await this.db.users.create({
            data: {
                id: data.id,
                ho_ten: data.hoTen,
                tai_khoan_id: data.taiKhoanId,
                ma_nhan_vien: data.maNhanVien,
                email: data.email,
            },
        });
        return record.id;
    }

    async update(id: string, data: { hoTen?: string }): Promise<void> {
        if (data.hoTen) {
            await this.db.users.update({
                where: { id },
                data: { ho_ten: data.hoTen },
            });
        }
    }
}
