import { NganhDto } from "../../../dtos/dm/NganhDto";

export interface INganhRepository {
    /**
     * Lấy tất cả ngành (có thể filter theo khoa_id)
     */
    findAll(khoaId?: string): Promise<NganhDto[]>;

    /**
     * Lấy ngành chưa có chính sách tín chỉ trong học kỳ
     */
    findNganhChuaCoChinhSach(hocKyId: string, khoaId: string): Promise<NganhDto[]>;
}
