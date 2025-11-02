export class NienKhoa {
    private constructor(
        public readonly id: string,
        public tenNienKhoa: string,
        public ngayBatDau: Date | null,
        public ngayKetThuc: Date | null
    ) { }

    static create(props: {
        id: string;
        tenNienKhoa: string;
        ngayBatDau?: Date | null;
        ngayKetThuc?: Date | null;
    }): NienKhoa {
        return new NienKhoa(
            props.id,
            props.tenNienKhoa,
            props.ngayBatDau || null,
            props.ngayKetThuc || null
        );
    }

    static fromPersistence(props: {
        id: string;
        tenNienKhoa: string;
        ngayBatDau: Date | null;
        ngayKetThuc: Date | null;
    }): NienKhoa {
        return new NienKhoa(
            props.id,
            props.tenNienKhoa,
            props.ngayBatDau,
            props.ngayKetThuc
        );
    }

    isValid(): boolean {
        return !!this.tenNienKhoa;
    }
}
