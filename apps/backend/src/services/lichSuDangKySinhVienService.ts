import { UnitOfWork } from "../repositories/unitOfWork";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";
import { ThoiKhoaBieuRepository } from "../repositories/mongo/thoiKhoaBieuRepository";

export class LichSuDangKySinhVienService {
    private uow = UnitOfWork.getInstance();
    private tkbRepo = new ThoiKhoaBieuRepository();

    /**
     * Lấy lịch sử đăng ký của sinh viên theo học kỳ
     */
    async getLichSuDangKyByHocKy(
        sinh_vien_id: string,
        hoc_ky_id: string
    ): Promise<ServiceResult<any>> {
        try {
            const lichSu = await this.uow.lichSuDangKyRepository.findBySinhVienAndHocKy(
                sinh_vien_id,
                hoc_ky_id
            );

            if (!lichSu) {
                return ServiceResultBuilder.success("Chưa có lịch sử đăng ký", null);
            }

            // Format data
            const data = {
                hocKy: {
                    tenHocKy: lichSu.hoc_ky?.ten_hoc_ky,
                    maHocKy: lichSu.hoc_ky?.ma_hoc_ky,
                },
                ngayTao: lichSu.ngay_tao,
                lichSu: lichSu.chi_tiet_lich_su_dang_ky.map((ct: any) => ({
                    hanhDong: ct.hanh_dong,
                    thoiGian: ct.thoi_gian,
                    monHoc: {
                        maMon: ct.dang_ky_hoc_phan.lop_hoc_phan.hoc_phan.mon_hoc.ma_mon,
                        tenMon: ct.dang_ky_hoc_phan.lop_hoc_phan.hoc_phan.mon_hoc.ten_mon,
                        soTinChi: ct.dang_ky_hoc_phan.lop_hoc_phan.hoc_phan.mon_hoc.so_tin_chi,
                    },
                    lopHocPhan: {
                        maLop: ct.dang_ky_hoc_phan.lop_hoc_phan.ma_lop,
                        tenHocPhan: ct.dang_ky_hoc_phan.lop_hoc_phan.hoc_phan.ten_hoc_phan,
                    },
                })),
            };

            return ServiceResultBuilder.success("Lấy lịch sử đăng ký thành công", data);
        } catch (error) {
            console.error("Error getting lich su dang ky:", error);
            return ServiceResultBuilder.failure("Lỗi khi lấy lịch sử đăng ký", "INTERNAL_ERROR");
        }
    }

    /**
     * Lấy tất cả lịch sử đăng ký của sinh viên
     */
    async getAllLichSuDangKy(sinh_vien_id: string): Promise<ServiceResult<any[]>> {
        try {
            const lichSuList = await this.uow.lichSuDangKyRepository.findAllBySinhVien(sinh_vien_id);

            const data = lichSuList.map((lichSu: any) => ({
                hocKy: {
                    id: lichSu.hoc_ky_id,
                    tenHocKy: lichSu.hoc_ky.ten_hoc_ky,
                    maHocKy: lichSu.hoc_ky.ma_hoc_ky,
                    ngayBatDau: lichSu.hoc_ky.ngay_bat_dau,
                    ngayKetThuc: lichSu.hoc_ky.ngay_ket_thuc,
                },
                ngayTao: lichSu.ngay_tao,
                soLuongHanhDong: lichSu.chi_tiet_lich_su_dang_ky.length,
                lichSu: lichSu.chi_tiet_lich_su_dang_ky.map((ct: any) => ({
                    hanhDong: ct.hanh_dong,
                    thoiGian: ct.thoi_gian,
                    monHoc: {
                        maMon: ct.dang_ky_hoc_phan.lop_hoc_phan.hoc_phan.mon_hoc.ma_mon,
                        tenMon: ct.dang_ky_hoc_phan.lop_hoc_phan.hoc_phan.mon_hoc.ten_mon,
                        soTinChi: ct.dang_ky_hoc_phan.lop_hoc_phan.hoc_phan.mon_hoc.so_tin_chi,
                    },
                    lopHocPhan: {
                        maLop: ct.dang_ky_hoc_phan.lop_hoc_phan.ma_lop,
                        tenHocPhan: ct.dang_ky_hoc_phan.lop_hoc_phan.hoc_phan.ten_hoc_phan,
                        giangVien: ct.dang_ky_hoc_phan.lop_hoc_phan.giang_vien?.users?.ho_ten,
                    },
                })),
            }));

            return ServiceResultBuilder.success("Lấy danh sách lịch sử thành công", data);
        } catch (error) {
            console.error("Error getting all lich su dang ky:", error);
            return ServiceResultBuilder.failure("Lỗi khi lấy danh sách lịch sử", "INTERNAL_ERROR");
        }
    }

