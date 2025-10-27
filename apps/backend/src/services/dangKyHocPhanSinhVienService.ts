import { UnitOfWork } from "../repositories/unitOfWork";
import { ThoiKhoaBieuRepository } from "../repositories/mongo/thoiKhoaBieuRepository";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";

interface DangKyHocPhanRequest {
    lop_hoc_phan_id: string;
    hoc_ky_id: string;
}

export class DangKyHocPhanSinhVienService {
    private uow = UnitOfWork.getInstance();
    private tkbRepo = new ThoiKhoaBieuRepository();

    /**
     * Đăng ký học phần cho sinh viên
     */
    async dangKyHocPhan(sinh_vien_id: string, request: DangKyHocPhanRequest): Promise<ServiceResult<null>> {
        try {
            const { lop_hoc_phan_id, hoc_ky_id } = request;

            // ✅ Step 1: Check phase đăng ký có đang mở không
            const phase = await this.uow.kyPhaseRepository.getPhaseEnabled(hoc_ky_id);
            if (!phase || phase.phase !== "dang_ky_hoc_phan") {
                return ServiceResultBuilder.failure(
                    "Chưa đến giai đoạn đăng ký học phần hoặc phase đã đóng",
                    "PHASE_NOT_OPEN"
                );
            }

            // ✅ Step 2: Check lớp học phần có tồn tại không
            const lopHocPhan = await this.uow.lopHocPhanRepository.findById(lop_hoc_phan_id);
            if (!lopHocPhan) {
                return ServiceResultBuilder.failure("Lớp học phần không tồn tại", "LHP_NOT_FOUND");
            }

            // ✅ Step 2.5: Check sinh viên đã ghi danh học phần chưa
            const isGhiDanh = await this.uow.ghiDanhHocPhanRepository.isStudentRegistered(
                sinh_vien_id,
                lopHocPhan.hoc_phan_id
            );

            if (!isGhiDanh) {
                return ServiceResultBuilder.failure(
                    "Bạn phải ghi danh học phần này trước khi đăng ký lớp",
                    "NOT_GHI_DANH"
                );
            }

            // ✅ Step 2.6: Check không đăng ký trùng môn trong cùng học kỳ
            const hocPhan = await this.uow.hocPhanRepository.findById(lopHocPhan.hoc_phan_id);
            if (!hocPhan) {
                return ServiceResultBuilder.failure("Học phần không tồn tại", "HOC_PHAN_NOT_FOUND");
            }

            const hasRegisteredMon = await this.uow.dangKyHocPhanRepository.hasRegisteredMonHocInHocKy(
                sinh_vien_id,
                hocPhan.mon_hoc_id,
                hoc_ky_id
            );

            if (hasRegisteredMon) {
                return ServiceResultBuilder.failure(
                    "Bạn đã đăng ký một lớp khác của cùng môn trong học kỳ này",
                    "ALREADY_REGISTERED_MON_HOC"
                );
            }

            // ✅ Step 3: Check lớp còn chỗ không
            const soLuongHienTai = lopHocPhan.so_luong_hien_tai ?? 0;
            const soLuongToiDa = lopHocPhan.so_luong_toi_da ?? 50;

            if (soLuongHienTai >= soLuongToiDa) {
                return ServiceResultBuilder.failure("Lớp học phần đã đầy", "LHP_FULL");
            }

            // ✅ Step 4: Check sinh viên đã đăng ký lớp này chưa
            const alreadyRegistered = await this.uow.dangKyHocPhanRepository.isStudentRegistered(
                sinh_vien_id,
                lop_hoc_phan_id
            );

            if (alreadyRegistered) {
                return ServiceResultBuilder.failure("Bạn đã đăng ký lớp học phần này rồi", "ALREADY_REGISTERED");
            }

            // ✅ Step 5: Check xung đột lịch học (đã có sẵn)
            const conflictCheck = await this.checkTKBConflict(sinh_vien_id, lop_hoc_phan_id, hoc_ky_id);
            if (!conflictCheck.isSuccess) {
                return conflictCheck;
            }

            // ✅ Step 6: Transaction ACID
            await this.uow.transaction(async (tx: any) => {
                // 6.1: Tạo dang_ky_hoc_phan (dùng tx, không dùng this.uow)
                const dangKyHocPhan = await tx.dang_ky_hoc_phan.create({
                    data: {
                        sinh_vien_id,
                        lop_hoc_phan_id,
                        trang_thai: "da_dang_ky",
                        co_xung_dot: false,
                    },
                });

                // 6.2: Tạo/update lich_su_dang_ky
                const lichSuDangKy = await tx.lich_su_dang_ky.upsert({
                    where: {
                        sinh_vien_id_hoc_ky_id: {
                            sinh_vien_id,
                            hoc_ky_id,
                        },
                    },
                    update: {},
                    create: {
                        sinh_vien_id,
                        hoc_ky_id,
                    },
                });

                // 6.3: Tạo chi_tiet_lich_su_dang_ky
                await tx.chi_tiet_lich_su_dang_ky.create({
                    data: {
                        lich_su_dang_ky_id: lichSuDangKy.id,
                        dang_ky_hoc_phan_id: dangKyHocPhan.id,
                        hanh_dong: "dang_ky",
                    },
                });

                // 6.4: Tạo dang_ky_tkb
                await tx.dang_ky_tkb.create({
                    data: {
                        dang_ky_id: dangKyHocPhan.id,
                        sinh_vien_id,
                        lop_hoc_phan_id,
                    },
                });

                // 6.5: Update so_luong_hien_tai +1
                await tx.lop_hoc_phan.update({
                    where: { id: lop_hoc_phan_id },
                    data: {
                        so_luong_hien_tai: {
                            increment: 1,
                        },
                    },
                });
            });

            return ServiceResultBuilder.success("Đăng ký học phần thành công", null);
        } catch (error) {
            console.error("Error dang ky hoc phan:", error);
            return ServiceResultBuilder.failure("Lỗi khi đăng ký học phần", "INTERNAL_ERROR");
        }
    }

