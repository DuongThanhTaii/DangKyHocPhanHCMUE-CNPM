export class SinhVien {
    private constructor(
        public readonly id: string,
        public maSoSinhVien: string,
        public hoTen: string,
        public khoaId: string,
        public nganhId: string | null,
        public lop: string | null,
        public khoaHoc: string | null,
        public ngayNhapHoc: Date | null
    ) { }

    static create(props: {
        id: string;
        maSoSinhVien: string;
        hoTen: string;
        khoaId: string;
        nganhId?: string | null;
        lop?: string | null;
        khoaHoc?: string | null;
        ngayNhapHoc?: Date | null;
    }): SinhVien {
        return new SinhVien(
            props.id,
            props.maSoSinhVien,
            props.hoTen,
            props.khoaId,
            props.nganhId || null,
            props.lop || null,
            props.khoaHoc || null,
            props.ngayNhapHoc || null
        );
    }

    static fromPersistence(props: {
        id: string;
        maSoSinhVien: string;
        hoTen: string;
        khoaId: string;
        nganhId: string | null;
        lop: string | null;
        khoaHoc: string | null;
        ngayNhapHoc: Date | null;
    }): SinhVien {
        return new SinhVien(
            props.id,
            props.maSoSinhVien,
            props.hoTen,
            props.khoaId,
            props.nganhId,
            props.lop,
            props.khoaHoc,
            props.ngayNhapHoc
        );
    }

    update(props: {
        hoTen?: string;
        khoaId?: string;
        nganhId?: string | null;
        lop?: string | null;
        khoaHoc?: string | null;
        ngayNhapHoc?: Date | null;
    }): void {
        if (props.hoTen !== undefined) this.hoTen = props.hoTen;
        if (props.khoaId !== undefined) this.khoaId = props.khoaId;
        if (props.nganhId !== undefined) this.nganhId = props.nganhId;
        if (props.lop !== undefined) this.lop = props.lop;
        if (props.khoaHoc !== undefined) this.khoaHoc = props.khoaHoc;
        if (props.ngayNhapHoc !== undefined) this.ngayNhapHoc = props.ngayNhapHoc;
    }

    isValid(): boolean {
        return (
            !!this.maSoSinhVien &&
            !!this.hoTen &&
            !!this.khoaId &&
            this.maSoSinhVien.length > 0 &&
            this.hoTen.length > 0
        );
    }
}
