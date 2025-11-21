import { injectable } from "inversify";
import { IImportStrategy } from "../../../../application/ports/qlSinhVienPDT/services/IImportStrategy";
import { ImportSinhVienRecord } from "../../../../domain/value-objects/ImportSinhVienRecord.vo";

@injectable()
export class SelfInputImportStrategy implements IImportStrategy {
    async parse(records: any[]): Promise<ImportSinhVienRecord[]> {
        return records.map((record) =>
            ImportSinhVienRecord.create({
                maSoSinhVien: record.maSoSinhVien,
                hoTen: record.hoTen,
                maKhoa: record.maKhoa,
                maNganh: record.maNganh,
                lop: record.lop,
                khoaHoc: record.khoaHoc,
                ngayNhapHoc: record.ngayNhapHoc ? new Date(record.ngayNhapHoc) : undefined,
            })
        );
    }
}
