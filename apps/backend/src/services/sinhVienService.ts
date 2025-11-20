import bcrypt from "bcrypt";
import { UnitOfWork } from "../repositories/unitOfWork";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";
import {
  TCreateSinhVienDTO,
  TUpdateSinhVienDTO,
  MonHocGhiDanhForSinhVien,
  RequestGhiDanhMonHoc,
  MonHocDaGhiDanh,
} from "../dtos/sinhvienDTO";
import { CreateEmailSinhVienWithMaSinhVien } from "../utils/emailFormat";

const ROLE_SV = "sinh_vien";

export class SinhVienService {
  constructor(private uow: UnitOfWork) { }

  async list(page = 1, pageSize = 20, q?: string): Promise<ServiceResult<any>> {
    const { items, total } = await this.uow.sinhVienRepository.findPaged({
      page,
      pageSize,
      q,
    });
    return ServiceResultBuilder.success("OK", { items, total, page, pageSize });
  }

  async detail(id: string): Promise<ServiceResult<any>> {
    const row = await this.uow.sinhVienRepository.findById(id);
    if (!row) return ServiceResultBuilder.failure("Không tìm thấy sinh viên");
    return ServiceResultBuilder.success("OK", row);
  }

  async create(input: TCreateSinhVienDTO): Promise<ServiceResult<any>> {
    // 1) Checks & hash ở ngoài transaction
    const existedUser = await this.uow.taiKhoanRepository.findByUsername(
      input.ten_dang_nhap
    );
    if (existedUser)
      return ServiceResultBuilder.failure("Tên đăng nhập đã tồn tại");

    const existedMSSV = await this.uow.sinhVienRepository.findByMSSV(
      input.ma_so_sinh_vien
    );
    if (existedMSSV)
      return ServiceResultBuilder.failure("Mã số sinh viên đã tồn tại");

    const passHash = await bcrypt.hash(input.mat_khau, 10);

    try {
      // 2) Transaction chỉ còn 3 query DB, KHÔNG include
      const svId = await this.uow.transaction(async (tx) => {
        const tk = await tx.tai_khoan.create({
          data: {
            ten_dang_nhap: input.ten_dang_nhap,
            mat_khau: passHash,
            loai_tai_khoan: ROLE_SV,
            trang_thai_hoat_dong: input.trang_thai_hoat_dong ?? true,
          },
        });

        const emailSinhVien = CreateEmailSinhVienWithMaSinhVien(input.ma_so_sinh_vien);

        const user = await tx.users.create({
          data: {
            ho_ten: input.ho_ten,
            tai_khoan_id: tk.id,
            ma_nhan_vien: input.ma_so_sinh_vien,
            email: emailSinhVien,
          },
        });

        const sv = await tx.sinh_vien.create({
          data: {
            id: user.id,
            ma_so_sinh_vien: input.ma_so_sinh_vien,
            khoa_id: input.khoa_id,
            lop: input.lop ?? null,
            khoa_hoc: input.khoa_hoc ?? null,
            ngay_nhap_hoc: input.ngay_nhap_hoc
              ? new Date(input.ngay_nhap_hoc)
              : null,
            nganh_id: input.nganh_id ?? null,
          },
        });

        return sv.id;
      });

      // 3) Load đầy đủ SAU transaction (thoải mái include)
      const full = await this.uow.sinhVienRepository.findById(svId);
      return ServiceResultBuilder.success("Đã tạo sinh viên", full);
    } catch (err: any) {
      return ServiceResultBuilder.failure(err?.message ?? "Tạo thất bại");
    }
  }

  async update(
    id: string,
    input: TUpdateSinhVienDTO
  ): Promise<ServiceResult<any>> {
    const current = await this.uow.sinhVienRepository.findById(id);
    if (!current)
      return ServiceResultBuilder.failure("Không tìm thấy sinh viên");

    // Chuẩn bị hash ở ngoài transaction (nếu có)
    const newPassHash = input.mat_khau
      ? await bcrypt.hash(input.mat_khau, 10)
      : undefined;

    try {
      await this.uow.transaction(async (tx) => {
        // 1) tai_khoan
        if (newPassHash || typeof input.trang_thai_hoat_dong === "boolean") {
          const taiKhoanId = current.users?.tai_khoan_id;
          if (!taiKhoanId)
            throw new Error("Sinh viên không có tài khoản liên kết");

          const patch: any = {};
          if (newPassHash) patch.mat_khau = newPassHash;
          if (typeof input.trang_thai_hoat_dong === "boolean")
            patch.trang_thai_hoat_dong = input.trang_thai_hoat_dong;

          await tx.tai_khoan.update({ where: { id: taiKhoanId }, data: patch });
        }

        // 2) users
        if (input.ho_ten) {
          await tx.users.update({
            where: { id },
            data: { ho_ten: input.ho_ten },
          });
        }

        // 3) sinh_vien (KHÔNG include ở đây)
        await tx.sinh_vien.update({
          where: { id },
          data: {
            ma_so_sinh_vien: input.ma_so_sinh_vien ?? undefined,
            khoa_id: input.khoa_id ?? undefined,
            lop: input.lop ?? undefined,
            khoa_hoc: input.khoa_hoc ?? undefined,
            ngay_nhap_hoc: input.ngay_nhap_hoc
              ? new Date(input.ngay_nhap_hoc)
              : undefined,
            nganh_id: input.nganh_id ?? undefined,
          },
        });
      });

      // Load đầy đủ SAU transaction
      const full = await this.uow.sinhVienRepository.findById(id);
      return ServiceResultBuilder.success("Đã cập nhật sinh viên", full);
    } catch (err: any) {
      return ServiceResultBuilder.failure(err?.message ?? "Cập nhật thất bại");
    }
  }

