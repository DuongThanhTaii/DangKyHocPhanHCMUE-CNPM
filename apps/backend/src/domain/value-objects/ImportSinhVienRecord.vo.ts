export interface ImportSinhVienRecordProps {
    maSoSinhVien: string;
    hoTen: string;
    maKhoa: string;
    maNganh: string;
    lop?: string;
    khoaHoc?: string;
    ngayNhapHoc?: Date;
}

export class ImportSinhVienRecord {
    private constructor(
        public readonly maSoSinhVien: string,
        public readonly hoTen: string,
        public readonly maKhoa: string,
        public readonly maNganh: string,
        public readonly lop?: string,
        public readonly khoaHoc?: string,
        public readonly ngayNhapHoc?: Date
    ) { }

    static create(props: ImportSinhVienRecordProps): ImportSinhVienRecord {
        return new ImportSinhVienRecord(
            props.maSoSinhVien.trim(),
            props.hoTen.trim(),
            props.maKhoa.trim(),
            props.maNganh.trim(),
            props.lop?.trim(),
            props.khoaHoc?.trim(),
            props.ngayNhapHoc
        );
    }

    validate(): ValidationResult {
        const errors: string[] = [];

        if (!this.maSoSinhVien || this.maSoSinhVien.length === 0) {
            errors.push("Mã số sinh viên không được để trống");
        }

        if (!this.hoTen || this.hoTen.length === 0) {
            errors.push("Họ tên không được để trống");
        }

        if (!this.maKhoa || this.maKhoa.length === 0) {
            errors.push("Mã khoa không được để trống");
        }

        if (!this.maNganh || this.maNganh.length === 0) {
            errors.push("Mã ngành không được để trống");
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    isValid(): boolean {
        return this.validate().isValid;
    }
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
