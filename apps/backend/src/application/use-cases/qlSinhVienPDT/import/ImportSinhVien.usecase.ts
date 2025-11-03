import { injectable, inject } from "inversify";
import { TYPES } from "../../../../infrastructure/di/types";
import { IUnitOfWork } from "../../../ports/qlSinhVienPDT/IUnitOfWork";
import { IPasswordHasher } from "../../../ports/qlSinhVienPDT/services/IPasswordHasher";
import { IImportStrategy } from "../../../ports/qlSinhVienPDT/services/IImportStrategy";
import { SinhVien } from "../../../../domain/entities/SinhVien.entity";
import { ImportResult, ImportSummary } from "../../../../domain/value-objects/ImportResult.vo";
import { ImportSinhVienOutputDTO } from "../../../dtos/qlSinhVienPDT/import/ImportSinhVienOutput.dto";
import { ServiceResult, ServiceResultBuilder } from "../../../../types/serviceResult";

// ✅ Fix: Custom limiter thay vì p-limit
function createLimiter(concurrency: number) {
    let active = 0;
    const queue: Array<() => void> = [];

    const next = () => {
        if (active >= concurrency) return;
        const run = queue.shift();
        if (!run) return;
        active++;
        run();
    };

    return function limit<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const task = () => {
                fn()
                    .then(resolve, reject)
                    .finally(() => {
                        active--;
                        next();
                    });
            };
            queue.push(task);
            next();
        });
    };
}

const limit = createLimiter(5);

@injectable()
export class ImportSinhVienUseCase {
    constructor(
        @inject(IUnitOfWork) private unitOfWork: IUnitOfWork,
        @inject(IPasswordHasher) private passwordHasher: IPasswordHasher
    ) { }

    async execute(
        strategy: IImportStrategy,
        input: any
    ): Promise<ServiceResult<ImportSinhVienOutputDTO>> {
        try {
            // Step 1: Parse input via strategy
            const records = await strategy.parse(input);

            if (records.length === 0) {
                return ServiceResultBuilder.failure("Không có dữ liệu để import", "NO_DATA");
            }

            // Step 2: Validate all records
            const validRecords = records.filter((record) => {
                const validation = record.validate();
                return validation.isValid;
            });

            const invalidRecords = records.filter((record) => !record.isValid());

            // Step 3: Process valid records with concurrency control
            const results: ImportResult[] = [];

            await Promise.all(
                validRecords.map((record, index) =>
                    limit(async () => {
                        const rowNumber = index + 2; // Excel rows start from 2 (header = 1)

                        try {
                            await this.importSingleRecord(record, rowNumber, results);
                        } catch (error: any) {
                            results.push(ImportResult.failed(rowNumber, error.message));
                        }
                    })
                )
            );

            // Add skipped records
            invalidRecords.forEach((record, index) => {
                const validation = record.validate();
                results.push(
                    ImportResult.skipped(
                        validRecords.length + index + 2,
                        validation.errors.join(", ")
                    )
                );
            });

            // Step 4: Build summary
            const summary = ImportSummary.fromResults(results);

            const output: ImportSinhVienOutputDTO = {
                summary: {
                    total: summary.total,
                    created: summary.created,
                    failed: summary.failed,
                    skipped: summary.skipped,
                },
                results: results.map((r) => ({
                    row: r.row,
                    status: r.status,
                    key: r.key,
                    error: r.error,
                })),
            };

            return ServiceResultBuilder.success("Import hoàn tất", output);
        } catch (error: any) {
            console.error("[ImportSinhVienUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi import sinh viên",
                "IMPORT_FAILED"
            );
        }
    }

    private async importSingleRecord(
        record: any,
        rowNumber: number,
        results: ImportResult[]
    ): Promise<void> {
        // Step 1: Check duplicates
        const existingMssv = await this.unitOfWork
            .getSinhVienRepository()
            .findByMssv(record.maSoSinhVien);

        if (existingMssv) {
            results.push(ImportResult.failed(rowNumber, "Mã số sinh viên đã tồn tại"));
            return;
        }

        // Step 2: Resolve khoa
        const khoa = await this.unitOfWork.getKhoaRepository().findByMaKhoa(record.maKhoa);

        if (!khoa) {
            results.push(ImportResult.failed(rowNumber, `Không tìm thấy khoa: ${record.maKhoa}`));
            return;
        }

        // Step 3: Resolve nganh
        const nganh = await this.unitOfWork.getNganhRepository().findByMaNganh(record.maNganh);

        if (!nganh) {
            results.push(ImportResult.failed(rowNumber, `Không tìm thấy ngành: ${record.maNganh}`));
            return;
        }

    // Step 4: Generate username and password
    const tenDangNhap = record.maSoSinhVien;
    const defaultPassword = record.maSoSinhVien; // Default password = MSSV

    const existingUsername = await this.unitOfWork
      .getTaiKhoanRepository()
      .findByUsername(tenDangNhap);

        if (existingUsername) {
            results.push(ImportResult.failed(rowNumber, "Tên đăng nhập đã tồn tại"));
            return;
        }

    // Step 5: Hash password
    const hashedPassword = await this.passwordHasher.hash(defaultPassword);

        // Step 6: Transaction
        await this.unitOfWork.transaction(async (repos) => {
            // Create tai_khoan
            const taiKhoanId = await repos.taiKhoanRepo.create({
                tenDangNhap,
                matKhau: hashedPassword,
                loaiTaiKhoan: "sinh_vien",
                trangThaiHoatDong: true,
            });

            // Create users
            const userId = await repos.usersRepo.create({
                id: taiKhoanId,
                hoTen: record.hoTen,
                taiKhoanId,
                maNhanVien: record.maSoSinhVien,
                email: `${record.maSoSinhVien}@student.hcmue.edu.vn`,
            });

            // Create sinh_vien entity
            const sinhVien = SinhVien.create({
                id: userId,
                maSoSinhVien: record.maSoSinhVien,
                hoTen: record.hoTen,
                khoaId: khoa.id,
                nganhId: nganh.id,
                lop: record.lop,
                khoaHoc: record.khoaHoc,
                ngayNhapHoc: record.ngayNhapHoc,
            });

            await repos.sinhVienRepo.create(sinhVien);
        });

        results.push(ImportResult.success(rowNumber, record.maSoSinhVien));
    }
}
