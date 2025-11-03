import { injectable, inject } from "inversify";
import { TYPES } from "../../../../infrastructure/di/types";
import { IUnitOfWork } from "../../../ports/qlSinhVienPDT/IUnitOfWork";
import { IPasswordHasher } from "../../../ports/qlSinhVienPDT/services/IPasswordHasher";
import { UpdateSinhVienInputDTO } from "../../../dtos/qlSinhVienPDT/crud/UpdateSinhVien.dto";
import { ServiceResult, ServiceResultBuilder } from "../../../../types/serviceResult";

@injectable()
export class UpdateSinhVienUseCase {
  constructor(
    @inject(TYPES.QlSinhVienPDT.IUnitOfWork) private unitOfWork: IUnitOfWork,
    @inject(TYPES.QlSinhVienPDT.IPasswordHasher) private passwordHasher: IPasswordHasher
  ) { }

  async execute(id: string, input: UpdateSinhVienInputDTO): Promise<ServiceResult<any>> {
    // Step 1: Check sinh vien exists
    const current = await this.unitOfWork.getSinhVienRepository().findById(id);
    if (!current) {
      return ServiceResultBuilder.failure("Không tìm thấy sinh viên", "SINH_VIEN_NOT_FOUND");
    }

    // Step 2: Hash password outside transaction (if provided)
    const newPassHash = input.matKhau
      ? await this.passwordHasher.hash(input.matKhau)
      : undefined;

    try {
      await this.unitOfWork.transaction(async (tx) => {
        // ✅ Get taiKhoanId from DB (since entity doesn't have it)
        const sinhVien = await tx.sinh_vien.findUnique({
          where: { id },
          include: { users: { include: { tai_khoan: true } } },
        });

        // 1) tai_khoan (chỉ update nếu có matKhau hoặc trangThaiHoatDong)
        if (newPassHash || typeof input.trangThaiHoatDong === "boolean") {
          const taiKhoanId = sinhVien?.users?.tai_khoan_id;
          if (!taiKhoanId) {
            throw new Error("Sinh viên không có tài khoản liên kết");
          }

          const patch: any = {};
          if (newPassHash) patch.mat_khau = newPassHash;
          if (typeof input.trangThaiHoatDong === "boolean")
            patch.trang_thai_hoat_dong = input.trangThaiHoatDong;

          // ✅ FIX: Uncomment this line!
          await tx.tai_khoan.update({ where: { id: taiKhoanId }, data: patch });
        }

        // 2) users (chỉ update nếu có hoTen)
        if (input.hoTen) {
          await tx.users.update({
            where: { id },
            data: { ho_ten: input.hoTen },
          });
        }

        // 3) sinh_vien
        await tx.sinh_vien.update({
          where: { id },
          data: {
            ma_so_sinh_vien: input.maSoSinhVien ?? undefined,
            khoa_id: input.khoaId ?? undefined,
            lop: input.lop ?? undefined,
            khoa_hoc: input.khoaHoc ?? undefined,
            ngay_nhap_hoc: input.ngayNhapHoc ? new Date(input.ngayNhapHoc) : undefined,
            nganh_id: input.nganhId ?? undefined,
          },
        });
      });

      const full = await this.unitOfWork.getSinhVienRepository().findById(id);
      return ServiceResultBuilder.success("Đã cập nhật sinh viên", full);
    } catch (err: any) {
      console.error("[UpdateSinhVienUseCase] Error:", err);
      return ServiceResultBuilder.failure(err?.message ?? "Cập nhật thất bại", "UPDATE_FAILED");
    }
  }
}