    /**
     * Hủy đăng ký học phần
     */
    async huyDangKyHocPhan(
        sinh_vien_id: string,
        lop_hoc_phan_id: string
    ): Promise<ServiceResult<null>> {
        try {
            // ✅ Step 1: Check record đăng ký có tồn tại không
            const dangKy = await this.uow.dangKyHocPhanRepository.findBySinhVienAndLopHocPhan(
                sinh_vien_id,
                lop_hoc_phan_id
            );

            if (!dangKy) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy record đăng ký học phần",
                    "DANG_KY_NOT_FOUND"
                );
            }

            if (dangKy.trang_thai === "da_huy") {
                return ServiceResultBuilder.failure(
                    "Đăng ký học phần đã được hủy trước đó",
                    "ALREADY_CANCELLED"
                );
            }

            // ✅ Step 2: Check hạn hủy đăng ký
            const hoc_ky_id = dangKy.lop_hoc_phan.hoc_phan.id_hoc_ky;
            const dotDangKy = await this.uow.dotDangKyRepository.findActiveDotDangKy(hoc_ky_id);

            if (!dotDangKy) {
                return ServiceResultBuilder.failure(
                    "Không trong đợt đăng ký học phần",
                    "NOT_IN_DANG_KY_DOT"
                );
            }

            if (dotDangKy.han_huy_den) {
                const now = new Date();
                if (now > dotDangKy.han_huy_den) {
                    return ServiceResultBuilder.failure(
                        "Đã quá hạn hủy đăng ký học phần",
                        "PAST_CANCEL_DEADLINE"
                    );
                }
            }

            // ✅ Step 3: Transaction ACID
            await this.uow.transaction(async (tx: any) => {
                // 3.1: Update trang_thai = 'da_huy'
                await tx.dang_ky_hoc_phan.update({
                    where: { id: dangKy.id },
                    data: { trang_thai: "da_huy" },
                });

                // 3.2: Xóa dang_ky_tkb
                await tx.dang_ky_tkb.deleteMany({
                    where: {
                        dang_ky_id: dangKy.id,
                    },
                });

                // 3.3: Tạo chi_tiet_lich_su_dang_ky với hanh_dong = 'huy'
                const lichSuDangKy = await tx.lich_su_dang_ky.findUnique({
                    where: {
                        sinh_vien_id_hoc_ky_id: {
                            sinh_vien_id,
                            hoc_ky_id,
                        },
                    },
                });

                if (lichSuDangKy) {
                    await tx.chi_tiet_lich_su_dang_ky.create({
                        data: {
                            lich_su_dang_ky_id: lichSuDangKy.id,
                            dang_ky_hoc_phan_id: dangKy.id,
                            hanh_dong: "huy_dang_ky",
                        },
                    });
                }

                // 3.4: Giảm so_luong_hien_tai -1
                await tx.lop_hoc_phan.update({
                    where: { id: lop_hoc_phan_id },
                    data: {
                        so_luong_hien_tai: {
                            decrement: 1,
                        },
                    },
                });
            });

