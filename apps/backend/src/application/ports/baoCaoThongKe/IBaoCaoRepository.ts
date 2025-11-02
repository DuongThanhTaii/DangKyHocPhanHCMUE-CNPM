export interface OverviewStatsData {
    svUnique: number;
    soDangKy: number;
    soLopHocPhan: number;
    thucThu: number;
    kyVong: number;
}

export interface KhoaStatsData {
    khoaId: string;
    tenKhoa: string;
    soDangKy: number;
}

export interface NganhStatsData {
    nganhId: string;
    tenNganh: string;
    soDangKy: number;
}

export interface GiangVienStatsData {
    giangVienId: string;
    hoTen: string;
    soLop: number;
}

export interface IBaoCaoRepository {
    getOverviewStats(hocKyId: string, khoaId?: string, nganhId?: string): Promise<OverviewStatsData>;
    getDangKyByKhoa(hocKyId: string): Promise<KhoaStatsData[]>;
    getDangKyByNganh(hocKyId: string, khoaId?: string): Promise<NganhStatsData[]>;
    getTaiGiangVien(hocKyId: string, khoaId?: string): Promise<GiangVienStatsData[]>;
}

export const IBaoCaoRepository = Symbol.for("BaoCaoThongKe.IBaoCaoRepository");