  async remove(id: string): Promise<ServiceResult<any>> {
    const current = await this.uow.sinhVienRepository.findById(id);
    if (!current)
      return ServiceResultBuilder.failure("Không tìm thấy sinh viên");

    // LƯU Ý QUAN HỆ: users.tai_khoan_id (ON DELETE CASCADE) & sinh_vien.id -> users.id (ON DELETE CASCADE).
    // Xóa tai_khoan sẽ cascade xóa users → cascade xóa sinh_vien.
    const taiKhoanId = current.users?.tai_khoan_id;
    if (!taiKhoanId)
      return ServiceResultBuilder.failure(
        "Sinh viên không có tài khoản liên kết"
      );

    try {
      await this.uow.transaction(async (tx) => {
        await tx.tai_khoan.delete({ where: { id: taiKhoanId } });
      });
      return ServiceResultBuilder.success("Đã xóa tài khoản sinh viên");
    } catch (err: any) {
      return ServiceResultBuilder.failure(err?.message ?? "Xóa thất bại");
    }
  }

  /**
   * Lấy danh sách môn học ghi danh cho sinh viên
   * Chỉ lấy học phần đang mở (trang_thai_mo = true)
   */
  async getMonHocGhiDanh(
    hocKyId?: string
  ): Promise<ServiceResult<MonHocGhiDanhForSinhVien[]>> {
    try {
      // Step 1: Lấy học kỳ hiện hành nếu không truyền hocKyId
      let targetHocKyId = hocKyId;
      if (!targetHocKyId) {
        const hocKyHienHanh = await this.uow.hocKyRepository.findHocKyHienHanh();
        if (!hocKyHienHanh) {
          return ServiceResultBuilder.failure(
            "Không có học kỳ hiện hành",
            "HOC_KY_HIEN_HANH_NOT_FOUND"
          );
        }
        targetHocKyId = hocKyHienHanh.id;
      }

      // Step 2: Lấy tất cả học phần đang mở
      const hocPhanList = await this.uow.hocPhanRepository.findAllWithRelations({
        id_hoc_ky: targetHocKyId,
        trang_thai_mo: true,
      });

      // Step 3: Map sang DTO
      const data: MonHocGhiDanhForSinhVien[] = hocPhanList.map((hp: any) => {
        // Lấy giảng viên từ de_xuat_hoc_phan
        const deXuat = hp.mon_hoc?.de_xuat_hoc_phan?.[0];
        const tenGiangVien = deXuat?.giang_vien?.users?.ho_ten || "Chưa có giảng viên";


        return {
          id: hp.id,
          maMonHoc: hp.mon_hoc?.ma_mon || "",
          tenMonHoc: hp.mon_hoc?.ten_mon || "",
          soTinChi: hp.mon_hoc?.so_tin_chi || 0,
          tenKhoa: hp.mon_hoc?.khoa?.ten_khoa || "",
          tenGiangVien,
        };
      });

      return ServiceResultBuilder.success(
        "Lấy danh sách môn học ghi danh thành công",
        data
      );
    } catch (error) {
      console.error("Error getting mon hoc ghi danh:", error);
      return ServiceResultBuilder.failure(
        "Lỗi hệ thống khi lấy danh sách môn học",
        "INTERNAL_ERROR"
      );
    }
  }

  /**
   * Ghi danh môn học
   * @param request - { id: hoc_phan_id }
   * @param sinhVienId - ID của sinh viên (lấy từ auth token)
   */
  async ghiDanhMonHoc(
    request: RequestGhiDanhMonHoc,
    sinhVienId: string
  ): Promise<ServiceResult<null>> {
    try {
      // Step 1: Kiểm tra học phần tồn tại và đang mở
      const hocPhan = await this.uow.hocPhanRepository.findById(request.monHocId);
      if (!hocPhan) {
        return ServiceResultBuilder.failure(
          "Không tìm thấy học phần",
          "HOC_PHAN_NOT_FOUND"
        );
      }

      if (!hocPhan.trang_thai_mo) {
        return ServiceResultBuilder.failure(
          "Học phần đã đóng, không thể ghi danh",
          "HOC_PHAN_CLOSED"
        );
      }

      // Step 2: Kiểm tra sinh viên đã ghi danh chưa
      const isAlreadyRegistered = await this.uow.ghiDanhHocPhanRepository.isAlreadyRegistered(
        sinhVienId,
        request.monHocId
      );

      if (isAlreadyRegistered) {
        return ServiceResultBuilder.failure(
          "Bạn đã ghi danh học phần này rồi",
          "ALREADY_REGISTERED"
        );
      }

      // Step 3: Tạo bản ghi ghi danh
      await this.uow.ghiDanhHocPhanRepository.create({
        sinh_vien_id: sinhVienId,
        hoc_phan_id: request.monHocId,
        trang_thai: "da_ghi_danh",
      });

      return ServiceResultBuilder.success("Ghi danh môn học thành công", null);
    } catch (error) {
      console.error("Error ghi danh mon hoc:", error);
      return ServiceResultBuilder.failure(
        "Lỗi hệ thống khi ghi danh môn học",
        "INTERNAL_ERROR"
      );
    }
  }

