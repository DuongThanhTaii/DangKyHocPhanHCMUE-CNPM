/**
 * DTO response - Thông tin phòng học
 */
export interface PhongHocDTO {
    id: string;
    maPhong: string;
    tenCoSo: string;
    sucChua: number;
}

/**
 * Query filter
 */
export interface GetPhongHocQuery {
    coSoId?: string;
}