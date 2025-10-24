/**
 * DTO - Học kỳ của giảng viên
 */
export interface HocKyGVDTO {
    hoc_ky_id: string;
    ma_hoc_ky: string;
    ten_nien_khoa: string;
    start: string; // YYYY-MM-DD
    end: string;   // YYYY-MM-DD
}

/**
 * DTO - TKB theo tuần
 */
export interface TKBWeeklyItemDTO {
    thu: number;
    tiet_bat_dau: number;
    tiet_ket_thuc: number;
    phong: {
        id: string;
        ma_phong: string;
    };
    lop_hoc_phan: {
        id: string;
        ma_lop: string;
    };
    mon_hoc: {
        ma_mon: string;
        ten_mon: string;
    };
    ngay_hoc: string; // ✅ ISO date string (YYYY-MM-DD)
}

/**
 * DTO - Tiết học config
 */
export interface TietHoc {
    tiet: number;
    gioVao: string;
    gioRa: string;
    label: string;
}

/**
 * Internal type - Week item
 */
export interface WeekItem {
    index: number;
    start: string;
    end: string;
}

/**
 * Internal type - Room for rendering
 */
export interface RoomItem {
    id: string;
    ma: string;
}