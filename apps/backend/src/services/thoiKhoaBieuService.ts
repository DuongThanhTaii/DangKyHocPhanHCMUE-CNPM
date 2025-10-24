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
            console.log('🔍 Request data:', JSON.stringify(request, null, 2));
            console.log('📝 giangVienId:', request.giangVienId);

            // Step 1: Verify trợ lý khoa
            const troLyKhoa = await this.uow.troLyKhoaRepository.findById(userId);
            if (!troLyKhoa) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy trợ lý khoa",
                    "TRO_LY_KHOA_NOT_FOUND"
                );
            }

            // ✅ Step 1.5: Validate giảng viên nếu có
            if (request.giangVienId) {
                const giangVien = await this.uow.giangVienRepository.findById(request.giangVienId);
                if (!giangVien) {
                    return ServiceResultBuilder.failure(
                        "Giảng viên không tồn tại",
                        "GIANG_VIEN_NOT_FOUND"
                    );
                }
            }

            // Step 2: Lấy hoc_phan_id từ mon_hoc
            const monHoc = await this.uow.monHocRepository.findByMaMon(request.maHocPhan);

            if (!monHoc) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy môn học",
                    "MON_HOC_NOT_FOUND"
                );
            }

            const hocPhan = await this.uow.hocPhanRepository.findByMonHocAndHocKy(
                monHoc.id,
                request.hocKyId
            );

            if (!hocPhan) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy học phần trong học kỳ này",
                    "HOC_PHAN_NOT_FOUND"
                );
            }

            // Step 3: Check TKB đã tồn tại → Dùng upsert thay vì tạo mới
            const existingTKB = await this.tkbRepo.findByMaHocPhanAndHocKy(
                request.maHocPhan,
                request.hocKyId
            );

            const danhSachLop: DanhSachLop[] = request.danhSachLop.map(lop => ({
                tenLop: lop.tenLop,
                phongHocId: lop.phongHocId,
                ngayBatDau: new Date(lop.ngayBatDau),
                ngayKetThuc: new Date(lop.ngayKetThuc),
                tietBatDau: lop.tietBatDau,
                tietKetThuc: lop.tietKetThuc,
                thuTrongTuan: lop.thuTrongTuan,
            }));

            let tkbResult;

            if (existingTKB) {
                // ✅ Đã có TKB → Update bằng cách thêm lớp mới vào danhSachLop
                const mergedDanhSachLop = [...existingTKB.danhSachLop, ...danhSachLop];

                tkbResult = await this.tkbRepo.updateDanhSachLop(existingTKB.id, mergedDanhSachLop);
            } else {
                // ✅ Chưa có TKB → Tạo mới
                tkbResult = await this.tkbRepo.createTKBMonHoc(
                    request.maHocPhan,
                    request.hocKyId,
                    danhSachLop
                );
            }

            // Step 4: Tạo lop_hoc_phan trong PostgreSQL
            await this.uow.transaction(async (tx: any) => {
                const ngayBatDau = danhSachLop[0].ngayBatDau;
                const ngayKetThuc = danhSachLop[0].ngayKetThuc;

                for (const lop of danhSachLop) {
                    const existingLop = await tx.lop_hoc_phan.findFirst({
                        where: {
                            ma_lop: lop.tenLop,
                            hoc_phan_id: hocPhan.id,
                        },
                    });

                    let lopHocPhan;

                    if (!existingLop) {
                        console.log('✅ Creating lop_hoc_phan with giangVienId:', request.giangVienId);

                        lopHocPhan = await tx.lop_hoc_phan.create({
                            data: {
                                ma_lop: lop.tenLop,
                                hoc_phan_id: hocPhan.id,
                                giang_vien_id: request.giangVienId || null,
                                phong_mac_dinh_id: lop.phongHocId,
                                so_luong_toi_da: request.soLuongToiDa || 50,
                                so_luong_hien_tai: 0,
                                trang_thai_lop: 'dang_mo',
                                ngay_bat_dau: ngayBatDau,
                                ngay_ket_thuc: ngayKetThuc,
                            },
                        });

                        console.log('✅ Created lop:', lopHocPhan);
                    } else {
                        lopHocPhan = existingLop;
                    }

                    const existingLich = await tx.lich_hoc_dinh_ky.findFirst({
                        where: {
                            lop_hoc_phan_id: lopHocPhan.id,
                            thu: lop.thuTrongTuan,
                            tiet_bat_dau: lop.tietBatDau,
                            tiet_ket_thuc: lop.tietKetThuc,
                            phong_id: lop.phongHocId,
                        },
                    });

                    if (!existingLich) {
                        await tx.lich_hoc_dinh_ky.create({
                            data: {
                                lop_hoc_phan_id: lopHocPhan.id,
                                thu: lop.thuTrongTuan,
                                tiet_bat_dau: lop.tietBatDau,
                                tiet_ket_thuc: lop.tietKetThuc,
                                phong_id: lop.phongHocId,
                            },
                        });
                    }
                }
            });

            // Step 5: Mark phòng học đã được sử dụng
            const phongIds = request.danhSachLop.map(lop => lop.phongHocId);
            await this.uow.phongRepository.markRoomsAsUsed(phongIds);

            return ServiceResultBuilder.success(
                existingTKB ? "Cập nhật thời khóa biểu thành công" : "Xếp thời khóa biểu thành công",
                tkbResult
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
                    ngayBatDau: lop.ngayBatDau instanceof Date ? lop.ngayBatDau : new Date(lop.ngayBatDau),
                    ngayKetThuc: lop.ngayKetThuc instanceof Date ? lop.ngayKetThuc : new Date(lop.ngayKetThuc),
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
                    ngayBatDau: lop.ngayBatDau instanceof Date ? lop.ngayBatDau : new Date(lop.ngayBatDau),
                    ngayKetThuc: lop.ngayKetThuc instanceof Date ? lop.ngayKetThuc : new Date(lop.ngayKetThuc),
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
                    ngayBatDau: lop.ngayBatDau instanceof Date ? lop.ngayBatDau : new Date(lop.ngayBatDau),
                    ngayKetThuc: lop.ngayKetThuc instanceof Date ? lop.ngayKetThuc : new Date(lop.ngayKetThuc),
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
