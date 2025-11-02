import { injectable } from "inversify";
import * as XLSX from "xlsx";
import { IImportStrategy } from "../../../../application/ports/qlSinhVienPDT/services/IImportStrategy";
import { ImportSinhVienRecord } from "../../../../domain/value-objects/ImportSinhVienRecord.vo";

@injectable()
export class ExcelImportStrategy implements IImportStrategy {
    async parse(fileBuffer: Buffer): Promise<ImportSinhVienRecord[]> {
        const workbook = XLSX.read(fileBuffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true });

        return jsonData.map((row: any) =>
            ImportSinhVienRecord.create({
                maSoSinhVien: String(row.ma_so_sinh_vien || "").trim(),
                hoTen: String(row.ho_ten || "").trim(),
                maKhoa: String(row.ma_khoa || "").trim(),
                maNganh: String(row.ma_nganh || "").trim(),
                lop: row.lop ? String(row.lop) : undefined,
                khoaHoc: row.khoa_hoc ? String(row.khoa_hoc) : undefined,
                ngayNhapHoc: row.ngay_nhap_hoc ? new Date(row.ngay_nhap_hoc) : undefined,
            })
        );
    }
}
