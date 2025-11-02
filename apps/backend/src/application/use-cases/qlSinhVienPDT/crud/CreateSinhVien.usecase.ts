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
                .findByMaKhoa(input.maKhoa);

            if (!khoa) {
                return ServiceResultBuilder.failure(`Không tìm thấy khoa: ${input.maKhoa}`, "KHOA_NOT_FOUND");
            }

            const nganh = await this.unitOfWork
                .getNganhRepository()
                .findByMaNganh(input.maNganh);

            if (!nganh) {
                return ServiceResultBuilder.failure(`Không tìm thấy ngành: ${input.maNganh}`, "NGANH_NOT_FOUND");
            }

            // Step 3: Hash password
            const hashedPassword = await this.passwordHasher.hash(input.matKhau);

            // Step 4: Transaction
            let sinhVienId: string;

            await this.unitOfWork.transaction(async (repos) => {
                // Create tai_khoan
                const taiKhoanId = await repos.taiKhoanRepo.create({
                    tenDangNhap: input.tenDangNhap,
                    matKhau: hashedPassword,
                    loaiTaiKhoan: "sinh_vien",
                    trangThaiHoatDong: input.trangThaiHoatDong ?? true,
                });

                // Create users
                const userId = await repos.usersRepo.create({
                    id: taiKhoanId,
                    hoTen: input.hoTen,
                    taiKhoanId,
                    maNhanVien: input.maSoSinhVien,
                    email: `${input.maSoSinhVien}@student.hcmue.edu.vn`,
                });

                // Create sinh_vien entity
                const sinhVien = SinhVien.create({
                    id: userId,
                    maSoSinhVien: input.maSoSinhVien,
                    hoTen: input.hoTen,
                    khoaId: khoa.id,
                    nganhId: nganh.id,
                    lop: input.lop,
                    khoaHoc: input.khoaHoc,
                    ngayNhapHoc: input.ngayNhapHoc ? new Date(input.ngayNhapHoc) : null,
                });

                await repos.sinhVienRepo.create(sinhVien);
                sinhVienId = sinhVien.id;
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