    /**
     * Lấy TKB của sinh viên theo học kỳ (dựa trên các lớp đã đăng ký)
     */
    async getTKBSinhVien(sinh_vien_id: string, hoc_ky_id: string): Promise<ServiceResult<any>> {
        try {
            // Lấy danh sách lớp đã đăng ký
            const dangKyList = await this.uow.dangKyTKBRepository.findRegisteredLopHocPhansByHocKy(
                sinh_vien_id,
                hoc_ky_id
            );

            if (!dangKyList || dangKyList.length === 0) {
                return ServiceResultBuilder.success("Chưa đăng ký lớp nào", []);
            }

            // ✅ Fix: Cast maMons thành string[]
            const maMons: string[] = dangKyList.map((dk: any) =>
                dk.lop_hoc_phan.hoc_phan.mon_hoc.ma_mon
            );

            // Lấy TKB từ MongoDB
            const tkbList = await this.tkbRepo.findByMaHocPhans([...new Set(maMons)], hoc_ky_id);

            // Lấy danh sách phongHocIds để map tên phòng
            const phongHocIds = new Set<string>();
            tkbList.forEach((tkb: any) => {
                tkb.danhSachLop?.forEach((lop: any) => {
                    if (lop.phongHocId) {
                        phongHocIds.add(lop.phongHocId);
                    }
                });
            });

            // Map phongHocId -> tenPhong
            const phongMap = await this.uow.phongRepository.getTenPhongByIds(Array.from(phongHocIds));

            // Map TKB với thông tin lớp đã đăng ký
            const result = dangKyList.map((dk: any) => {
                const maMon = dk.lop_hoc_phan.hoc_phan.mon_hoc.ma_mon;
                const maLop = dk.lop_hoc_phan.ma_lop;

                // Tìm TKB của môn này
                const tkb = tkbList.find((t: any) => t.maHocPhan === maMon);

                if (!tkb) {
                    return {
                        maMon,
                        tenMon: dk.lop_hoc_phan.hoc_phan.mon_hoc.ten_mon,
                        soTinChi: dk.lop_hoc_phan.hoc_phan.mon_hoc.so_tin_chi,
                        maLop,
                        tenLop: dk.lop_hoc_phan.hoc_phan.ten_hoc_phan,
                        giangVien: dk.lop_hoc_phan.giang_vien?.users?.ho_ten,
                        tkb: null,
                    };
                }

                // Tìm lịch học của lớp cụ thể
                const lichHoc = tkb.danhSachLop.find((lop: any) => lop.tenLop === maLop);

                return {
                    maMon,
                    tenMon: dk.lop_hoc_phan.hoc_phan.mon_hoc.ten_mon,
                    soTinChi: dk.lop_hoc_phan.hoc_phan.mon_hoc.so_tin_chi,
                    maLop,
                    tenLop: dk.lop_hoc_phan.hoc_phan.ten_hoc_phan,
                    giangVien: dk.lop_hoc_phan.giang_vien?.users?.ho_ten,
                    tkb: lichHoc ? {
                        thu: lichHoc.thuTrongTuan,
                        tiet: `${lichHoc.tietBatDau} - ${lichHoc.tietKetThuc}`,
                        phong: lichHoc.phongHocId ? phongMap.get(lichHoc.phongHocId) || null : null, // ✅ Fix: Use phongHocId
                        ngayBatDau: lichHoc.ngayBatDau,
                        ngayKetThuc: lichHoc.ngayKetThuc,
                    } : null,
                };
            });

            // Sắp xếp theo thứ trong tuần
            result.sort((a: any, b: any) => {
                if (!a.tkb) return 1;
                if (!b.tkb) return -1;
                return a.tkb.thu - b.tkb.thu;
            });

            return ServiceResultBuilder.success("Lấy TKB sinh viên thành công", result);
        } catch (error) {
            console.error("Error getting TKB sinh vien:", error);
            return ServiceResultBuilder.failure("Lỗi khi lấy TKB sinh viên", "INTERNAL_ERROR");
        }
    }

