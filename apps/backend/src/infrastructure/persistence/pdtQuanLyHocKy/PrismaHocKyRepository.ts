import { PrismaClient, Prisma } from "@prisma/client";
import { IHocKyRepository } from "../../../application/ports/pdtQuanLyHocKy/repositories/IHocKyRepository";
import { HocKy } from "../../../domain/entities/HocKy.entity";

export class PrismaHocKyRepository implements IHocKyRepository {
    constructor(private db: PrismaClient | Prisma.TransactionClient) { }

    async findById(id: string): Promise<HocKy | null> {
        const record = await this.db.hoc_ky.findUnique({
            where: { id },
        });

        return record ? this.toDomain(record) : null;
    }

    async findHienHanh(): Promise<HocKy | null> {
        const record = await this.db.hoc_ky.findFirst({
            where: { trang_thai_hien_tai: true },
        });

        return record ? this.toDomain(record) : null;
    }

    async setHienHanh(hocKyId: string): Promise<void> {
        await this.db.hoc_ky.update({
            where: { id: hocKyId },
            data: { trang_thai_hien_tai: true, updated_at: new Date() },
        });
    }

    async unsetAllHienHanh(): Promise<void> {
        await this.db.hoc_ky.updateMany({
            where: { trang_thai_hien_tai: true },
            data: { trang_thai_hien_tai: false, updated_at: new Date() },
        });
    }

    private toDomain(record: any): HocKy {
        return HocKy.fromPersistence({
            id: record.id,
            tenHocKy: record.ten_hoc_ky,
            maHocKy: record.ma_hoc_ky,
            nienKhoaId: record.id_nien_khoa,
            ngayBatDau: record.ngay_bat_dau,
            ngayKetThuc: record.ngay_ket_thuc,
            trangThaiHienTai: record.trang_thai_hien_tai || false,
        });
    }
}
