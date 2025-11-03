export interface HocKyItemDTO {
    id: string;
    tenHocKy: string;
    maHocKy: string;
    // ✅ FIX: Change to `Date | null` to match Prisma schema
    ngayBatDau?: Date | null;
    ngayKetThuc?: Date | null;
}

export interface HocKyNienKhoaOutputDTO {
    nienKhoaId: string;
    tenNienKhoa: string;
    hocKy: HocKyItemDTO[];
}
