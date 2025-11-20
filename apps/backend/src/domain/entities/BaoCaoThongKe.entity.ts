export class BaoCaoOverview {
    constructor(
        public readonly svUnique: number,
        public readonly soDangKy: number,
        public readonly soLopHocPhan: number,
        public readonly thucThu: number,
        public readonly kyVong: number
    ) { }

    static create(props: {
        svUnique: number;
        soDangKy: number;
        soLopHocPhan: number;
        thucThu: number;
        kyVong: number;
    }): BaoCaoOverview {
        return new BaoCaoOverview(
            props.svUnique,
            props.soDangKy,
            props.soLopHocPhan,
            props.thucThu,
            props.kyVong
        );
    }

    getTiLeThucThu(): number {
        if (this.kyVong === 0) return 0;
        return (this.thucThu / this.kyVong) * 100;
    }

    isThuDuKyVong(): boolean {
        return this.thucThu >= this.kyVong;
    }
}

export class BaoCaoTheoKhoa {
    constructor(
        public readonly khoaId: string,
        public readonly tenKhoa: string,
        public readonly soDangKy: number
    ) { }

    static create(props: {
        khoaId: string;
        tenKhoa: string;
        soDangKy: number;
    }): BaoCaoTheoKhoa {
        return new BaoCaoTheoKhoa(props.khoaId, props.tenKhoa, props.soDangKy);
    }
}

export class BaoCaoTheoNganh {
    constructor(
        public readonly nganhId: string,
        public readonly tenNganh: string,
        public readonly soDangKy: number
    ) { }

    static create(props: {
        nganhId: string;
        tenNganh: string;
        soDangKy: number;
    }): BaoCaoTheoNganh {
        return new BaoCaoTheoNganh(props.nganhId, props.tenNganh, props.soDangKy);
    }
}

export class BaoCaoTaiGiangVien {
    constructor(
        public readonly giangVienId: string,
        public readonly hoTen: string,
        public readonly soLop: number
    ) { }

    static create(props: {
        giangVienId: string;
        hoTen: string;
        soLop: number;
    }): BaoCaoTaiGiangVien {
        return new BaoCaoTaiGiangVien(props.giangVienId, props.hoTen, props.soLop);
    }

    isQuaTai(maxLop: number = 5): boolean {
        return this.soLop > maxLop;
    }
}
