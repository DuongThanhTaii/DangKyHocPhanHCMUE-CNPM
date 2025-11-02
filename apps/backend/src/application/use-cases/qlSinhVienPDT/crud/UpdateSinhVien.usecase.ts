import { injectable, inject } from "inversify";
import { IUnitOfWork } from "../../../ports/qlSinhVienPDT/IUnitOfWork";
import { IPasswordHasher } from "../../../ports/qlSinhVienPDT/services/IPasswordHasher";
import { UpdateSinhVienInputDTO } from "../../../dtos/qlSinhVienPDT/crud/UpdateSinhVien.dto";
import { ServiceResult, ServiceResultBuilder } from "../../../../types/serviceResult";

@injectable()
export class UpdateSinhVienUseCase {
    constructor(
        @inject(IUnitOfWork) private unitOfWork: IUnitOfWork,
        @inject(IPasswordHasher) private passwordHasher: IPasswordHasher
    ) { }

    async execute(id: string, input: UpdateSinhVienInputDTO): Promise<ServiceResult<void>> {
        try {
            // Step 1: Find sinh vien
            const sinhVien = await this.unitOfWork.getSinhVienRepository().findById(id);

            if (!sinhVien) {
                return ServiceResultBuilder.failure("Không tìm thấy sinh viên", "SINH_VIEN_NOT_FOUND");
            }

            // Step 2: Resolve references if changed
            let khoaId = sinhVien.khoaId;
            let nganhId = sinhVien.nganhId;

            if (input.maKhoa) {
                const khoa = await this.unitOfWork.getKhoaRepository().findByMaKhoa(input.maKhoa);
                if (!khoa) {
                    return ServiceResultBuilder.failure(`Không tìm thấy khoa: ${input.maKhoa}`, "KHOA_NOT_FOUND");
                }
                khoaId = khoa.id;
            }

            if (input.maNganh) {
                const nganh = await this.unitOfWork.getNganhRepository().findByMaNganh(input.maNganh);
                if (!nganh) {
                    return ServiceResultBuilder.failure(`Không tìm thấy ngành: ${input.maNganh}`, "NGANH_NOT_FOUND");
                }
                nganhId = nganh.id;
            }

            // Step 3: Hash password if provided
            const hashedPassword = input.matKhau
                ? await this.passwordHasher.hash(input.matKhau)
                : undefined;

            // Step 4: Transaction
            await this.unitOfWork.transaction(async (repos) => {
                // Update sinh_vien entity
                sinhVien.update({
                    hoTen: input.hoTen,
                    khoaId,
                    nganhId,
                    lop: input.lop,
                    khoaHoc: input.khoaHoc,
                    ngayNhapHoc: input.ngayNhapHoc ? new Date(input.ngayNhapHoc) : undefined,
                });

                await repos.sinhVienRepo.update(sinhVien);

                // Update users if hoTen changed
                if (input.hoTen) {
                    await repos.usersRepo.update(id, { hoTen: input.hoTen });
                }

                // Update tai_khoan if password or status changed
                if (hashedPassword || input.trangThaiHoatDong !== undefined) {
                    const user = await repos.usersRepo.findById(id);
                    if (user) {
                        await repos.taiKhoanRepo.update(user.taiKhoanId, {
                            matKhau: hashedPassword,
                            trangThaiHoatDong: input.trangThaiHoatDong,
                        });
                    }
                }
            });

            return ServiceResultBuilder.success("Cập nhật sinh viên thành công");
        } catch (error: any) {
            console.error("[UpdateSinhVienUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi cập nhật sinh viên",
                "UPDATE_FAILED"
            );
        }
    }
}
