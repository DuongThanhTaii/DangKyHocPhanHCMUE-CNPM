import { KhoaDto } from "../../../dtos/dm/KhoaDto";

export interface IKhoaRepository {
    /**
     * Lấy tất cả khoa
     */
    findAll(): Promise<KhoaDto[]>;
}
