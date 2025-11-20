export class HocKy {
    private constructor(
        public readonly id: string,
        public tenHocKy: string,
        public maHocKy: string,
        public nienKhoaId: string,
        public ngayBatDau: Date | null,
        public ngayKetThuc: Date | null,
        public trangThaiHienTai: boolean
    ) { }

    static create(props: {
        id: string;
        tenHocKy: string;
        maHocKy: string;
        nienKhoaId: string;
        ngayBatDau?: Date | null;
        ngayKetThuc?: Date | null;
        trangThaiHienTai?: boolean;
    }): HocKy {
        return new HocKy(
            props.id,
            props.tenHocKy,
            props.maHocKy,
            props.nienKhoaId,
            props.ngayBatDau || null,
            props.ngayKetThuc || null,
            props.trangThaiHienTai || false
        );
    }

    static fromPersistence(props: {
        id: string;
        tenHocKy: string;
        maHocKy: string;
        nienKhoaId: string;
        ngayBatDau: Date | null;
        ngayKetThuc: Date | null;
        trangThaiHienTai: boolean;
    }): HocKy {
        return new HocKy(
            props.id,
            props.tenHocKy,
            props.maHocKy,
            props.nienKhoaId,
            props.ngayBatDau,
            props.ngayKetThuc,
            props.trangThaiHienTai
        );
    }

    setAsHienHanh(): void {
        this.trangThaiHienTai = true;
    }

    unsetAsHienHanh(): void {
        this.trangThaiHienTai = false;
    }

    isHienHanh(): boolean {
        return this.trangThaiHienTai;
    }

    isValid(): boolean {
        return !!this.tenHocKy && !!this.maHocKy && !!this.nienKhoaId;
    }
}