            return ServiceResultBuilder.success("Hủy đăng ký học phần thành công", null);
        } catch (error) {
            console.error("Error huy dang ky hoc phan:", error);
            return ServiceResultBuilder.failure("Lỗi khi hủy đăng ký học phần", "INTERNAL_ERROR");
        }
    }

    /**
     * Chuyển lớp học phần (update lop_hoc_phan_id)
     */
    async chuyenLopHocPhan(
        sinh_vien_id: string,
        lop_hoc_phan_id_cu: string,
        lop_hoc_phan_id_moi: string
    ): Promise<ServiceResult<null>> {
        try {
            // ✅ Step 1: Check record đăng ký cũ
            const dangKyCu = await this.uow.dangKyHocPhanRepository.findBySinhVienAndLopHocPhan(
                sinh_vien_id,
                lop_hoc_phan_id_cu
            );

            if (!dangKyCu) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy record đăng ký lớp cũ",
                    "OLD_CLASS_NOT_FOUND"
                );
            }

            if (dangKyCu.trang_thai !== "da_dang_ky") {
                return ServiceResultBuilder.failure(
                    "Lớp cũ đã bị hủy, không thể chuyển",
                    "OLD_CLASS_CANCELLED"
                );
            }

            // ✅ Step 2: Check lớp mới có tồn tại không
            const lopMoi = await this.uow.lopHocPhanRepository.findById(lop_hoc_phan_id_moi);
            if (!lopMoi) {
                return ServiceResultBuilder.failure("Lớp mới không tồn tại", "NEW_CLASS_NOT_FOUND");
            }

            // ✅ Step 3: Check lớp mới cùng môn học
            const hocPhanCu = dangKyCu.lop_hoc_phan.hoc_phan;
            const hocPhanMoi = await this.uow.hocPhanRepository.findById(lopMoi.hoc_phan_id);

            if (!hocPhanMoi || hocPhanCu.mon_hoc_id !== hocPhanMoi.mon_hoc_id) {
                return ServiceResultBuilder.failure(
                    "Lớp mới không cùng môn học với lớp cũ",
                    "DIFFERENT_SUBJECT"
                );
            }

            // ✅ Step 4: Check lớp mới còn chỗ
            const soLuongHienTai = lopMoi.so_luong_hien_tai ?? 0;
            const soLuongToiDa = lopMoi.so_luong_toi_da ?? 50;

            if (soLuongHienTai >= soLuongToiDa) {
                return ServiceResultBuilder.failure("Lớp mới đã đầy", "NEW_CLASS_FULL");
            }

            // ✅ Step 5: Check xung đột TKB với lớp đã đăng ký khác
            const hoc_ky_id = hocPhanMoi.id_hoc_ky;
            const conflictCheck = await this.checkTKBConflictForChuyenLop(
                sinh_vien_id,
                lop_hoc_phan_id_cu,
                lop_hoc_phan_id_moi,
                hoc_ky_id
            );

            if (!conflictCheck.isSuccess) {
                return conflictCheck;
            }

            // ✅ Step 6: Transaction ACID
            await this.uow.transaction(async (tx: any) => {
                // 6.1: Update lop_hoc_phan_id
                await tx.dang_ky_hoc_phan.update({
                    where: { id: dangKyCu.id },
                    data: { lop_hoc_phan_id: lop_hoc_phan_id_moi },
                });

                // 6.2: Update dang_ky_tkb
                await tx.dang_ky_tkb.updateMany({
                    where: { dang_ky_id: dangKyCu.id },
                    data: { lop_hoc_phan_id: lop_hoc_phan_id_moi },
                });

                // 6.3: Tạo chi_tiet_lich_su_dang_ky
                const lichSuDangKy = await tx.lich_su_dang_ky.findUnique({
                    where: {
                        sinh_vien_id_hoc_ky_id: {
                            sinh_vien_id,
                            hoc_ky_id,
                        },
                    },
                });

                if (lichSuDangKy) {
                    await tx.chi_tiet_lich_su_dang_ky.create({
                        data: {
                            lich_su_dang_ky_id: lichSuDangKy.id,
                            dang_ky_hoc_phan_id: dangKyCu.id,
                            hanh_dong: "dang_ky",
                        },
                    });
                }

                // 6.4: Giảm so_luong_hien_tai lớp cũ -1
                await tx.lop_hoc_phan.update({
                    where: { id: lop_hoc_phan_id_cu },
                    data: { so_luong_hien_tai: { decrement: 1 } },
                });

                // 6.5: Tăng so_luong_hien_tai lớp mới +1
                await tx.lop_hoc_phan.update({
                    where: { id: lop_hoc_phan_id_moi },
                    data: { so_luong_hien_tai: { increment: 1 } },
                });
            });

            return ServiceResultBuilder.success("Chuyển lớp học phần thành công", null);
        } catch (error) {
            console.error("Error chuyen lop hoc phan:", error);
            return ServiceResultBuilder.failure("Lỗi khi chuyển lớp học phần", "INTERNAL_ERROR");
        }
    }

    /**
     * Check xung đột TKB khi chuyển lớp (bỏ qua lớp cũ)
     */
    private async checkTKBConflictForChuyenLop(
        sinh_vien_id: string,
        lop_hoc_phan_id_cu: string,
        lop_hoc_phan_id_moi: string,
        hoc_ky_id: string
    ): Promise<ServiceResult<null>> {
        try {
            // Lấy danh sách lớp đã đăng ký (trừ lớp cũ)
            const registeredLops = await this.uow.dangKyTKBRepository.findRegisteredLopHocPhansByHocKy(
                sinh_vien_id,
                hoc_ky_id
            );

            const filteredLops = registeredLops.filter(
                (r: any) => r.lop_hoc_phan_id !== lop_hoc_phan_id_cu
            );

            // Lấy TKB của lớp mới
            const lopMoi = await this.uow.lopHocPhanRepository.findById(lop_hoc_phan_id_moi);
            if (!lopMoi) {
                return ServiceResultBuilder.failure("Lớp mới không tồn tại", "NEW_CLASS_NOT_FOUND");
            }

            const hocPhan = await this.uow.hocPhanRepository.findById(lopMoi.hoc_phan_id);
            if (!hocPhan) {
                return ServiceResultBuilder.failure("Học phần không tồn tại", "HOC_PHAN_NOT_FOUND");
            }

            const monHoc = await this.uow.monHocRepository.findById(hocPhan.mon_hoc_id);
            if (!monHoc) {
                return ServiceResultBuilder.failure("Môn học không tồn tại", "MON_HOC_NOT_FOUND");
            }

            const maMon = monHoc.ma_mon;
            const tkbNew = await this.tkbRepo.findByMaHocPhanAndHocKy(maMon, hoc_ky_id);

            if (!tkbNew) {
                return ServiceResultBuilder.success("Không có TKB, không xung đột", null);
            }

            const newLopTKB = tkbNew.danhSachLop.find((l: any) => l.tenLop === lopMoi.ma_lop);
            if (!newLopTKB) {
                return ServiceResultBuilder.success("Không có TKB cho lớp mới", null);
            }

            // Check conflict với các lớp đã đăng ký khác
            const registeredMonHocIds = [
                ...new Set(filteredLops.map((r: any) => r.lop_hoc_phan.hoc_phan.mon_hoc_id)),
            ];

            const monHocs = await this.uow.monHocRepository.findByIds(registeredMonHocIds as string[]);
            const maMons = monHocs.map((m: any) => m.ma_mon);
            const tkbList = await this.tkbRepo.findByMaHocPhans(maMons, hoc_ky_id);

            for (const tkb of tkbList) {
                for (const lopTKB of tkb.danhSachLop) {
                    if (
                        lopTKB.thuTrongTuan === newLopTKB.thuTrongTuan &&
                        this.isTimeOverlap(
                            lopTKB.tietBatDau,
                            lopTKB.tietKetThuc,
                            newLopTKB.tietBatDau,
                            newLopTKB.tietKetThuc
                        )
                    ) {
                        return ServiceResultBuilder.failure(
                            `Xung đột lịch học với môn ${tkb.maHocPhan} - Lớp ${lopTKB.tenLop}`,
                            "TKB_CONFLICT"
                        );
                    }
                }
            }

            return ServiceResultBuilder.success("Không có xung đột TKB", null);
        } catch (error) {
            console.error("Error checking TKB conflict for chuyen lop:", error);
            return ServiceResultBuilder.failure("Lỗi khi kiểm tra xung đột TKB", "INTERNAL_ERROR");
        }
    }

    /**
     * Check xung đột TKB
     */
    private async checkTKBConflict(
        sinh_vien_id: string,
        new_lop_hoc_phan_id: string,
        hoc_ky_id: string
    ): Promise<ServiceResult<null>> {
        try {
            // Lấy danh sách lớp đã đăng ký
            const registeredLops = await this.uow.dangKyTKBRepository.findRegisteredLopHocPhansByHocKy(
                sinh_vien_id,
                hoc_ky_id
            );

            // Lấy TKB của lớp mới
            const newLHP = await this.uow.lopHocPhanRepository.findById(new_lop_hoc_phan_id);

            if (!newLHP) {
                return ServiceResultBuilder.failure("Lớp học phần không tồn tại", "LHP_NOT_FOUND");
            }

            // ✅ Lấy thông tin môn học
            const hocPhan = await this.uow.hocPhanRepository.findById(newLHP.hoc_phan_id);
            if (!hocPhan) {
                return ServiceResultBuilder.failure("Học phần không tồn tại", "HOC_PHAN_NOT_FOUND");
            }

            const monHoc = await this.uow.monHocRepository.findById(hocPhan.mon_hoc_id);
            if (!monHoc) {
                return ServiceResultBuilder.failure("Môn học không tồn tại", "MON_HOC_NOT_FOUND");
            }

            const maMon = monHoc.ma_mon;

            // Lấy TKB từ MongoDB
            const tkbNew = await this.tkbRepo.findByMaHocPhanAndHocKy(maMon, hoc_ky_id);
            if (!tkbNew) {
                return ServiceResultBuilder.success("Không có TKB, không xung đột", null);
            }

            const newLopTKB = tkbNew.danhSachLop.find((l: any) => l.tenLop === newLHP.ma_lop);
            if (!newLopTKB) {
                return ServiceResultBuilder.success("Không có TKB cho lớp này", null);
            }

            // Lấy TKB của các lớp đã đăng ký
            const registeredMonHocIds = [
                ...new Set(
                    registeredLops.map((r: any) => r.lop_hoc_phan.hoc_phan.mon_hoc_id)
                ),
            ];

            // Query TKB từ MongoDB
            const monHocs = await this.uow.monHocRepository.findByIds(registeredMonHocIds as string[]);

            const maMons = monHocs.map((m: any) => m.ma_mon);
            const tkbList = await this.tkbRepo.findByMaHocPhans(maMons, hoc_ky_id);

            // Check conflict
            for (const tkb of tkbList) {
                for (const lopTKB of tkb.danhSachLop) {
                    // Check trùng thứ và tiết
                    if (
                        lopTKB.thuTrongTuan === newLopTKB.thuTrongTuan &&
                        this.isTimeOverlap(
                            lopTKB.tietBatDau,
                            lopTKB.tietKetThuc,
                            newLopTKB.tietBatDau,
                            newLopTKB.tietKetThuc
                        )
                    ) {
                        return ServiceResultBuilder.failure(
                            `Xung đột lịch học với môn ${tkb.maHocPhan} - Lớp ${lopTKB.tenLop}`,
                            "TKB_CONFLICT"
                        );
                    }
                }
            }

            return ServiceResultBuilder.success("Không có xung đột TKB", null);
        } catch (error) {
            console.error("Error checking TKB conflict:", error);
            return ServiceResultBuilder.failure("Lỗi khi kiểm tra xung đột TKB", "INTERNAL_ERROR");
        }
    }

    /**
     * Check overlap tiết học
     */
    private isTimeOverlap(start1: number, end1: number, start2: number, end2: number): boolean {
        return start1 <= end2 && start2 <= end1;
    }
}
