import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { TYPES } from "../../../../infrastructure/di/types";
import { ImportSinhVienUseCase } from "../../../../application/use-cases/qlSinhVienPDT/import/ImportSinhVien.usecase";
import XLSX from "xlsx";

@injectable()
export class ImportSinhVienController {
    constructor(
        @inject(TYPES.QlSinhVienPDT.ImportSinhVienUseCase)
        private importUseCase: ImportSinhVienUseCase
    ) { }

    async import(req: Request, res: Response) {
        try {
            let records: any[] | undefined;

            // 1) If multipart upload with file 'file'
            if (req.file && req.file.buffer) {
                const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });

                records = raw.map((r: any) => ({
                    maSoSinhVien: r.ma_so_sinh_vien || "",
                    hoTen: r.ho_ten || "",
                    maKhoa: r.ma_khoa || "",
                    maNganh: r.ma_nganh || "",
                    lop: r.lop || "",
                    khoaHoc: r.khoa_hoc || "",
                    ngayNhapHoc: r.ngay_nhap_hoc ? new Date(r.ngay_nhap_hoc) : undefined,
                }));
            } else {
                // 2) If JSON body
                const bodyRecords = req.body?.records ?? req.body;
                if (Array.isArray(bodyRecords)) {
                    records = bodyRecords;
                } else if (typeof bodyRecords === "string") {
                    try {
                        const parsed = JSON.parse(bodyRecords);
                        if (Array.isArray(parsed)) records = parsed;
                    } catch {
                        // ignore
                    }
                }
            }

            if (!records || records.length === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Danh sách sinh viên không hợp lệ hoặc trống",
                });
            }

            // ✅ FIX: Call execute() with only 1 argument (records)
            const result = await this.importUseCase.execute(records);

            return res.status(result.isSuccess ? 200 : 400).json(result);
        } catch (error: any) {
            console.error("[ImportSinhVienController.import] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }
}
