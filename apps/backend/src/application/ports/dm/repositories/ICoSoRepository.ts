import { CoSoDto } from "../../../dtos/dm/CoSoDto";

export interface ICoSoRepository {
    /**
     * Lấy tất cả cơ sở
     */
    findAll(): Promise<CoSoDto[]>;
}
