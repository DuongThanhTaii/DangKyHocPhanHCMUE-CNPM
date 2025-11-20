import { UnitOfWork } from "../repositories/unitOfWork";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";
import { DotDangKyResponseDTO, UpdateDotDangKyRequest } from "../dtos/dotDangKyDTO";
import { UpdateDotGhiDanhRequest, DotGhiDanhResponseDTO } from "../dtos/dotDangKyDTO";

export class DotDangKyService {
    constructor(private unitOfWork: UnitOfWork) { }

    /**
     * Lấy tất cả đợt đăng ký theo học kỳ
     * @param hocKyId - ID của học kỳ
     */
    async getAllDotDangKyByHocKy(
        hocKyId: string
    ): Promise<ServiceResult<DotDangKyResponseDTO[]>> {
        try {
            const result = await this.unitOfWork.dotDangKyRepository.findByHocKy(hocKyId);

            const dtos: DotDangKyResponseDTO[] = result.map((dot: any) => ({
                id: dot.id,
                hocKyId: dot.hoc_ky_id,
                loaiDot: dot.loai_dot,
                thoiGianBatDau: dot.thoi_gian_bat_dau.toISOString(),
                thoiGianKetThuc: dot.thoi_gian_ket_thuc.toISOString(),
                hanHuyDen: dot.han_huy_den ? dot.han_huy_den.toISOString() : null,
                isCheckToanTruong: dot.is_check_toan_truong,
                khoaId: dot.khoa_id,
                tenKhoa: dot.khoa?.ten_khoa || null,
                gioiHanTinChi: dot.gioi_han_tin_chi || 9999,
            }));

            return ServiceResultBuilder.success(
                "Lấy danh sách đợt đăng ký thành công",
                dtos
            );
        } catch (error) {
            console.error("Error getAllDotDangKyByHocKy:", error);
            return ServiceResultBuilder.failure(
                "Lỗi khi lấy danh sách đợt đăng ký",
                "INTERNAL_ERROR"
            );
        }
    }

    /**
     * Lấy đợt đăng ký học phần theo học kỳ
     */
    async getDotDangKyByHocKy(hocKyId: string): Promise<ServiceResult<DotDangKyResponseDTO[]>> {
        try {
            const dots = await this.unitOfWork.dotDangKyRepository.findByHocKyAndLoai(hocKyId, "dang_ky");

            const dtos: DotDangKyResponseDTO[] = dots.map((dot: any) => ({
                id: dot.id,
                hocKyId: dot.hoc_ky_id,
                loaiDot: dot.loai_dot,
                thoiGianBatDau: dot.thoi_gian_bat_dau.toISOString(),
                thoiGianKetThuc: dot.thoi_gian_ket_thuc.toISOString(),
                hanHuyDen: dot.han_huy_den ? dot.han_huy_den.toISOString() : null,
                isCheckToanTruong: dot.is_check_toan_truong,
                khoaId: dot.khoa_id,
                tenKhoa: dot.khoa?.ten_khoa || null,
                gioiHanTinChi: dot.gioi_han_tin_chi || 9999,
            }));

            return ServiceResultBuilder.success(
                "Lấy danh sách đợt đăng ký thành công",
                dtos
            );
        } catch (error) {
            console.error("Error getting dot dang ky:", error);
            return ServiceResultBuilder.failure(
                "Lỗi khi lấy danh sách đợt đăng ký",
                "INTERNAL_ERROR"
            );
        }
    }

    /**
     * [PRIVATE] Hàm base chung cho update đợt (ghi_danh hoặc dang_ky)
     */
    private async updateDotBase(
        loaiDot: "ghi_danh" | "dang_ky",
        request: UpdateDotGhiDanhRequest | UpdateDotDangKyRequest
    ): Promise<ServiceResult<DotDangKyResponseDTO[]>> {
        try {
            // Validate input
            if (!request.hocKyId) {
                return ServiceResultBuilder.failure(
                    "Thông tin học kỳ không được để trống",
                    "INVALID_INPUT"
                );
            }

            // Kiểm tra học kỳ tồn tại
            const hocKy = await this.unitOfWork.hocKyRepository.findById(request.hocKyId);
            if (!hocKy) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy học kỳ",
                    "HOC_KY_NOT_FOUND"
                );
            }

