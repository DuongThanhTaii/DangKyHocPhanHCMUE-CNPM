import { inject, injectable } from "inversify";
import { TYPES } from "../../../infrastructure/di/types";
import { IKhoaRepository } from "../../ports/dm/repositories/IKhoaRepository";
import { INganhRepository } from "../../ports/dm/repositories/INganhRepository";
import { ICoSoRepository } from "../../ports/dm/repositories/ICoSoRepository";
import { KhoaDto } from "../../dtos/dm/KhoaDto";
import { NganhDto } from "../../dtos/dm/NganhDto";
import { CoSoDto } from "../../dtos/dm/CoSoDto";

@injectable()
export class DanhMucUseCases {
    constructor(
        @inject(TYPES.DanhMuc.IKhoaRepository) private khoaRepo: IKhoaRepository,
        @inject(TYPES.DanhMuc.INganhRepository) private nganhRepo: INganhRepository,
        @inject(TYPES.DanhMuc.ICoSoRepository) private coSoRepo: ICoSoRepository
    ) { }

    /**
     * UC1: Lấy tất cả khoa
     */
    async getAllKhoa(): Promise<KhoaDto[]> {
        return this.khoaRepo.findAll();
    }

    /**
     * UC2: Lấy tất cả ngành (có thể filter theo khoa_id)
     */
    async getAllNganh(khoaId?: string): Promise<NganhDto[]> {
        return this.nganhRepo.findAll(khoaId);
    }

    /**
     * UC3: Lấy tất cả cơ sở
     */
    async getAllCoSo(): Promise<CoSoDto[]> {
        return this.coSoRepo.findAll();
    }

    /**
     * UC4: Lấy ngành chưa có chính sách tín chỉ (cho form thêm chính sách)
     */
    async getNganhChuaCoChinhSach(hocKyId: string, khoaId: string): Promise<NganhDto[]> {
        return this.nganhRepo.findNganhChuaCoChinhSach(hocKyId, khoaId);
    }
}
