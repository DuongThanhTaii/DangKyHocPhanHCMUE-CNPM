import { UnitOfWork } from "../repositories/unitOfWork";
import { ThoiKhoaBieuRepository } from "../repositories/mongo/thoiKhoaBieuRepository";
import { CheckTrangThaiForSinhVien } from "./CheckTrangThaiForSinhVien";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";
import { DanhSachLopHocPhanDTO, MonHocInfoDTO, TKBItemDTO } from "../dtos/lopHocPhanSinhVienDTO";

export class LopHocPhanSinhVienService {
    private uow = UnitOfWork.getInstance();
    private tkbRepo = new ThoiKhoaBieuRepository();
    private checkService = new CheckTrangThaiForSinhVien(this.uow);

    /**
     * Check phase đăng ký học phần
     */
    async checkPhaseDangKyHocPhan(hocKyId: string): Promise<ServiceResult<null>> {
        return this.checkService.checkPhaseDangKyHocPhan(hocKyId);
    }

    /**
     * Load danh sách lớp học phần (phân cụm) - Filter đã đăng ký
     */
    async getDanhSachLopHocPhan(sinhVienId: string, hocKyId: string): Promise<ServiceResult<DanhSachLopHocPhanDTO>> {
        try {
            const registeredIds = await this.uow.dangKyHocPhanRepository.findRegisteredLopHocPhanIds(sinhVienId, hocKyId);
            const registeredSet = new Set(registeredIds);

            const lopHocPhans = await this.uow.lopHocPhanRepository.findByHocKyForSinhVien(hocKyId);

            const maHocPhans = Array.from(new Set(
                lopHocPhans
                    .map((lhp: any) => lhp.hoc_phan?.mon_hoc?.ma_mon)
                    .filter((ma: any): ma is string => typeof ma === 'string')
            )) as string[];
            const tkbList = await this.tkbRepo.findByMaHocPhans(maHocPhans, hocKyId);
            const tkbMap = new Map(tkbList.map((t: any) => [t.maHocPhan, t.danhSachLop]));
            const phongIds = tkbList
                .flatMap((t: any) => t.danhSachLop.map((d: any) => d.phongHocId as string))
                .filter((id): id is string => Boolean(id));
            const phongMap = await this.uow.phongRepository.getTenPhongByIds(phongIds);

            const monHocMap = new Map<string, any>();

            for (const lhp of lopHocPhans) {
                if (registeredSet.has(lhp.id)) continue;

                const monHoc = lhp.hoc_phan.mon_hoc;
                if (!monHocMap.has(monHoc.id)) {
                    monHocMap.set(monHoc.id, {
                        maMon: monHoc.ma_mon,
                        tenMon: monHoc.ten_mon,
                        soTinChi: monHoc.so_tin_chi,
                        laMonChung: monHoc.la_mon_chung,
                        loaiMon: monHoc.loai_mon,
                        danhSachLop: [],
                    });
                }

                const tkbData = tkbMap.get(monHoc.ma_mon) || [];
                const tkbForLop = tkbData.filter((t: any) => t.tenLop === lhp.ma_lop);
                const tkb: TKBItemDTO[] = tkbForLop.map((t: any) => {
                    const phong = phongMap.get(t.phongHocId) || "";
                    const thu = this.getThuName(t.thuTrongTuan);
                    const tiet = `${t.tietBatDau} - ${t.tietKetThuc}`;
                    const ngayBatDau = new Date(t.ngayBatDau).toLocaleDateString("vi-VN");
                    const ngayKetThuc = new Date(t.ngayKetThuc).toLocaleDateString("vi-VN");
                    const gv = lhp.giang_vien?.users?.ho_ten || "Chưa phân công";

                    return {
                        thu: t.thuTrongTuan,
                        tiet,
                        phong,
                        giangVien: gv,
                        ngayBatDau,
                        ngayKetThuc,
                        formatted: `${thu}, Tiết(${tiet}), ${phong}, ${gv}\n(${ngayBatDau} -> ${ngayKetThuc})`,
                    };
                });

                monHocMap.get(monHoc.id).danhSachLop.push({
                    id: lhp.id,
                    maLop: lhp.ma_lop,
                    tenLop: lhp.ma_lop,
                    soLuongHienTai: lhp.so_luong_hien_tai,
                    soLuongToiDa: lhp.so_luong_toi_da,
                    tkb,
                });
            }

            const monChung: MonHocInfoDTO[] = [];
            const batBuoc: MonHocInfoDTO[] = [];
            const tuChon: MonHocInfoDTO[] = [];

            for (const mh of monHocMap.values()) {
                const dto: MonHocInfoDTO = {
                    maMon: mh.maMon,
                    tenMon: mh.tenMon,
                    soTinChi: mh.soTinChi,
                    danhSachLop: mh.danhSachLop,
                };

                if (mh.laMonChung) {
                    monChung.push(dto);
                } else if (mh.loaiMon === "chuyen_nganh") {
                    batBuoc.push(dto);
                } else {
                    tuChon.push(dto);
                }
            }

            return ServiceResultBuilder.success("Lấy danh sách lớp học phần thành công", {
                monChung,
                batBuoc,
                tuChon,
            });
        } catch (error) {
            console.error("Error getting danh sach lop:", error);
            return ServiceResultBuilder.failure("Lỗi khi lấy danh sách lớp học phần", "INTERNAL_ERROR");
        }
    }