            // Validate theo từng trường hợp
            if (request.isToanTruong) {
                if (!request.thoiGianBatDau || !request.thoiGianKetThuc) {
                    return ServiceResultBuilder.failure(
                        "Thời gian bắt đầu và kết thúc không được để trống",
                        "INVALID_TIME_RANGE"
                    );
                }

                const startAt = new Date(request.thoiGianBatDau);
                const endAt = new Date(request.thoiGianKetThuc);

                if (startAt >= endAt) {
                    return ServiceResultBuilder.failure(
                        "Thời gian bắt đầu phải trước thời gian kết thúc",
                        "INVALID_TIME_RANGE"
                    );
                }
            } else {
                if (!request.dotTheoKhoa || request.dotTheoKhoa.length === 0) {
                    return ServiceResultBuilder.failure(
                        "Danh sách đợt theo khoa không được để trống",
                        "INVALID_KHOA_LIST"
                    );
                }

                // Validate từng đợt theo khoa
                for (const dot of request.dotTheoKhoa) {
                    if (!dot.khoaId || !dot.thoiGianBatDau || !dot.thoiGianKetThuc) {
                        return ServiceResultBuilder.failure(
                            "Thông tin đợt theo khoa không đầy đủ",
                            "INVALID_KHOA_DOT"
                        );
                    }

                    const startAt = new Date(dot.thoiGianBatDau);
                    const endAt = new Date(dot.thoiGianKetThuc);

                    if (startAt >= endAt) {
                        return ServiceResultBuilder.failure(
                            `Thời gian bắt đầu phải trước thời gian kết thúc cho khoa ${dot.khoaId}`,
                            "INVALID_TIME_RANGE"
                        );
                    }

                    // Kiểm tra khoa tồn tại
                    const khoa = await this.unitOfWork.khoaRepository.findById(dot.khoaId);
                    if (!khoa) {
                        return ServiceResultBuilder.failure(
                            `Không tìm thấy khoa với ID: ${dot.khoaId}`,
                            "KHOA_NOT_FOUND"
                        );
                    }
                }
            }

