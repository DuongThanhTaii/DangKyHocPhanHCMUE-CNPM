import { DeXuatHocPhanRequest } from "../dtos/troLyKhoaDTO";
import {
    DeXuatHocPhanForTruongKhoaDTO,
    UpdateTrangThaiByTruongKhoaRequest
} from "../dtos/truongKhoaDTO";
import { UnitOfWork } from "../repositories/unitOfWork";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";

export class DeXuatHocPhanService {
    constructor(private unitOfWork: UnitOfWork) { }

    async createDeXuatHocPhan(
        request: DeXuatHocPhanRequest,
        userId: string,
        loaiTaiKhoan: string
    ): Promise<ServiceResult<null>> {
        try {
            //step1 : lấy id + khoa_id từ trolykhoa
            const troLyKhoa = await this.unitOfWork.troLyKhoaRepository.findById(userId);
            if (!troLyKhoa) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy trợ lý khoa",
                    "TRO_LY_KHOA_NOT_FOUND"
                );
            }

            //step 2: lấy id học kì hiện hành ra
            const hocKyHienHanhID = await this.unitOfWork.hocKyRepository
                .findHocKyHienHanh()
                .then((hk) => hk?.id);

            if (!hocKyHienHanhID) {
                return ServiceResultBuilder.failure(
                    "Không có học kỳ hiện hành",
                    "HOC_KY_HIEN_HANH_NOT_FOUND"
                );
            }

            //step 3 : tạo record mới
            await this.unitOfWork.transaction(async (tx) => {
                const dataForDeXuatHocPhan = {
                    so_lop_du_kien: 1,
                    cap_duyet_hien_tai: loaiTaiKhoan,
                    trang_thai: "cho_duyet", // Thêm trạng thái mặc định
                    hoc_ky: {
                        connect: {
                            id: hocKyHienHanhID,
                        },
                    },
                    khoa: {
                        connect: {
                            id: troLyKhoa.khoa_id,
                        },
                    },
                    mon_hoc: {
                        connect: {
                            id: request.maHocPhan,
                        },
                    },
                    users: {
                        connect: {
                            id: troLyKhoa.id,
                        },
                    },
                    // Sửa từ giang_vien_de_xuat thành giang_vien relation
                    giang_vien: {
                        connect: {
                            id: request.maGiangVien,
                        },
                    },
                };

                const deXuatHP = await (tx as any).de_xuat_hoc_phan.create({
                    data: dataForDeXuatHocPhan,
                });

                //step 4 : tạo log
                const dataForDeXuatHocPhanLog = {
                    de_xuat_id: deXuatHP.id,
                    hanh_dong: "Đã tạo đề xuất",
                    nguoi_thuc_hien: troLyKhoa.id, // Sửa từ khoa_id -> id
                };

                await (tx as any).de_xuat_hoc_phan_log.create({
                    data: dataForDeXuatHocPhanLog,
                });
            });