    /**
     * Load danh sách lớp đã đăng ký (format giống getDanhSachLopHocPhan)
     */
    async getDanhSachLopDaDangKy(sinhVienId: string, hocKyId: string): Promise<ServiceResult<MonHocInfoDTO[]>> {
        try {
            const dangKys = await this.uow.dangKyHocPhanRepository.findBySinhVienAndHocKy(sinhVienId, hocKyId);

            const maHocPhans = Array.from(new Set(
                dangKys
                    .map((dk: any) => dk.lop_hoc_phan?.hoc_phan?.mon_hoc?.ma_mon)
                    .filter((ma: any): ma is string => typeof ma === 'string')
            )) as string[];
            const tkbList = await this.tkbRepo.findByMaHocPhans(maHocPhans, hocKyId);
            const tkbMap = new Map(tkbList.map((t: any) => [t.maHocPhan, t.danhSachLop]));
            const phongIds = tkbList
                .flatMap((t: any) => t.danhSachLop.map((d: any) => d.phongHocId as string))
                .filter((id): id is string => Boolean(id));
            const phongMap = await this.uow.phongRepository.getTenPhongByIds(phongIds);

            const monHocMap = new Map<string, any>();

            for (const dk of dangKys) {
                const lhp = dk.lop_hoc_phan;
                const monHoc = lhp.hoc_phan.mon_hoc;

                if (!monHocMap.has(monHoc.id)) {
                    monHocMap.set(monHoc.id, {
                        maMon: monHoc.ma_mon,
                        tenMon: monHoc.ten_mon,
                        soTinChi: monHoc.so_tin_chi,
                        danhSachLop: [],
                    });
                }

                const tkbData = tkbMap.get(monHoc.ma_mon) || [];
                const tkbForLop = tkbData.filter((t: any) => t.tenLop === lhp.ma_lop);
                const tkb: TKBItemDTO[] = tkbForLop.map((t: any) => {
                    const phong = phongMap.get(t.phongHocId) || "";
                    const thu = this.getThuName(t.thuTrongTuan);
                    const tiet = `${t.tietBatDau} - ${t.tietKetThuc}`;
                    const ngayBatDau = new Date(t.ngayBatDau).toLocaleDateString("vi-VN");
                    const ngayKetThuc = new Date(t.ngayKetThuc).toLocaleDateString("vi-VN");
                    const gv = lhp.giang_vien?.users?.ho_ten || "Chưa phân công";

                    return {
                        thu: t.thuTrongTuan,
                        tiet,
                        phong,
                        giangVien: gv,
                        ngayBatDau,
                        ngayKetThuc,
                        formatted: `${thu}, Tiết(${tiet}), ${phong}, ${gv}\n(${ngayBatDau} -> ${ngayKetThuc})`,
                    };
                });

                monHocMap.get(monHoc.id).danhSachLop.push({
                    id: lhp.id,
                    maLop: lhp.ma_lop,
                    tenLop: lhp.ma_lop,
                    soLuongHienTai: lhp.so_luong_hien_tai,
                    soLuongToiDa: lhp.so_luong_toi_da,
                    tkb,
                });
            }

            const result: MonHocInfoDTO[] = Array.from(monHocMap.values());

            return ServiceResultBuilder.success("Lấy danh sách lớp đã đăng ký thành công", result);
        } catch (error) {
            console.error("Error getting lop da dang ky:", error);
            return ServiceResultBuilder.failure("Lỗi khi lấy danh sách lớp đã đăng ký", "INTERNAL_ERROR");
        }
    }

