import { UnitOfWork } from "../repositories/unitOfWork";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";
import { PhongHocDTO } from "../dtos/phongHocDTO";

export class PhongHocService {
    private uow = UnitOfWork.getInstance();

    /**
     * Lấy phòng học có sẵn (chưa được sử dụng)
     */
    async getAvailablePhongHoc(): Promise<ServiceResult<PhongHocDTO[]>> {
        try {
            const phongs = await this.uow.phongRepository.getAllAvailableRooms();

            const dtos: PhongHocDTO[] = phongs.map((p: any) => ({
                id: p.id,
                maPhong: p.ma_phong,
                tenCoSo: p.co_so.ten_co_so,
                sucChua: p.suc_chua,
            }));

            return ServiceResultBuilder.success(
                "Lấy danh sách phòng học có sẵn thành công",
                dtos
            );
        } catch (error) {
            console.error("Error getting available phong hoc:", error);
            return ServiceResultBuilder.failure(
                "Lỗi khi lấy danh sách phòng học có sẵn",
                "INTERNAL_ERROR"
            );
        }
    }

    /**
     * Lấy tất cả phòng học theo khoa ID
     */
    async getAllPhongHocByKhoaId(khoaId: string): Promise<ServiceResult<PhongHocDTO[]>> {
        try {
            const phongs = await this.uow.phongRepository.findByKhoaId(khoaId);

            const dtos: PhongHocDTO[] = phongs.map((p: any) => ({
                id: p.id,
                maPhong: p.ma_phong,
                tenCoSo: p.co_so.ten_co_so,
                sucChua: p.suc_chua,
            }));

            return ServiceResultBuilder.success(
                "Lấy danh sách phòng học theo khoa thành công",
                dtos
            );
        } catch (error) {
            console.error("Error getting phong hoc by khoa:", error);
            return ServiceResultBuilder.failure(
                "Lỗi khi lấy danh sách phòng học theo khoa",
                "INTERNAL_ERROR"
            );
        }
    }

    /**
     * Gán phòng học cho khoa
     */
    async assignRoomsToKhoa(phongHocIds: string[], khoaId: string): Promise<ServiceResult<{ count: number }>> {
        try {
            if (!phongHocIds || phongHocIds.length === 0) {
                return ServiceResultBuilder.failure(
                    "Danh sách phòng học không được rỗng",
                    "INVALID_INPUT"
                );
            }

            if (!khoaId) {
                return ServiceResultBuilder.failure(
                    "Khoa ID không được rỗng",
                    "INVALID_INPUT"
                );
            }

            const result = await this.uow.phongRepository.assignRoomsToKhoa(phongHocIds, khoaId);

            return ServiceResultBuilder.success(
                "Đã gán phòng học cho khoa thành công",
                { count: result.count }
            );
        } catch (error) {
            console.error("Error assigning rooms to khoa:", error);
            return ServiceResultBuilder.failure(
                "Lỗi khi gán phòng học cho khoa",
                "INTERNAL_ERROR"
            );
        }
    }

    /**
     * Xóa gán phòng học khỏi khoa
     */
    async unassignRoomsFromKhoa(phongHocIds: string[]): Promise<ServiceResult<{ count: number }>> {
        try {
            if (!phongHocIds || phongHocIds.length === 0) {
                return ServiceResultBuilder.failure(
                    "Danh sách phòng học không được rỗng",
                    "INVALID_INPUT"
                );
            }

            const result = await this.uow.phongRepository.unassignRoomsFromKhoa(phongHocIds);

            return ServiceResultBuilder.success(
                "Đã xóa gán phòng học thành công",
                { count: result.count }
            );
        } catch (error) {
            console.error("Error unassigning rooms from khoa:", error);
            return ServiceResultBuilder.failure(
                "Lỗi khi xóa gán phòng học",
                "INTERNAL_ERROR"
            );
        }
    }

    /**
     * Lấy phòng học theo userId của TLK (lấy từ khoa_id)
     */
    async getPhongHocByTLKUserId(userId: string): Promise<ServiceResult<PhongHocDTO[]>> {
        try {
            // Step 1: Lấy khoa_id từ tro_ly_khoa
            const troLyKhoa = await this.uow.troLyKhoaRepository.findById(userId);
            if (!troLyKhoa) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy trợ lý khoa",
                    "TRO_LY_KHOA_NOT_FOUND"
                );
            }

            // Step 2: Lấy danh sách phòng học theo khoa_id
            const phongs = await this.uow.phongRepository.findByKhoaId(troLyKhoa.khoa_id);

            const dtos: PhongHocDTO[] = phongs.map((p: any) => ({
                id: p.id,
                maPhong: p.ma_phong,
                tenCoSo: p.co_so?.ten_co_so || "",
                sucChua: p.suc_chua,
            }));

            return ServiceResultBuilder.success(
                "Lấy danh sách phòng học thành công",
                dtos
            );
        } catch (error) {
            console.error("Error getting phong hoc by TLK:", error);
            return ServiceResultBuilder.failure(
                "Lỗi khi lấy danh sách phòng học",
                "INTERNAL_ERROR"
            );
        }
    }
}