            return ServiceResultBuilder.success(
                "Tạo thành công đề xuất học phần",
                null
            );
        } catch (error) {
            console.error("Error creating de xuat hoc phan:", error);
            return ServiceResultBuilder.failure(
                "Lỗi hệ thống khi tạo đề xuất học phần",
                "INTERNAL_ERROR"
            );
        }
    }

    async getDeXuatHocPhanForTruongKhoa(
        userId: string,
        hocKyId?: string
    ): Promise<ServiceResult<DeXuatHocPhanForTruongKhoaDTO[]>> {
        try {
            // Step 1: Lấy khoa_id từ truong_khoa
            const truongKhoa = await this.unitOfWork.truongKhoaRepository.findById(userId);
            if (!truongKhoa) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy trưởng khoa",
                    "TRUONG_KHOA_NOT_FOUND"
                );
            }

            // Step 2: Lấy học kỳ hiện hành nếu không truyền hocKyId
            let targetHocKyId = hocKyId;
            if (!targetHocKyId) {
                const hocKyHienHanh = await this.unitOfWork.hocKyRepository.findHocKyHienHanh();
                if (!hocKyHienHanh) {
                    return ServiceResultBuilder.failure(
                        "Không có học kỳ hiện hành",
                        "HOC_KY_HIEN_HANH_NOT_FOUND"
                    );
                }
                targetHocKyId = hocKyHienHanh.id;
            }

            // Step 3: Lấy đề xuất theo khoa_id và hoc_ky_id
            const deXuatList = await this.unitOfWork.deXuatHocPhanRepository.findAllWithRelations({
                khoa_id: truongKhoa.khoa_id,
                hoc_ky_id: targetHocKyId, // Luôn lọc theo học kỳ
            });

            // Step 4: Map sang DTO
            const data: DeXuatHocPhanForTruongKhoaDTO[] = deXuatList.map((item: any) => ({
                id: item.id,
                maHocPhan: item.mon_hoc?.ma_mon || "",
                tenHocPhan: item.mon_hoc?.ten_mon || "",
                soTinChi: item.mon_hoc?.so_tin_chi || 0,
                giangVien: item.giang_vien?.users?.ho_ten || "",
                trangThai: item.trang_thai || "cho_duyet",
            }));

            return ServiceResultBuilder.success(
                "Lấy danh sách đề xuất thành công",
                data
            );
        } catch (error) {
            console.error("Error getting de xuat hoc phan for truong khoa:", error);
            return ServiceResultBuilder.failure(
                "Lỗi hệ thống khi lấy danh sách đề xuất",
                "INTERNAL_ERROR"
            );
        }
    }

    // Method mới
    async updateTrangThaiByTruongKhoa(
        request: UpdateTrangThaiByTruongKhoaRequest,
        userId: string,
        loaiTaiKhoan: string
    ): Promise<ServiceResult<null>> {
        try {
            // Step 1: Kiểm tra trưởng khoa tồn tại
            const truongKhoa = await this.unitOfWork.truongKhoaRepository.findById(userId);
            if (!truongKhoa) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy trưởng khoa",
                    "TRUONG_KHOA_NOT_FOUND"
                );
            }

            // Step 2: Kiểm tra đề xuất tồn tại và thuộc khoa của trưởng khoa
            const deXuat = await this.unitOfWork.deXuatHocPhanRepository.findById(request.id);
            if (!deXuat) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy đề xuất học phần",
                    "DE_XUAT_NOT_FOUND"
                );
            }

            // Kiểm tra khoa_id có khớp không
            if (deXuat.khoa_id !== truongKhoa.khoa_id) {
                return ServiceResultBuilder.failure(
                    "Bạn không có quyền duyệt đề xuất này",
                    "FORBIDDEN"
                );
            }

            // Step 3: Cập nhật trong transaction
            await this.unitOfWork.transaction(async (tx) => {
                // Cập nhật trạng thái và cấp duyệt
                await (tx as any).de_xuat_hoc_phan.update({
                    where: { id: request.id },
                    data: {
                        trang_thai: "da_duyet_tk", // Đã duyệt bởi trưởng khoa
                        cap_duyet_hien_tai: loaiTaiKhoan, // Cấp tiếp theo (có thể là "phong_dao_tao")
                        updated_at: new Date(),
                    },
                });

                // Step 4: Tạo log
                await (tx as any).de_xuat_hoc_phan_log.create({
                    data: {
                        de_xuat_id: request.id,
                        hanh_dong: "Trưởng khoa đã duyệt",
                        nguoi_thuc_hien: truongKhoa.id,
                    },
                });
            });

            return ServiceResultBuilder.success(
                "Duyệt đề xuất học phần thành công",
                null
            );
        } catch (error) {
            console.error("Error updating trang thai by truong khoa:", error);
            return ServiceResultBuilder.failure(
                "Lỗi hệ thống khi duyệt đề xuất học phần",
                "INTERNAL_ERROR"
            );
        }
    }
}