    /**
     * Lấy TKB theo khoảng thời gian của sinh viên (giống GV)
     */
    async getTKBWeekly(
        sinh_vien_id: string,
        hoc_ky_id: string,
        dateStart: Date,
        dateEnd: Date
    ): Promise<ServiceResult<any[]>> {
        try {
            // ✅ Repository lo query
            const dangKyList = await this.uow.dangKyHocPhanRepository.findRegisteredWithFullInclude(
                sinh_vien_id,
                hoc_ky_id
            );

            if (!dangKyList || dangKyList.length === 0) {
                return ServiceResultBuilder.success("Chưa đăng ký lớp nào", []);
            }

            // ✅ Service chỉ lo map DTO
            const tkbItems: any[] = [];
            const startDate = new Date(dateStart);
            const endDate = new Date(dateEnd);

            for (const dk of dangKyList) {
                const lop = dk.lop_hoc_phan;

                if (!lop.lich_hoc_dinh_ky || lop.lich_hoc_dinh_ky.length === 0) {
                    continue;
                }

                for (const lich of lop.lich_hoc_dinh_ky) {
                    const currentDate = new Date(startDate);

                    while (currentDate <= endDate) {
                        const dayOfWeek = currentDate.getDay();
                        const thu = dayOfWeek === 0 ? 1 : dayOfWeek + 1;

                        if (thu === lich.thu) {
                            tkbItems.push({
                                thu: lich.thu,
                                tiet_bat_dau: lich.tiet_bat_dau,
                                tiet_ket_thuc: lich.tiet_ket_thuc,
                                phong: {
                                    id: lich.phong?.id || "",
                                    ma_phong: lich.phong?.ma_phong || "",
                                },
                                lop_hoc_phan: {
                                    id: lop.id,
                                    ma_lop: lop.ma_lop,
                                },
                                mon_hoc: {
                                    ma_mon: lop.hoc_phan.mon_hoc.ma_mon,
                                    ten_mon: lop.hoc_phan.mon_hoc.ten_mon,
                                },
                                giang_vien: lop.giang_vien?.users?.ho_ten || null,
                                ngay_hoc: new Date(currentDate),
                            });
                        }

                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                }
            }

            // Sắp xếp theo ngày + tiết
            tkbItems.sort((a, b) => {
                if (a.ngay_hoc && b.ngay_hoc) {
                    const dateCompare = a.ngay_hoc.getTime() - b.ngay_hoc.getTime();
                    if (dateCompare !== 0) return dateCompare;
                }
                return a.tiet_bat_dau - b.tiet_bat_dau;
            });

            return ServiceResultBuilder.success("Lấy TKB theo tuần thành công", tkbItems);
        } catch (error) {
            console.error("Error getting TKB weekly:", error);
            return ServiceResultBuilder.failure("Lỗi khi lấy TKB theo tuần", "INTERNAL_ERROR");
        }
    }
}
