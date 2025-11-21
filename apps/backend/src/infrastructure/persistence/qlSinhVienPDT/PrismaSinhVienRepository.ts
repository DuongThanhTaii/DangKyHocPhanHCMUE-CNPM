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
                users: {
                    include: {
                        tai_khoan: true,
                    },
                },
                khoa: true,
                nganh_hoc: true,
            },
        });

        return record ? this.toDomain(record) : null;
    }

    async findByMssv(mssv: string): Promise<SinhVien | null> {
        const record = await this.db.sinh_vien.findUnique({
            where: { ma_so_sinh_vien: mssv },
            include: {
                users: {
                    include: {
                        tai_khoan: true,
                    },
                },
                khoa: true,
                nganh_hoc: true,
            },
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
                    { lop: { contains: search, mode: "insensitive" } },
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
                    users: {
                        include: {
                            tai_khoan: true,
                        },
                    },
                    khoa: true,
                    nganh_hoc: true,
                },
                orderBy: { users: { created_at: "desc" } },
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

    // ✅ Thêm method update ho_ten
    async updateUserName(userId: string, hoTen: string): Promise<void> {
        await this.db.users.update({
            where: { id: userId },
            data: { ho_ten: hoTen },
        });
    }

    async delete(id: string): Promise<void> {
        await this.db.sinh_vien.delete({ where: { id } });
    }

    async getAllSinhVien(
        page: number = 1,
        limit: number = 20,
        searchTerm?: string,
        khoa_id?: string,
        nganh_id?: string
    ): Promise<{ items: SinhVien[]; total: number }> {
        const skip = (page - 1) * limit;

        const whereClause: any = {
            users: {
                tai_khoan: {
                    trang_thai_hoat_dong: true,
                },
            },
        };

        if (searchTerm) {
            whereClause.OR = [
                { ma_so_sinh_vien: { contains: searchTerm, mode: "insensitive" } },
                { users: { ho_ten: { contains: searchTerm, mode: "insensitive" } } },
            ];
        }

        if (khoa_id) {
            whereClause.khoa_id = khoa_id;
        }

        if (nganh_id) {
            whereClause.nganh_id = nganh_id;
        }

        const [items, total] = await Promise.all([
            this.db.sinh_vien.findMany({
                where: whereClause,
                skip,
                take: limit,
                include: {
                    users: {
                        include: {
                            tai_khoan: true,
                        },
                    },
                    khoa: true,
                    nganh_hoc: true,
                },
                orderBy: {
                    ma_so_sinh_vien: "asc",
                },
            }),
            this.db.sinh_vien.count({ where: whereClause }),
        ]);

        return {
            items: items.map((record) => this.toDomain(record)),
            total,
        };
    }

    private toDomain(record: any): SinhVien {
        return SinhVien.fromPersistence({
            id: record.id,
            maSoSinhVien: record.ma_so_sinh_vien,
            hoTen: record.users?.ho_ten || "",
            tenKhoa: record.khoa?.ten_khoa || "",
            tenNganh: record.nganh_hoc?.ten_nganh || "",
            khoaId: record.khoa_id,
            nganhId: record.nganh_id,
            lop: record.lop,
            khoaHoc: record.khoa_hoc,
            ngayNhapHoc: record.ngay_nhap_hoc,
            trangThaiHoatDong: record.users?.tai_khoan?.trang_thai_hoat_dong ?? true,
            // ✅ Add tai_khoan_id
            taiKhoanId: record.users?.tai_khoan_id,
        });
    }
}
