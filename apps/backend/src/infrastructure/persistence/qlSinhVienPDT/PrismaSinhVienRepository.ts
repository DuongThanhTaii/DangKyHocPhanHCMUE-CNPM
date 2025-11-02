import { PrismaClient, Prisma } from "@prisma/client";
import { ISinhVienRepository, PageParams, PageResult } from "../../../application/ports/qlSinhVienPDT/repositories/ISinhVienRepository";
import { SinhVien } from "../../../domain/entities/SinhVien.entity";

export class PrismaSinhVienRepository implements ISinhVienRepository {
    constructor(
        private db: PrismaClient | Prisma.TransactionClient
    ) { }

    async findById(id: string): Promise<SinhVien | null> {
        const record = await this.db.sinh_vien.findUnique({
            where: { id },
            include: {
                users: true,
                khoa: true,
                nganh_hoc: true,
            },
        });

        return record ? this.toDomain(record) : null;
    }

    async findByMssv(mssv: string): Promise<SinhVien | null> {
        const record = await this.db.sinh_vien.findUnique({
            where: { ma_so_sinh_vien: mssv },
        });

        return record ? this.toDomain(record) : null;
    }

    async findPaged(params: PageParams): Promise<PageResult<SinhVien>> {
        const { page, pageSize, search } = params;
        const skip = (page - 1) * pageSize;

        const where: Prisma.sinh_vienWhereInput = search
            ? {
                OR: [
                    { ma_so_sinh_vien: { contains: search, mode: "insensitive" } },
                    { users: { ho_ten: { contains: search, mode: "insensitive" } } },
                ],
            }
            : {};

        const [records, total] = await Promise.all([
            this.db.sinh_vien.findMany({
                where,
                skip,
                take: pageSize,
                include: {
                    users: true,
                    khoa: true,
                    nganh_hoc: true,
                },
                orderBy: { ma_so_sinh_vien: "desc" },
            }),
            this.db.sinh_vien.count({ where }),
        ]);

        return {
            items: records.map((r) => this.toDomain(r)),
            total,
            page,
            pageSize,
        };
    }

    async create(sinhVien: SinhVien): Promise<void> {
        await this.db.sinh_vien.create({
            data: {
                id: sinhVien.id,
                ma_so_sinh_vien: sinhVien.maSoSinhVien,
                khoa_id: sinhVien.khoaId,
                lop: sinhVien.lop,
                khoa_hoc: sinhVien.khoaHoc,
                ngay_nhap_hoc: sinhVien.ngayNhapHoc,
                nganh_id: sinhVien.nganhId,
            },
        });
    }

    async update(sinhVien: SinhVien): Promise<void> {
        await this.db.sinh_vien.update({
            where: { id: sinhVien.id },
            data: {
                ma_so_sinh_vien: sinhVien.maSoSinhVien,
                khoa_id: sinhVien.khoaId,
                lop: sinhVien.lop,
                khoa_hoc: sinhVien.khoaHoc,
                ngay_nhap_hoc: sinhVien.ngayNhapHoc,
                nganh_id: sinhVien.nganhId,
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.db.sinh_vien.delete({ where: { id } });
    }

    private toDomain(record: any): SinhVien {
        return SinhVien.fromPersistence({
            id: record.id,
            maSoSinhVien: record.ma_so_sinh_vien,
            hoTen: record.users?.ho_ten || "",
            khoaId: record.khoa_id,
            nganhId: record.nganh_id,
            lop: record.lop,
            khoaHoc: record.khoa_hoc,
            ngayNhapHoc: record.ngay_nhap_hoc,
        });
    }
}
