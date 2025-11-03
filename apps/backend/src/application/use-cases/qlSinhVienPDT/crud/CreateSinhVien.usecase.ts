import { injectable, inject } from "inversify";
import { IUnitOfWork } from "../../../ports/qlSinhVienPDT/IUnitOfWork";
import { IPasswordHasher } from "../../../ports/qlSinhVienPDT/services/IPasswordHasher";
import { SinhVien } from "../../../../domain/entities/SinhVien.entity";
import { CreateSinhVienInputDTO, CreateSinhVienOutputDTO } from "../../../dtos/qlSinhVienPDT/crud/CreateSinhVien.dto";
import { ServiceResult, ServiceResultBuilder } from "../../../../types/serviceResult";

@injectable()
export class CreateSinhVienUseCase {
    constructor(
        @inject(IUnitOfWork) private unitOfWork: IUnitOfWork,
        @inject(IPasswordHasher) private passwordHasher: IPasswordHasher
    ) { }

    async execute(input: CreateSinhVienInputDTO): Promise<ServiceResult<CreateSinhVienOutputDTO>> {
        try {
            // Step 1: Validation (outside transaction)
            const existingTaiKhoan = await this.unitOfWork
                .getTaiKhoanRepository()
                .findByUsername(input.tenDangNhap);

            if (existingTaiKhoan) {
                return ServiceResultBuilder.failure("Tên đăng nhập đã tồn tại", "USERNAME_EXISTS");
            }

            const existingMssv = await this.unitOfWork
                .getSinhVienRepository()
                .findByMssv(input.maSoSinhVien);

            if (existingMssv) {
                return ServiceResultBuilder.failure("Mã số sinh viên đã tồn tại", "MSSV_EXISTS");
            }

            // Step 2: Resolve references
            const khoa = await this.unitOfWork
                .getKhoaRepository()
                .findById(input.maKhoa);

            if (!khoa) {
                return ServiceResultBuilder.failure(`Không tìm thấy khoa: ${input.maKhoa}`, "KHOA_NOT_FOUND");
            }

            const nganh = await this.unitOfWork
                .getNganhRepository()
                .findById(input.maNganh);

            if (!nganh) {                  
                return ServiceResultBuilder.failure(`Không tìm thấy ngành: ${input.maNganh}`, "NGANH_NOT_FOUND");
            }

            // Step 3: Hash password
            const hashedPassword = await this.passwordHasher.hash(input.matKhau);

            // Step 4: Transaction (direct Prisma queries, giống legacy)
            let sinhVienId: string;

            await this.unitOfWork.transaction(async (tx) => {
                // ✅ FIX: Use tx.tai_khoan (Prisma model), not tx.taiKhoanRepo
                const tk = await tx.tai_khoan.create({
                    data: {
                        ten_dang_nhap: input.tenDangNhap,
                        mat_khau: hashedPassword,
                        loai_tai_khoan: "sinh_vien",
                        trang_thai_hoat_dong: input.trangThaiHoatDong ?? true,
                    },
                });

                // ✅ FIX: Use tx.users (Prisma model), not tx.usersRepo
                const user = await tx.users.create({
                    data: {
                        ho_ten: input.hoTen,
                        tai_khoan_id: tk.id,
                        ma_nhan_vien: input.maSoSinhVien,
                        email: `${input.maSoSinhVien}@student.hcmue.edu.vn`,
                    },
                });

                // ✅ FIX: Use tx.sinh_vien (Prisma model), not tx.sinhVienRepo
                const sv = await tx.sinh_vien.create({
                    data: {
                        id: user.id,
                        ma_so_sinh_vien: input.maSoSinhVien,
                        khoa_id: khoa.id,
                        lop: input.lop ?? null,
                        khoa_hoc: input.khoaHoc ?? null,
                        ngay_nhap_hoc: input.ngayNhapHoc ? new Date(input.ngayNhapHoc) : null,
                        nganh_id: nganh.id,
                    },
                });

                sinhVienId = sv.id;
            });

            // Step 5: Return result
            const output: CreateSinhVienOutputDTO = {
                id: sinhVienId!,
                maSoSinhVien: input.maSoSinhVien,
                hoTen: input.hoTen,
                tenKhoa: khoa.tenKhoa,
                tenNganh: nganh.tenNganh,
                lop: input.lop,
                khoaHoc: input.khoaHoc,
            };

            return ServiceResultBuilder.success("Tạo sinh viên thành công", output);
        } catch (error: any) {
            console.error("[CreateSinhVienUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi tạo sinh viên",
                "CREATE_FAILED"
            );
        }
    }
}