            // Transaction: Upsert đợt
            const result = await this.unitOfWork.transaction(async (tx) => {
                if (request.isToanTruong) {
                    // ✅ Case 1: Áp dụng toàn trường
                    await (tx as any).dot_dang_ky.deleteMany({
                        where: {
                            hoc_ky_id: request.hocKyId,
                            loai_dot: loaiDot,
                            is_check_toan_truong: false,
                        },
                    });

                    const defaultGioiHan = loaiDot === "ghi_danh" ? 50 : 9999;

                    if (request.dotToanTruongId) {
                        // Update đợt toàn trường đã có
                        await (tx as any).dot_dang_ky.update({
                            where: { id: request.dotToanTruongId },
                            data: {
                                thoi_gian_bat_dau: new Date(request.thoiGianBatDau!),
                                thoi_gian_ket_thuc: new Date(request.thoiGianKetThuc!),
                                han_huy_den: request.hanHuyDen ? new Date(request.hanHuyDen) : null,
                                gioi_han_tin_chi: request.gioiHanTinChi ?? defaultGioiHan,
                            },
                        });
                    } else {
                        // Xóa đợt toàn trường cũ (nếu có)
                        await (tx as any).dot_dang_ky.deleteMany({
                            where: {
                                hoc_ky_id: request.hocKyId,
                                loai_dot: loaiDot,
                                is_check_toan_truong: true,
                            },
                        });

                        // Tạo mới đợt toàn trường
                        await (tx as any).dot_dang_ky.create({
                            data: {
                                hoc_ky_id: request.hocKyId,
                                loai_dot: loaiDot,
                                thoi_gian_bat_dau: new Date(request.thoiGianBatDau!),
                                thoi_gian_ket_thuc: new Date(request.thoiGianKetThuc!),
                                han_huy_den: request.hanHuyDen ? new Date(request.hanHuyDen) : null,
                                is_check_toan_truong: true,
                                khoa_id: null,
                                gioi_han_tin_chi: request.gioiHanTinChi ?? defaultGioiHan,
                            },
                        });
                    }
                } else {
                    // ✅ Case 2: Theo từng khoa
                    await (tx as any).dot_dang_ky.deleteMany({
                        where: {
                            hoc_ky_id: request.hocKyId,
                            loai_dot: loaiDot,
                            is_check_toan_truong: true,
                        },
                    });

                    const requestIds = request.dotTheoKhoa!
                        .filter((d) => d.id)
                        .map((d) => d.id!);

                    if (requestIds.length > 0) {
                        await (tx as any).dot_dang_ky.deleteMany({
                            where: {
                                hoc_ky_id: request.hocKyId,
                                loai_dot: loaiDot,
                                is_check_toan_truong: false,
                                id: { notIn: requestIds },
                            },
                        });
                    } else {
                        await (tx as any).dot_dang_ky.deleteMany({
                            where: {
                                hoc_ky_id: request.hocKyId,
                                loai_dot: loaiDot,
                                is_check_toan_truong: false,
                            },
                        });
                    }

                    const defaultGioiHan = loaiDot === "ghi_danh" ? 50 : 9999;

                    // Upsert từng đợt theo khoa
                    for (const dot of request.dotTheoKhoa!) {
                        if (dot.id) {
                            // Update record đã có
                            await (tx as any).dot_dang_ky.update({
                                where: { id: dot.id },
                                data: {
                                    thoi_gian_bat_dau: new Date(dot.thoiGianBatDau),
                                    thoi_gian_ket_thuc: new Date(dot.thoiGianKetThuc),
                                    han_huy_den: dot.hanHuyDen ? new Date(dot.hanHuyDen) : null,
                                    khoa_id: dot.khoaId,
                                    gioi_han_tin_chi: dot.gioiHanTinChi ?? defaultGioiHan,
                                },
                            });
                        } else {
                            // Tạo record mới
                            await (tx as any).dot_dang_ky.create({
                                data: {
                                    hoc_ky_id: request.hocKyId,
                                    loai_dot: loaiDot,
                                    thoi_gian_bat_dau: new Date(dot.thoiGianBatDau),
                                    thoi_gian_ket_thuc: new Date(dot.thoiGianKetThuc),
                                    han_huy_den: dot.hanHuyDen ? new Date(dot.hanHuyDen) : null,
                                    is_check_toan_truong: false,
                                    khoa_id: dot.khoaId,
                                    gioi_han_tin_chi: dot.gioiHanTinChi ?? defaultGioiHan,
                                },
                            });
                        }
                    }
                }

                // Lấy danh sách đợt sau khi upsert
                return await (tx as any).dot_dang_ky.findMany({
                    where: {
                        hoc_ky_id: request.hocKyId,
                        loai_dot: loaiDot,
                    },
                    include: {
                        khoa: {
                            select: {
                                ten_khoa: true,
                            },
                        },
                    },
                    orderBy: {
                        thoi_gian_bat_dau: "asc",
                    },
                });
            });

            // Map sang DTO
            const responseData: DotDangKyResponseDTO[] = result.map((item: any) => ({
                id: item.id,
                hocKyId: item.hoc_ky_id,
                loaiDot: item.loai_dot,
                thoiGianBatDau: new Date(item.thoi_gian_bat_dau).toISOString(),
                thoiGianKetThuc: new Date(item.thoi_gian_ket_thuc).toISOString(),
                hanHuyDen: item.han_huy_den ? new Date(item.han_huy_den).toISOString() : null,
                isCheckToanTruong: item.is_check_toan_truong,
                khoaId: item.khoa_id,
                tenKhoa: item.khoa?.ten_khoa || null,
                gioiHanTinChi: item.gioi_han_tin_chi,
            }));

            return ServiceResultBuilder.success(
                `Cập nhật thành công ${responseData.length} đợt ${loaiDot === "ghi_danh" ? "ghi danh" : "đăng ký"}`,
                responseData
            );
        } catch (error) {
            console.error(`Error updating dot ${loaiDot}:`, error);
            return ServiceResultBuilder.failure(
                `Lỗi hệ thống khi cập nhật đợt ${loaiDot === "ghi_danh" ? "ghi danh" : "đăng ký"}`,
                "INTERNAL_ERROR"
            );
        }
    }

    /**
     * Update đợt ghi danh (sử dụng hàm base)
     */
    async updateDotGhiDanh(request: UpdateDotGhiDanhRequest): Promise<ServiceResult<DotGhiDanhResponseDTO[]>> {
        return this.updateDotBase("ghi_danh", request);
    }

    /**
     * Update đợt đăng ký học phần (sử dụng hàm base)
     */
    async updateDotDangKy(request: UpdateDotDangKyRequest): Promise<ServiceResult<DotDangKyResponseDTO[]>> {
        return this.updateDotBase("dang_ky", request);
    }
}