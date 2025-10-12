import { DeXuatHocPhanRequest } from "../dtos/troLyKhoaDTO";
import {
    DeXuatHocPhanDTO,
    UpdateTrangThaiByTruongKhoaRequest,
    TuChoiDeXuatHocPhanRequest
} from "../dtos/truongKhoaDTO";
import { UpdateTrangThaiByPDTRequest } from "../dtos/pdtDTO";
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
                    trang_thai: "cho_duyet",
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
                    nguoi_thuc_hien: troLyKhoa.id,
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

    // Private method chung - Nhận whereCondition
    private async getDeXuatHocPhan(
        whereCondition: any,
        hocKyId?: string
    ): Promise<ServiceResult<DeXuatHocPhanDTO[]>> {
        try {
            // Step 1: Lấy học kỳ hiện hành nếu không truyền hocKyId
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

            // Step 2: Thêm hoc_ky_id vào where condition
            whereCondition.hoc_ky_id = targetHocKyId;

            // Step 3: Query với whereCondition
            const deXuatList = await this.unitOfWork.deXuatHocPhanRepository.findAllWithRelations(whereCondition);

            // Step 4: Map sang DTO
            const data: DeXuatHocPhanDTO[] = deXuatList.map((item: any) => ({
                id: item.id,
                maHocPhan: item.mon_hoc?.ma_mon || "",
                tenHocPhan: item.mon_hoc?.ten_mon || "",
                soTinChi: item.mon_hoc?.so_tin_chi || 0,
                giangVien: item.giang_vien?.users?.ho_ten || "",
                trangThai: item.trang_thai || "",
            }));

            return ServiceResultBuilder.success(
                "Lấy danh sách đề xuất thành công",
                data
            );
        } catch (error) {
            console.error("Error getting de xuat hoc phan:", error);
            return ServiceResultBuilder.failure(
                "Lỗi hệ thống khi lấy danh sách đề xuất",
                "INTERNAL_ERROR"
            );
        }
    }

    // Wrapper cho Trợ Lý Khoa - Lấy tất cả đề xuất của khoa
    async getDeXuatHocPhanForTroLyKhoa(
        userId: string,
        hocKyId?: string
    ): Promise<ServiceResult<DeXuatHocPhanDTO[]>> {
        try {
            // Lấy khoa_id từ tro_ly_khoa
            const troLyKhoa = await this.unitOfWork.troLyKhoaRepository.findById(userId);
            if (!troLyKhoa) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy trợ lý khoa",
                    "TRO_LY_KHOA_NOT_FOUND"
                );
            }

            // Gọi private method - Không filter trang_thai, lấy hết
            return this.getDeXuatHocPhan(
                {
                    khoa_id: troLyKhoa.khoa_id
                    // Không có trang_thai filter
                },
                hocKyId
            );
        } catch (error) {
            console.error("Error getting de xuat hoc phan for tro ly khoa:", error);
            return ServiceResultBuilder.failure(
                "Lỗi hệ thống khi lấy danh sách đề xuất",
                "INTERNAL_ERROR"
            );
        }
    }

    // Wrapper cho Trưởng Khoa
    async getDeXuatHocPhanForTruongKhoa(
        userId: string,
        hocKyId?: string
    ): Promise<ServiceResult<DeXuatHocPhanDTO[]>> {
        try {
            // Lấy khoa_id từ truong_khoa
            const truongKhoa = await this.unitOfWork.truongKhoaRepository.findById(userId);
            if (!truongKhoa) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy trưởng khoa",
                    "TRUONG_KHOA_NOT_FOUND"
                );
            }

            // Gọi private method với where condition
            return this.getDeXuatHocPhan(
                {
                    khoa_id: truongKhoa.khoa_id,
                    trang_thai: "cho_duyet"
                },
                hocKyId
            );
        } catch (error) {
            console.error("Error getting de xuat hoc phan for truong khoa:", error);
            return ServiceResultBuilder.failure(
                "Lỗi hệ thống khi lấy danh sách đề xuất",
                "INTERNAL_ERROR"
            );
        }
    }

    // Wrapper cho PDT
    async getDeXuatHocPhanForPDT(
        hocKyId?: string
    ): Promise<ServiceResult<DeXuatHocPhanDTO[]>> {
        // Gọi private method - không filter theo khoa_id, chỉ filter trang_thai
        return this.getDeXuatHocPhan(
            {
                trang_thai: "da_duyet_tk"
            },
            hocKyId
        );
    }

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
                        trang_thai: "da_duyet_tk",
                        cap_duyet_hien_tai: loaiTaiKhoan,
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

    async updateTrangThaiByPhongDaoTao(
        request: UpdateTrangThaiByPDTRequest,
        userId: string,
        loaiTaiKhoan: string
    ): Promise<ServiceResult<null>> {
        try {
            // Step 1: Kiểm tra đề xuất tồn tại
            const deXuat = await this.unitOfWork.deXuatHocPhanRepository.findById(request.id);
            if (!deXuat) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy đề xuất học phần",
                    "DE_XUAT_NOT_FOUND"
                );
            }

            // Step 2: Kiểm tra trạng thái (phải đã duyệt TK)
            if (deXuat.trang_thai !== "da_duyet_tk") {
                return ServiceResultBuilder.failure(
                    "Đề xuất chưa được trưởng khoa duyệt",
                    "INVALID_STATUS"
                );
            }

            // Step 3: Lấy học kỳ hiện hành
            const hocKyHienHanh = await this.unitOfWork.hocKyRepository.findHocKyHienHanh();
            if (!hocKyHienHanh) {
                return ServiceResultBuilder.failure(
                    "Không có học kỳ hiện hành",
                    "HOC_KY_HIEN_HANH_NOT_FOUND"
                );
            }

            // Step 4: Transaction - Update đề xuất và tạo học phần
            await this.unitOfWork.transaction(async (tx) => {
                // 4.1: Tạo học phần mới
                await (tx as any).hoc_phan.create({
                    data: {
                        mon_hoc_id: deXuat.mon_hoc_id,
                        ten_hoc_phan: deXuat.mon_hoc_id,
                        trang_thai_mo: true,
                        id_hoc_ky: hocKyHienHanh.id,
                    },
                });

                // 4.2: Update trạng thái đề xuất (giữ lại record)
                await (tx as any).de_xuat_hoc_phan.update({
                    where: { id: request.id },
                    data: {
                        trang_thai: "da_duyet_pdt",
                        cap_duyet_hien_tai: loaiTaiKhoan, // "phong_dao_tao"
                        updated_at: new Date(),
                    },
                });

                // 4.3: Tạo log
                await (tx as any).de_xuat_hoc_phan_log.create({
                    data: {
                        de_xuat_id: request.id,
                        hanh_dong: "PDT đã duyệt",
                        nguoi_thuc_hien: userId,
                    },
                });
            });

            return ServiceResultBuilder.success(
                "Duyệt đề xuất và tạo học phần thành công",
                null
            );
        } catch (error) {
            console.error("Error updating trang thai by phong dao tao:", error);
            return ServiceResultBuilder.failure(
                "Lỗi hệ thống khi duyệt đề xuất học phần",
                "INTERNAL_ERROR"
            );
        }
    }

    // Method chung cho TK và PDT - Từ chối đề xuất
    async tuChoiDeXuatHocPhan(
        request: TuChoiDeXuatHocPhanRequest,
        userId: string,
        loaiTaiKhoan: string
    ): Promise<ServiceResult<null>> {
        try {
            // Step 1: Kiểm tra đề xuất tồn tại
            const deXuat = await this.unitOfWork.deXuatHocPhanRepository.findById(request.id);
            if (!deXuat) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy đề xuất học phần",
                    "DE_XUAT_NOT_FOUND"
                );
            }

            // Step 2: Validate quyền từ chối theo role
            if (loaiTaiKhoan === "truong_khoa") {
                // TK chỉ từ chối đề xuất của khoa mình
                const truongKhoa = await this.unitOfWork.truongKhoaRepository.findById(userId);
                if (!truongKhoa) {
                    return ServiceResultBuilder.failure(
                        "Không tìm thấy trưởng khoa",
                        "TRUONG_KHOA_NOT_FOUND"
                    );
                }
                if (deXuat.khoa_id !== truongKhoa.khoa_id) {
                    return ServiceResultBuilder.failure(
                        "Bạn không có quyền từ chối đề xuất này",
                        "FORBIDDEN"
                    );
                }
            }
            // PDT có thể từ chối bất kỳ đề xuất nào

            // Step 3: Cập nhật trong transaction
            await this.unitOfWork.transaction(async (tx) => {
                // Đẩy về trạng thái chờ duyệt
                await (tx as any).de_xuat_hoc_phan.update({
                    where: { id: request.id },
                    data: {
                        trang_thai: "tu_choi",
                        cap_duyet_hien_tai: "tro_ly_khoa",
                        updated_at: new Date(),
                    },
                });

                // Tạo log
                const hanhDong = loaiTaiKhoan === "truong_khoa"
                    ? "TK từ chối"
                    : "PDT từ chối";

                await (tx as any).de_xuat_hoc_phan_log.create({
                    data: {
                        de_xuat_id: request.id,
                        hanh_dong: hanhDong,
                        nguoi_thuc_hien: userId,
                    },
                });
            });

            return ServiceResultBuilder.success(
                "Từ chối đề xuất học phần thành công",
                null
            );
        } catch (error) {
            console.error("Error tu choi de xuat hoc phan:", error);
            return ServiceResultBuilder.failure(
                "Lỗi hệ thống khi từ chối đề xuất học phần",
                "INTERNAL_ERROR"
            );
        }
    }
}