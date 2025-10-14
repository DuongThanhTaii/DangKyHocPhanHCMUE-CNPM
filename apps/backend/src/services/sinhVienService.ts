import bcrypt from "bcrypt";
import { UnitOfWork } from "../repositories/unitOfWork";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";
import { TCreateSinhVienDTO, TUpdateSinhVienDTO } from "../dtos/sinhvienDTO";

const ROLE_SV = "sinh_vien";

export class SinhVienService {
  constructor(private uow: UnitOfWork) {}

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

        const user = await tx.users.create({
          data: {
            ho_ten: input.ho_ten,
            tai_khoan_id: tk.id,
            ma_nhan_vien: input.ma_so_sinh_vien,
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
}