    /**
     * Load danh sách lớp học phần của 1 môn mà sinh viên chưa đăng ký
     */
    async getDanhSachLopChuaDangKyByMonHoc(
        sinh_vien_id: string,
        mon_hoc_id: string,
        hoc_ky_id: string
    ): Promise<ServiceResult<any>> {
        try {
            // Lấy tất cả lớp học phần của môn trong học kỳ
            const allLops = await this.uow.lopHocPhanRepository.findByMonHocAndHocKy(mon_hoc_id, hoc_ky_id);

            // Lấy danh sách lớp đã đăng ký
            const registeredLopIds = await this.uow.dangKyHocPhanRepository.findRegisteredLopHocPhanIds(
                sinh_vien_id,
                hoc_ky_id
            );

            // Filter ra các lớp chưa đăng ký
            const lopsChuaDangKy = allLops.filter(
                (lop: any) => !registeredLopIds.includes(lop.id)
            );

            if (lopsChuaDangKy.length === 0) {
                return ServiceResultBuilder.success("Không có lớp nào", []);
            }

            // Lấy TKB từ MongoDB
            const maMon = lopsChuaDangKy[0].hoc_phan.mon_hoc.ma_mon;
            const tkb = await this.tkbRepo.findByMaHocPhanAndHocKy(maMon, hoc_ky_id);

            // Lấy phòng học
            const phongIds = tkb?.danhSachLop
                .map((l: any) => l.phongHocId)
                .filter((id: any): id is string => Boolean(id)) || [];
            const phongMap = await this.uow.phongRepository.getTenPhongByIds(phongIds);

            // Map data với TKB
            const result = lopsChuaDangKy.map((lop: any) => {
                const tkbLop = tkb?.danhSachLop.find((l: any) => l.tenLop === lop.ma_lop) || null;

                return {
                    id: lop.id,
                    maLop: lop.ma_lop,
                    tenLop: lop.ma_lop,
                    soLuongHienTai: lop.so_luong_hien_tai || 0,
                    soLuongToiDa: lop.so_luong_toi_da || 50,
                    giangVien: lop.giang_vien?.users?.ho_ten || "Chưa có",
                    tkb: tkbLop
                        ? [
                            {
                                thu: tkbLop.thuTrongTuan ?? 2,
                                tiet: `${tkbLop.tietBatDau} - ${tkbLop.tietKetThuc}`,
                                phong: phongMap.get(tkbLop.phongHocId ?? "") || "N/A",
                                giangVien: lop.giang_vien?.users?.ho_ten || "N/A",
                                ngayBatDau: new Date(tkbLop.ngayBatDau).toLocaleDateString("vi-VN"),
                                ngayKetThuc: new Date(tkbLop.ngayKetThuc).toLocaleDateString("vi-VN"),
                                formatted: `${this.getThuName(tkbLop.thuTrongTuan ?? 2)}, Tiết(${tkbLop.tietBatDau} - ${tkbLop.tietKetThuc}), ${phongMap.get(tkbLop.phongHocId ?? "") || "N/A"}, ${lop.giang_vien?.users?.ho_ten || "N/A"}\n(${new Date(tkbLop.ngayBatDau).toLocaleDateString("vi-VN")} -> ${new Date(tkbLop.ngayKetThuc).toLocaleDateString("vi-VN")})`,
                            },
                        ]
                        : [],
                };
            });

            return ServiceResultBuilder.success(
                "Lấy danh sách lớp chưa đăng ký thành công",
                result
            );
        } catch (error) {
            console.error("Error get danh sach lop chua dang ky by mon hoc:", error);
            return ServiceResultBuilder.failure(
                "Lỗi khi lấy danh sách lớp chưa đăng ký",
                "INTERNAL_ERROR"
            );
        }
    }

