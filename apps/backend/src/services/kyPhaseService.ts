import { UnitOfWork } from "../repositories/unitOfWork";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";
import {
    CreateBulkKyPhaseRequest,
    KyPhaseResponseDTO,
    PhasesByHocKyDTO,
    PhaseItemDetailDTO,
} from "../dtos/kyPhaseDTO";
import { KhoaDTO } from "../dtos/pdtDTO";
import {
    UpdateDotGhiDanhRequest,
    DotGhiDanhResponseDTO,
} from "../dtos/dotDangKyDTO";

export class KyPhaseService {
    constructor(private unitOfWork: UnitOfWork) { }

    /**
     * Tạo bulk ky phase và update thông tin học kỳ
     * @param request - Thông tin phases và thời gian học kỳ
     */
    async CreateBulkKyPhase(
        request: CreateBulkKyPhaseRequest
    ): Promise<ServiceResult<KyPhaseResponseDTO[]>> {
        try {
            // Validate input
            if (!request.hocKyId || !request.hocKyStartAt || !request.hocKyEndAt) {
                return ServiceResultBuilder.failure(
                    "Thông tin học kỳ không được để trống",
                    "INVALID_INPUT"
                );
            }

            if (!request.phases || request.phases.length === 0) {
                return ServiceResultBuilder.failure(
                    "Danh sách phases không được để trống",
                    "INVALID_PHASES"
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

            // Validate thời gian học kỳ
            const hocKyStartAt = new Date(request.hocKyStartAt);
            const hocKyEndAt = new Date(request.hocKyEndAt);

            if (hocKyStartAt >= hocKyEndAt) {
                return ServiceResultBuilder.failure(
                    "Thời gian bắt đầu học kỳ phải trước thời gian kết thúc",
                    "INVALID_HOC_KY_TIME_RANGE"
                );
            }

            // Validate từng phase
            for (const phase of request.phases) {
                if (!phase.phase || !phase.startAt || !phase.endAt) {
                    return ServiceResultBuilder.failure(
                        "Thông tin phase không đầy đủ",
                        "INVALID_PHASE_DATA"
                    );
                }

                const startAt = new Date(phase.startAt);
                const endAt = new Date(phase.endAt);

                if (startAt >= endAt) {
                    return ServiceResultBuilder.failure(
                        `Thời gian bắt đầu phải trước thời gian kết thúc cho phase: ${phase.phase}`,
                        "INVALID_PHASE_TIME_RANGE"
                    );
                }

                // Kiểm tra phase nằm trong khoảng thời gian học kỳ
                if (startAt < hocKyStartAt || endAt > hocKyEndAt) {
                    return ServiceResultBuilder.failure(
                        `Phase "${phase.phase}" phải nằm trong khoảng thời gian học kỳ (${hocKyStartAt.toISOString()} - ${hocKyEndAt.toISOString()})`,
                        "PHASE_OUT_OF_HOC_KY_RANGE"
                    );
                }
            }

            // Transaction: Update học kỳ và tạo phases
            const result = await this.unitOfWork.transaction(async (tx) => {
                // ✅ Step 1: Update thời gian học kỳ
                await (tx as any).hoc_ky.update({
                    where: { id: request.hocKyId },
                    data: {
                        ngay_bat_dau: hocKyStartAt,
                        ngay_ket_thuc: hocKyEndAt,
                    },
                });

                // ✅ Step 2: Xóa tất cả phases cũ của học kỳ
                await (tx as any).ky_phase.deleteMany({
                    where: { hoc_ky_id: request.hocKyId },
                });

                // ✅ Step 2.5: Xóa tất cả dot_dang_ky cũ
                await (tx as any).dot_dang_ky.deleteMany({
                    where: { hoc_ky_id: request.hocKyId },
                });

                // ✅ Step 3: Tạo phases mới
                const phasesData = request.phases.map((phase) => ({
                    hoc_ky_id: request.hocKyId,
                    phase: phase.phase,
                    start_at: new Date(phase.startAt),
                    end_at: new Date(phase.endAt),
                    is_enabled: false, // Mặc định disable, PDT sẽ enable thủ công
                }));

                await (tx as any).ky_phase.createMany({
                    data: phasesData,
                });

                // ✅ Step 3.5: Tự động tạo 2 đợt: ghi_danh và dang_ky (toàn trường)
                const ghiDanhPhase = request.phases.find(p => p.phase === 'ghi_danh');
                const dangKyPhase = request.phases.find(p => p.phase === 'dang_ky_hoc_phan');

                if (ghiDanhPhase) {
                    await (tx as any).dot_dang_ky.create({
                        data: {
                            hoc_ky_id: request.hocKyId,
                            loai_dot: 'ghi_danh',
                            is_check_toan_truong: true,
                            thoi_gian_bat_dau: new Date(ghiDanhPhase.startAt),
                            thoi_gian_ket_thuc: new Date(ghiDanhPhase.endAt),
                            gioi_han_tin_chi: 50,
                            khoa_id: null,
                        },
                    });
                }

                if (dangKyPhase) {
                    await (tx as any).dot_dang_ky.create({
                        data: {
                            hoc_ky_id: request.hocKyId,
                            loai_dot: 'dang_ky',
                            is_check_toan_truong: true,
                            thoi_gian_bat_dau: new Date(dangKyPhase.startAt),
                            thoi_gian_ket_thuc: new Date(dangKyPhase.endAt),
                            gioi_han_tin_chi: 9999,
                            khoa_id: null,
                        },
                    });
                }

                // ✅ Step 4: Lấy danh sách phases vừa tạo
                return await (tx as any).ky_phase.findMany({
                    where: { hoc_ky_id: request.hocKyId },
                    orderBy: { start_at: "asc" },
                });
            });

            // Map sang DTO
            const responseData: KyPhaseResponseDTO[] = result.map((item: any) => ({
                id: item.id,
                hocKyId: item.hoc_ky_id,
                phase: item.phase,
                startAt: new Date(item.start_at),
                endAt: new Date(item.end_at),
                isEnabled: item.is_enabled ?? false,
            }));

            return ServiceResultBuilder.success(
                `Cập nhật học kỳ và tạo thành công ${responseData.length} phases`,
                responseData
            );
        } catch (error) {
            console.error("Error creating bulk ky phase:", error);
            return ServiceResultBuilder.failure(
                "Lỗi hệ thống khi tạo bulk ky phase",
                "INTERNAL_ERROR"
            );
        }
    }

    /**
     * Lấy danh sách phases theo học kỳ
     * @param hocKyId - ID của học kỳ
     */
    async getPhasesByHocKy(hocKyId: string): Promise<ServiceResult<PhasesByHocKyDTO>> {
        try {
            // Step 1: Kiểm tra học kỳ tồn tại
            const hocKy = await this.unitOfWork.hocKyRepository.findById(hocKyId);
            if (!hocKy) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy học kỳ",
                    "HOC_KY_NOT_FOUND"
                );
            }

            // Step 2: Lấy tất cả phases của học kỳ
            // ✅ Sửa orderBy: bat_dau -> start_at
            const kyPhases = await this.unitOfWork.kyPhaseRepository.findMany({
                where: { hoc_ky_id: hocKyId },
                orderBy: { start_at: "asc" }, // ✅ Đổi tên cột
            });

            // Step 3: Map sang DTO
            // ✅ Sửa tên các fields: bat_dau -> start_at, ket_thuc -> end_at, ten_phase -> phase, trang_thai -> is_enabled
            const phases: PhaseItemDetailDTO[] = kyPhases.map((phase: any) => ({
                id: phase.id,
                phase: phase.phase, // ✅ Đổi từ ten_phase
                startAt: new Date(phase.start_at).toISOString(), // ✅ Đổi từ bat_dau
                endAt: new Date(phase.end_at).toISOString(), // ✅ Đổi từ ket_thuc
                isEnabled: phase.is_enabled ?? false, // ✅ Đổi từ trang_thai
            }));

            const data: PhasesByHocKyDTO = {
                hocKyId: hocKy.id,
                tenHocKy: hocKy.ten_hoc_ky,
                phases,
            };

            return ServiceResultBuilder.success(
                "Lấy danh sách phases thành công",
                data
            );
        } catch (error) {
            console.error("Error getting phases by hoc ky:", error);
            return ServiceResultBuilder.failure(
                "Lỗi hệ thống khi lấy danh sách phases",
                "INTERNAL_ERROR"
            );
        }
    }

