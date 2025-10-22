import { ThoiKhoaBieuRepository } from "../repositories/mongo/thoiKhoaBieuRepository";
import { UnitOfWork } from "../repositories/unitOfWork";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";
import type { DanhSachLop } from "../../node_modules/.prisma/client-mongo";
import { ThoiKhoaBieuMonHocDTO, XepTKBRequest } from "../dtos/thoiKhoaBieuDTO";


export class ThoiKhoaBieuService {
    private tkbRepo = new ThoiKhoaBieuRepository();
    private uow = UnitOfWork.getInstance();

    /**
     * Xếp thời khóa biểu cho môn học
     */
    async xepThoiKhoaBieu(
        userId: string,
        request: XepTKBRequest
    ): Promise<ServiceResult<any>> {
        try {
            // Step 1: Verify trợ lý khoa
            const troLyKhoa = await this.uow.troLyKhoaRepository.findById(userId);
            if (!troLyKhoa) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy trợ lý khoa",
                    "TRO_LY_KHOA_NOT_FOUND"
                );
            }

            // Step 2: Tạo TKB trong MongoDB
            const danhSachLop: DanhSachLop[] = request.danhSachLop.map(lop => ({
                tenLop: lop.tenLop,
                phongHocId: lop.phongHocId,
                ngayBatDau: new Date(lop.ngayBatDau),
                ngayKetThuc: new Date(lop.ngayKetThuc),
                tietBatDau: lop.tietBatDau,
                tietKetThuc: lop.tietKetThuc,
                thuTrongTuan: lop.thuTrongTuan,
            }));

            const result = await this.tkbRepo.createTKBMonHoc(
                request.maHocPhan,
                request.hocKyId,
                danhSachLop
            );

            // Step 3: Mark phòng học đã được sử dụng
            const phongIds = request.danhSachLop.map(lop => lop.phongHocId);
            await this.uow.phongRepository.markRoomsAsUsed(phongIds);

            return ServiceResultBuilder.success(
                "Xếp thời khóa biểu thành công",
                result
            );
        } catch (error) {
            console.error("Error xep thoi khoa bieu:", error);
            return ServiceResultBuilder.failure(
                "Lỗi khi xếp thời khóa biểu",
                "INTERNAL_ERROR"
            );
        }
    }

    /**
     * Lấy TKB theo mã học phần và học kỳ
     */
    async getTKBByMaHocPhan(
        maHocPhan: string,
        hocKyId: string
    ): Promise<ServiceResult<ThoiKhoaBieuMonHocDTO>> {
        try {
            const tkb = await this.tkbRepo.findByMaHocPhanAndHocKy(maHocPhan, hocKyId);

            if (!tkb) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy thời khóa biểu",
                    "TKB_NOT_FOUND"
                );
            }

            const phongHocIds = tkb.danhSachLop.map((lop: any) => lop.phongHocId).filter(Boolean);
            const phongMap = await this.uow.phongRepository.getTenPhongByIds(phongHocIds);

            const dto: ThoiKhoaBieuMonHocDTO = {
                id: tkb.id,
                maHocPhan: tkb.maHocPhan,
                danhSachLop: tkb.danhSachLop.map((lop: any) => ({
                    tenLop: lop.tenLop,
                    phongHoc: lop.phongHocId ? phongMap.get(lop.phongHocId) : undefined,
                    phongHocId: lop.phongHocId,
                    ngayBatDau: lop.ngayBatDau,
                    ngayKetThuc: lop.ngayKetThuc,
                    tietBatDau: lop.tietBatDau,
                    tietKetThuc: lop.tietKetThuc,
                    thuTrongTuan: lop.thuTrongTuan,
                })),
            };

            return ServiceResultBuilder.success(
                "Lấy thời khóa biểu thành công",
                dto
            );
        } catch (error) {
            console.error("Error getting TKB:", error);
            return ServiceResultBuilder.failure(
                "Lỗi khi lấy thời khóa biểu",
                "INTERNAL_ERROR"
            );
        }
    }

    /**
     * Lấy tất cả TKB của học kỳ
     */
    async getTKBByHocKy(hocKyId: string): Promise<ServiceResult<ThoiKhoaBieuMonHocDTO[]>> {
        try {
            const tkbList = await this.tkbRepo.findByHocKy(hocKyId);

            const allPhongIds = tkbList
                .flatMap((tkb: any) => tkb.danhSachLop.map((lop: any) => lop.phongHocId))
                .filter(Boolean);

            const phongMap = await this.uow.phongRepository.getTenPhongByIds(allPhongIds);

            const dtos: ThoiKhoaBieuMonHocDTO[] = tkbList.map((tkb: any) => ({
                id: tkb.id,
                maHocPhan: tkb.maHocPhan,
                danhSachLop: tkb.danhSachLop.map((lop: any) => ({
                    tenLop: lop.tenLop,
                    phongHoc: lop.phongHocId ? phongMap.get(lop.phongHocId) : undefined,
                    phongHocId: lop.phongHocId,
                    ngayBatDau: lop.ngayBatDau,
                    ngayKetThuc: lop.ngayKetThuc,
                    tietBatDau: lop.tietBatDau,
                    tietKetThuc: lop.tietKetThuc,
                    thuTrongTuan: lop.thuTrongTuan,
                })),
            }));

            return ServiceResultBuilder.success(
                "Lấy danh sách thời khóa biểu thành công",
                dtos
            );
        } catch (error) {
            console.error("Error getting TKB by hoc ky:", error);
            return ServiceResultBuilder.failure(
                "Lỗi khi lấy danh sách thời khóa biểu",
                "INTERNAL_ERROR"
            );
        }
    }

    /**
     * Lấy nhiều TKB theo list mã học phần và học kỳ
     */
    async getTKBByMaHocPhans(
        maHocPhans: string[],
        hocKyId: string
    ): Promise<ServiceResult<ThoiKhoaBieuMonHocDTO[]>> {
        try {
            const tkbList = await this.tkbRepo.findByMaHocPhans(maHocPhans, hocKyId);

            const allPhongIds = tkbList
                .flatMap((tkb: any) => tkb.danhSachLop.map((lop: any) => lop.phongHocId))
                .filter(Boolean);

            const phongMap = await this.uow.phongRepository.getTenPhongByIds(allPhongIds);

            const dtos: ThoiKhoaBieuMonHocDTO[] = tkbList.map((tkb: any) => ({
                id: tkb.id,
                maHocPhan: tkb.maHocPhan,
                danhSachLop: tkb.danhSachLop.map((lop: any) => ({
                    tenLop: lop.tenLop,
                    phongHoc: lop.phongHocId ? phongMap.get(lop.phongHocId) : undefined,
                    phongHocId: lop.phongHocId,
                    ngayBatDau: lop.ngayBatDau,
                    ngayKetThuc: lop.ngayKetThuc,
                    tietBatDau: lop.tietBatDau,
                    tietKetThuc: lop.tietKetThuc,
                    thuTrongTuan: lop.thuTrongTuan,
                })),
            }));

            return ServiceResultBuilder.success(
                "Lấy danh sách thời khóa biểu thành công",
                dtos
            );
        } catch (error) {
            console.error("Error getting TKB by ma hoc phans:", error);
            return ServiceResultBuilder.failure(
                "Lỗi khi lấy danh sách thời khóa biểu",
                "INTERNAL_ERROR"
            );
        }
    }
}
