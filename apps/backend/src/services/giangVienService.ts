import { UnitOfWork } from "../repositories/unitOfWork";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";
import { TKBWeeklyItemDTO } from "../dtos/giangVienDTO";

export class GiangVienService {
    private uow = UnitOfWork.getInstance();

    /**
     * Kiểm tra giảng viên có quyền với lớp học phần
     */
    private async assertOwnsLHP(lhpId: string, gvUserId: string): Promise<void> {
        const lhp = await this.uow.lopHocPhanRepository.findById(lhpId);

        if (!lhp) {
            throw new Error("Lớp học phần không tồn tại");
        }

        if (lhp.giang_vien_id !== gvUserId) {
            throw new Error("Bạn không có quyền truy cập lớp học phần này");
        }
    }

    /**
     * Lấy danh sách lớp học phần của giảng viên
     */
    async getMyLopHocPhan(gvUserId: string): Promise<ServiceResult<any[]>> {
        try {
            const lops = await this.uow.lopHocPhanRepository.byGiangVien(gvUserId);
            return ServiceResultBuilder.success("Lấy danh sách lớp học phần thành công", lops);
        } catch (error) {
            console.error("Error getting lop hoc phan:", error);
            return ServiceResultBuilder.failure("Lỗi khi lấy danh sách lớp học phần", "INTERNAL_ERROR");
        }
    }

    /**
     * Lấy TKB theo khoảng thời gian của giảng viên
     */
    async getTKBWeekly(gvUserId: string, hocKyId: string, dateStart: Date, dateEnd: Date): Promise<ServiceResult<TKBWeeklyItemDTO[]>> {
        try {
            console.log('\n🔍 ====== DEBUG TKB WEEKLY ======');
            console.log('📅 Input params:');
            console.log('  - GV User ID:', gvUserId);
            console.log('  - Hoc Ky ID:', hocKyId);
            console.log('  - Date Start:', dateStart);
            console.log('  - Date End:', dateEnd);

            const lopHocPhans = await this.uow.lopHocPhanRepository.findByGiangVienAndHocKy(gvUserId, hocKyId);

            console.log('\n📚 Lớp học phần tìm được:', lopHocPhans.length);
            if (lopHocPhans.length === 0) {
                console.log('⚠️ KHÔNG CÓ LỚP HỌC PHẦN NÀO!');
                return ServiceResultBuilder.success("Lấy thời khóa biểu thành công", []);
            }

            lopHocPhans.forEach((lop: any, idx: number) => {
                console.log(`\n  Lớp ${idx + 1}:`);
                console.log(`    - ID: ${lop.id}`);
                console.log(`    - Mã lớp: ${lop.ma_lop}`);
                console.log(`    - Môn học: ${lop.hoc_phan?.mon_hoc?.ma_mon} - ${lop.hoc_phan?.mon_hoc?.ten_mon}`);
                console.log(`    - Số lịch học: ${lop.lich_hoc_dinh_ky?.length || 0}`);
            });

            const tkbItems: TKBWeeklyItemDTO[] = [];
            const startDate = new Date(dateStart);
            const endDate = new Date(dateEnd);

            console.log('\n⏰ Xử lý lịch học:');
            console.log(`  - Từ: ${startDate.toISOString()}`);
            console.log(`  - Đến: ${endDate.toISOString()}`);

            for (const lop of lopHocPhans) {
                console.log(`\n  📖 Processing lớp: ${lop.ma_lop}`);

                if (!lop.lich_hoc_dinh_ky || lop.lich_hoc_dinh_ky.length === 0) {
                    console.log('    ⚠️ Lớp này KHÔNG CÓ lịch học định kỳ!');
                    continue;
                }

                for (const lich of lop.lich_hoc_dinh_ky) {
                    console.log(`\n    📅 Lịch: Thứ ${lich.thu}, tiết ${lich.tiet_bat_dau}-${lich.tiet_ket_thuc}`);
                    console.log(`       Phòng: ${lich.phong?.ma_phong || 'Chưa có'}`);

                    let matchCount = 0;
                    const currentDate = new Date(startDate);

                    while (currentDate <= endDate) {
                        const dayOfWeek = currentDate.getDay();
                        const thu = dayOfWeek === 0 ? 1 : dayOfWeek + 1;

                        if (thu === lich.thu) {
                            matchCount++;
                            console.log(`       ✅ Match: ${currentDate.toISOString().split('T')[0]} (Thứ ${thu})`);

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
                                ngay_hoc: new Date(currentDate),
                            });
                        }

                        currentDate.setDate(currentDate.getDate() + 1);
                    }

                    console.log(`       📊 Tổng match: ${matchCount} buổi`);
                }
            }

            console.log('\n✅ Tổng số buổi học tìm được:', tkbItems.length);

            tkbItems.sort((a, b) => {
                if (a.ngay_hoc && b.ngay_hoc) {
                    const dateCompare = a.ngay_hoc.getTime() - b.ngay_hoc.getTime();
                    if (dateCompare !== 0) return dateCompare;
                }
                return a.tiet_bat_dau - b.tiet_bat_dau;
            });

            console.log('====== END DEBUG ======\n');

            return ServiceResultBuilder.success("Lấy thời khóa biểu thành công", tkbItems);
        } catch (error) {
            console.error("❌ Error getting TKB weekly:", error);
            return ServiceResultBuilder.failure("Lỗi khi lấy thời khóa biểu", "INTERNAL_ERROR");
        }
    }

    /**
     * Lấy chi tiết lớp học phần
     */
    async getLopHocPhanDetail(lhpId: string, gvUserId: string): Promise<ServiceResult<any>> {
        try {
            await this.assertOwnsLHP(lhpId, gvUserId);
            const lhp = await this.uow.lopHocPhanRepository.detail(lhpId);
            return ServiceResultBuilder.success("Lấy thông tin lớp học phần thành công", lhp);
        } catch (error: any) {
            console.error("Error getting lop hoc phan detail:", error);
            return ServiceResultBuilder.failure(error.message || "Lỗi khi lấy thông tin lớp học phần", "INTERNAL_ERROR");
        }
    }

    /**
     * Lấy danh sách sinh viên trong lớp
     */
    async getStudentsOfLHP(lhpId: string, gvUserId: string): Promise<ServiceResult<any[]>> {
        try {
            await this.assertOwnsLHP(lhpId, gvUserId);

            const students = await this.uow.lopHocPhanRepository.studentsOfLHP(lhpId);

            const data = students.map((d: any) => ({
                sinh_vien_id: d.sinh_vien_id,
                mssv: d.sinh_vien.ma_so_sinh_vien,
                ho_ten: d.sinh_vien.users.ho_ten,
                email: d.sinh_vien.users.email,
                lop: d.sinh_vien.lop,
                khoa: d.sinh_vien.khoa.ten_khoa,
                nganh: d.sinh_vien.nganh_hoc?.ten_nganh ?? null,
            }));

            return ServiceResultBuilder.success("Lấy danh sách sinh viên thành công", data);
        } catch (error: any) {
            console.error("Error getting students:", error);
            return ServiceResultBuilder.failure(error.message || "Lỗi khi lấy danh sách sinh viên", "INTERNAL_ERROR");
        }
    }
}