    /**
     * Tra cứu học phần - Lấy tất cả lớp học phần của học kỳ (kèm TKB)
     */
    async traCuuHocPhan(hoc_ky_id: string): Promise<ServiceResult<any[]>> {
        try {
            // ✅ Repository lo query
            const lopHocPhans = await this.uow.lopHocPhanRepository.findAllByHocKyWithDetails(hoc_ky_id);

            // ✅ Service chỉ lo map DTO
            const monHocMap = new Map<string, any>();

            lopHocPhans.forEach((lop: any) => {
                const maMon = lop.hoc_phan.mon_hoc.ma_mon;

                if (!monHocMap.has(maMon)) {
                    monHocMap.set(maMon, {
                        maMon: lop.hoc_phan.mon_hoc.ma_mon,
                        tenMon: lop.hoc_phan.mon_hoc.ten_mon,
                        soTinChi: lop.hoc_phan.mon_hoc.so_tin_chi,
                        loaiMon: lop.hoc_phan.mon_hoc.loai_mon,
                        danhSachLop: [],
                    });
                }

                // Format TKB thành string
                const tkbFormatted = lop.lich_hoc_dinh_ky
                    .map((lich: any) => {
                        const thu = this.getThuName(lich.thu);
                        const tiet = `${lich.tiet_bat_dau} - ${lich.tiet_ket_thuc}`;
                        const phong = lich.phong?.ma_phong || "TBA";
                        return `${thu}, Tiết(${tiet}), ${phong}`;
                    })
                    .join("\n");

                monHocMap.get(maMon)!.danhSachLop.push({
                    id: lop.id,
                    maLop: lop.ma_lop,
                    giangVien: lop.giang_vien?.users?.ho_ten || "Chưa phân công",
                    soLuongToiDa: lop.so_luong_toi_da,
                    soLuongHienTai: lop.so_luong_hien_tai,
                    conSlot: lop.so_luong_toi_da - lop.so_luong_hien_tai,
                    thoiKhoaBieu: tkbFormatted || "Chưa có lịch",
                });
            });

            // Convert Map to Array và đánh STT
            const result = Array.from(monHocMap.values()).map((item, index) => ({
                stt: index + 1,
                ...item,
            }));

            return ServiceResultBuilder.success("Tra cứu học phần thành công", result);
        } catch (error) {
            console.error("Error tra cuu hoc phan:", error);
            return ServiceResultBuilder.failure("Lỗi khi tra cứu học phần", "INTERNAL_ERROR");
        }
    }

    // Helper method
    private getThuName(thu: number): string {
        const thuMap: { [key: number]: string } = {
            1: "Chủ Nhật",
            2: "Thứ Hai",
            3: "Thứ Ba",
            4: "Thứ Tư",
            5: "Thứ Năm",
            6: "Thứ Sáu",
            7: "Thứ Bảy",
        };
        return thuMap[thu] || "N/A";
    }
}
