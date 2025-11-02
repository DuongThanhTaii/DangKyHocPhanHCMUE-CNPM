export interface OverviewOutputDTO {
    svUnique: number;
    soDangKy: number;
    soLopHocPhan: number;
    taiChinh: {
        thuc_thu: number;
        ky_vong: number;
    };
    ketLuan: string;
}

export interface KhoaOutputDTO {
    data: Array<{
        ten_khoa: string;
        so_dang_ky: number;
    }>;
    ketLuan: string;
}

export interface NganhOutputDTO {
    data: Array<{
        ten_nganh: string;
        so_dang_ky: number;
    }>;
    ketLuan: string;
}

export interface GiangVienOutputDTO {
    data: Array<{
        ho_ten: string;
        so_lop: number;
    }>;
    ketLuan: string;
}
