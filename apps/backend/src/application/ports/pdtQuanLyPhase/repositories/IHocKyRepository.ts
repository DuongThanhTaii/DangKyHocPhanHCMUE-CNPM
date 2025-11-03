export interface IHocKyRepository {
    /**
     * Lấy học kỳ hiện hành
     */
    findHocKyHienHanh(): Promise<{ id: string; ten_hoc_ky: string } | null>;
}