    async getDanhSachKhoa(): Promise<ServiceResult<KhoaDTO[]>> {
        try {
            const listKhoas = await this.unitOfWork.khoaRepository.findAll();

            const data: KhoaDTO[] = listKhoas.map((khoa: any) => ({
                id: khoa.id,
                tenKhoa: khoa.ten_khoa,
            }));
            return ServiceResultBuilder.success(
                "Lấy danh sách khoa thành công",
                data
            );
        } catch (error) {
            console.error("Error getting danh sach khoa:", error);

            return ServiceResultBuilder.failure(
                "Lỗi hệ thống khi lấy danh sách khoa",
                "INTERNAL_ERROR"
            );
        }
    }

    /**
     * Update đợt ghi danh
     * FE gửi full data (bao gồm id nếu record đã tồn tại)
     * @param request - Thông tin đợt ghi danh
     */
    async updateDotGhiDanh(
        request: UpdateDotGhiDanhRequest
    ): Promise<ServiceResult<DotGhiDanhResponseDTO[]>> {
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

            // Transaction: Upsert đợt ghi danh (sử dụng repository)
            const result = await this.unitOfWork.transaction(async (tx) => {
                const dotRepo = this.unitOfWork.dotDangKyRepository;

                if (request.isToanTruong) {
                    // ✅ Case 1: Áp dụng toàn trường
                    // Xóa tất cả đợt theo khoa
                    await (tx as any).dot_dang_ky.deleteMany({
                        where: {
                            hoc_ky_id: request.hocKyId,
                            loai_dot: "ghi_danh",
                            is_check_toan_truong: false,
                        },
                    });

                    if (request.dotToanTruongId) {
                        // Update đợt toàn trường đã có
                        await (tx as any).dot_dang_ky.update({
                            where: { id: request.dotToanTruongId },
                            data: {
                                thoi_gian_bat_dau: new Date(request.thoiGianBatDau!),
                                thoi_gian_ket_thuc: new Date(request.thoiGianKetThuc!),
                            },
                        });
                    } else {
                        // Xóa đợt toàn trường cũ (nếu có)
                        await (tx as any).dot_dang_ky.deleteMany({
                            where: {
                                hoc_ky_id: request.hocKyId,
                                loai_dot: "ghi_danh",
                                is_check_toan_truong: true,
                            },
                        });

                        // Tạo mới đợt toàn trường
                        await (tx as any).dot_dang_ky.create({
                            data: {
                                hoc_ky_id: request.hocKyId,
                                loai_dot: "ghi_danh",
                                thoi_gian_bat_dau: new Date(request.thoiGianBatDau!),
                                thoi_gian_ket_thuc: new Date(request.thoiGianKetThuc!),
                                is_check_toan_truong: true,
                                khoa_id: null,
                                gioi_han_tin_chi: 50,
                            },
                        });
                    }
                } else {
                    // ✅ Case 2: Theo từng khoa
                    // Xóa đợt toàn trường
                    await (tx as any).dot_dang_ky.deleteMany({
                        where: {
                            hoc_ky_id: request.hocKyId,
                            loai_dot: "ghi_danh",
                            is_check_toan_truong: true,
                        },
                    });

                    // Lấy danh sách id từ request
                    const requestIds = request.dotTheoKhoa!
                        .filter((d) => d.id)
                        .map((d) => d.id!);

                    // ✅ Fix: Xóa các đợt không có trong request
                    if (requestIds.length > 0) {
                        // Nếu có IDs trong request, xóa những cái KHÔNG có trong list
                        await (tx as any).dot_dang_ky.deleteMany({
                            where: {
                                hoc_ky_id: request.hocKyId,
                                loai_dot: "ghi_danh",
                                is_check_toan_truong: false,
                                id: { notIn: requestIds },
                            },
                        });
                    } else {
                        // Nếu request không có ID nào (tất cả là record mới)
                        // Xóa hết tất cả đợt theo khoa cũ
                        await (tx as any).dot_dang_ky.deleteMany({
                            where: {
                                hoc_ky_id: request.hocKyId,
                                loai_dot: "ghi_danh",
                                is_check_toan_truong: false,
                            },
                        });
                    }

                    // Upsert từng đợt theo khoa
                    for (const dot of request.dotTheoKhoa!) {
                        if (dot.id) {
                            // Update record đã có
                            await (tx as any).dot_dang_ky.update({
                                where: { id: dot.id },
                                data: {
                                    thoi_gian_bat_dau: new Date(dot.thoiGianBatDau),
                                    thoi_gian_ket_thuc: new Date(dot.thoiGianKetThuc),
                                    khoa_id: dot.khoaId,
                                },
                            });
                        } else {
                            // Tạo record mới
                            await (tx as any).dot_dang_ky.create({
                                data: {
                                    hoc_ky_id: request.hocKyId,
                                    loai_dot: "ghi_danh",
                                    thoi_gian_bat_dau: new Date(dot.thoiGianBatDau),
                                    thoi_gian_ket_thuc: new Date(dot.thoiGianKetThuc),
                                    is_check_toan_truong: false,
                                    khoa_id: dot.khoaId,
                                    gioi_han_tin_chi: 50,
                                },
                            });
                        }
                    }
                }

                // Lấy danh sách đợt sau khi upsert
                return await (tx as any).dot_dang_ky.findMany({
                    where: {
                        hoc_ky_id: request.hocKyId,
                        loai_dot: "ghi_danh",
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
            const responseData: DotGhiDanhResponseDTO[] = result.map((item: any) => ({
                id: item.id,
                hocKyId: item.hoc_ky_id,
                loaiDot: item.loai_dot,
                thoiGianBatDau: new Date(item.thoi_gian_bat_dau).toISOString(),
                thoiGianKetThuc: new Date(item.thoi_gian_ket_thuc).toISOString(),
                isCheckToanTruong: item.is_check_toan_truong,
                khoaId: item.khoa_id,
                tenKhoa: item.khoa?.ten_khoa || null,
                gioiHanTinChi: item.gioi_han_tin_chi,
            }));

            return ServiceResultBuilder.success(
                `Cập nhật thành công ${responseData.length} đợt ghi danh`,
                responseData
            );
        } catch (error) {
            console.error("Error updating dot ghi danh:", error);
            return ServiceResultBuilder.failure(
                "Lỗi hệ thống khi cập nhật đợt ghi danh",
                "INTERNAL_ERROR"
            );
        }
    }

}