  /**
 * Lấy danh sách môn học đã ghi danh
 * @param sinhVienId - ID sinh viên
 */
  async getDanhSachDaGhiDanh(
    sinhVienId: string
  ): Promise<ServiceResult<MonHocDaGhiDanh[]>> {
    try {
      // Lấy danh sách ghi danh với relations
      const ghiDanhList = await this.uow.ghiDanhHocPhanRepository.findBySinhVienWithRelations(
        sinhVienId
      );

      // Map sang DTO theo format FE yêu cầu
      const data: MonHocDaGhiDanh[] = ghiDanhList.map((item: any) => {
        const monHoc = item.hoc_phan?.mon_hoc;
        const deXuat = monHoc?.de_xuat_hoc_phan?.[0];
        const giangVien = deXuat?.giang_vien?.users?.ho_ten;

        return {
          ghiDanhId: item.id, // ✅ ID của record ghi_danh_hoc_phan
          monHocId: monHoc?.id || "",
          maMonHoc: monHoc?.ma_mon || "",
          tenMonHoc: monHoc?.ten_mon || "",
          soTinChi: monHoc?.so_tin_chi || 0,
          tenKhoa: monHoc?.khoa?.ten_khoa || "",
          tenGiangVien: giangVien || undefined,
        };
      });

      return ServiceResultBuilder.success(
        `Lấy thành công ${data.length} môn học đã ghi danh`,
        data
      );
    } catch (error) {
      console.error("Error getting danh sach da ghi danh:", error);
      return ServiceResultBuilder.failure(
        "Lỗi hệ thống khi lấy danh sách môn học đã ghi danh",
        "INTERNAL_ERROR"
      );
    }
  }

  /**
 * Hủy nhiều ghi danh môn học cùng lúc
 * @param ghiDanhIds - Danh sách ID của bảng ghi_danh_hoc_phan
 * @param sinhVienId - ID của sinh viên (lấy từ auth token)
 */
  async huyGhiDanhMonHoc(
    ghiDanhIds: string[],
    sinhVienId: string
  ): Promise<ServiceResult<null>> {
    try {
      // Validate input
      if (!ghiDanhIds || ghiDanhIds.length === 0) {
        return ServiceResultBuilder.failure(
          "Danh sách ghi danh không được để trống",
          "INVALID_INPUT"
        );
      }

      // Step 1: Lấy tất cả bản ghi ghi danh
      const ghiDanhList = await this.uow.ghiDanhHocPhanRepository.findByIds(ghiDanhIds);

      if (ghiDanhList.length === 0) {
        return ServiceResultBuilder.failure(
          "Không tìm thấy bản ghi ghi danh nào",
          "NOT_FOUND"
        );
      }

      // Step 2: Kiểm tra tất cả bản ghi có thuộc về sinh viên này không
      const invalidRecords = ghiDanhList.filter(
        (item) => item.sinh_vien_id !== sinhVienId
      );

      if (invalidRecords.length > 0) {
        return ServiceResultBuilder.failure(
          "Bạn không có quyền hủy các bản ghi này",
          "UNAUTHORIZED"
        );
      }

      // Step 3: Kiểm tra trạng thái (chỉ cho phép hủy khi "da_ghi_danh")
      const invalidStatus = ghiDanhList.filter(
        (item) => item.trang_thai !== "da_ghi_danh"
      );

      if (invalidStatus.length > 0) {
        return ServiceResultBuilder.failure(
          `Không thể hủy ghi danh ở trạng thái khác "da_ghi_danh"`,
          "INVALID_STATUS_FOR_CANCEL"
        );
      }

      // Step 4: Xóa tất cả bản ghi
      await this.uow.ghiDanhHocPhanRepository.deleteMany(ghiDanhIds);

      return ServiceResultBuilder.success(
        `Hủy thành công ${ghiDanhList.length} môn học`,
        null
      );
    } catch (error) {
      console.error("Error huy ghi danh mon hoc:", error);
      return ServiceResultBuilder.failure(
        "Lỗi hệ thống khi hủy ghi danh môn học",
        "INTERNAL_ERROR"
      );
    }
  }
}
