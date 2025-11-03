import { injectable, inject } from "inversify";
import { TYPES } from "../../../../infrastructure/di/types";
import { IUnitOfWork } from "../../../ports/qlSinhVienPDT/IUnitOfWork";
import { IPasswordHasher } from "../../../ports/qlSinhVienPDT/services/IPasswordHasher";
import { ServiceResult, ServiceResultBuilder } from "../../../../types/serviceResult";

interface ImportRecord {
    maSoSinhVien: string;
    hoTen: string;
    maKhoa: string;
    maNganh: string;
    lop?: string;
    khoaHoc?: string;
    ngayNhapHoc?: Date;
}

interface ImportSummary {
    total: number;
    created: number;
    failed: number;
    skipped: number;
}

interface ImportResultItem {
    row: number;
    status: "success" | "failed" | "skipped";
    key?: string;
    error?: string;
}

@injectable()
export class ImportSinhVienUseCase {
    constructor(
        @inject(TYPES.QlSinhVienPDT.IUnitOfWork) private unitOfWork: IUnitOfWork,
        @inject(TYPES.QlSinhVienPDT.IPasswordHasher) private passwordHasher: IPasswordHasher
    ) { }

    async execute(records: ImportRecord[]): Promise<ServiceResult<{ summary: ImportSummary; results: ImportResultItem[] }>> {
        try {
            if (!records || records.length === 0) {
                return ServiceResultBuilder.failure("Không có dữ liệu để import", "NO_DATA");
            }

            const results: ImportResultItem[] = [];

            // Process each record sequentially (simple version)
            for (let i = 0; i < records.length; i++) {
                const record = records[i];
                const rowNumber = i + 2; // Excel row (header = 1)

                try {
                    await this.importSingleRecord(record, rowNumber, results);
                } catch (error: any) {
                    results.push({
                        row: rowNumber,
                        status: "failed",
                        error: error.message,
                    });
                }
            }

            // Build summary
            const summary: ImportSummary = {
                total: results.length,
                created: results.filter((r) => r.status === "success").length,
                failed: results.filter((r) => r.status === "failed").length,
                skipped: results.filter((r) => r.status === "skipped").length,
            };

            return ServiceResultBuilder.success("Import hoàn tất", { summary, results });
        } catch (error: any) {
            console.error("[ImportSinhVienUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi import sinh viên",
                "IMPORT_FAILED"
            );
        }
    }

    private async importSingleRecord(
        record: ImportRecord,
        rowNumber: number,
        results: ImportResultItem[]
    ): Promise<void> {
        // Step 1: Check duplicate MSSV
        const existingMssv = await this.unitOfWork
            .getSinhVienRepository()
            .findByMssv(record.maSoSinhVien);

        if (existingMssv) {
            results.push({
                row: rowNumber,
                status: "failed",
                error: "Mã số sinh viên đã tồn tại",
            });
            return;
        }

        // Step 2: Resolve khoa
        const khoa = await this.unitOfWork.getKhoaRepository().findByMaKhoa(record.maKhoa);
        if (!khoa) {
            results.push({
                row: rowNumber,
                status: "failed",
                error: `Không tìm thấy khoa: ${record.maKhoa}`,
            });
            return;
        }

        // Step 3: Resolve nganh
        const nganh = await this.unitOfWork.getNganhRepository().findByMaNganh(record.maNganh);
        if (!nganh) {
            results.push({
                row: rowNumber,
                status: "failed",
                error: `Không tìm thấy ngành: ${record.maNganh}`,
            });
            return;
        }

        // Step 4: Generate username and password
        const tenDangNhap = record.maSoSinhVien;
        const defaultPassword = record.maSoSinhVien; // Default password = MSSV

        const existingUsername = await this.unitOfWork
            .getTaiKhoanRepository()
            .findByUsername(tenDangNhap);

        if (existingUsername) {
            results.push({
                row: rowNumber,
                status: "failed",
                error: "Tên đăng nhập đã tồn tại",
            });
            return;
        }

        // Step 5: Hash password
        const hashedPassword = await this.passwordHasher.hash(defaultPassword);

        // Step 6: Transaction (giống logic SinhVienService.create)
        await this.unitOfWork.transaction(async (tx) => {
            // Create tai_khoan
            const tk = await tx.tai_khoan.create({
                data: {
                    ten_dang_nhap: tenDangNhap,
                    mat_khau: hashedPassword,
                    loai_tai_khoan: "sinh_vien",
                    trang_thai_hoat_dong: true,
                },
            });

            // Create users
            const user = await tx.users.create({
                data: {
                    ho_ten: record.hoTen,
                    tai_khoan_id: tk.id,
                    ma_nhan_vien: record.maSoSinhVien,
                    email: `${record.maSoSinhVien}@student.hcmue.edu.vn`,
                },
            });

            // Create sinh_vien
            await tx.sinh_vien.create({
                data: {
                    id: user.id,
                    ma_so_sinh_vien: record.maSoSinhVien,
                    khoa_id: khoa.id,
                    lop: record.lop ?? null,
                    khoa_hoc: record.khoaHoc ?? null,
                    ngay_nhap_hoc: record.ngayNhapHoc ?? null,
                    nganh_id: nganh.id,
                },
            });
        });

        results.push({
            row: rowNumber,
            status: "success",
            key: record.maSoSinhVien,
        });
    }
}
