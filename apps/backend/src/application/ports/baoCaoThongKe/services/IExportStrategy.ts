export interface ExportData {
    overview: any;
    theoKhoa: any;
    theoNganh: any;
    taiGiangVien: any;
}

// ✅ ADD: Metadata interface
export interface ExportMetadata {
    hocKyId: string;
    khoaId?: string;
    nganhId?: string;
    charts?: Array<{ name: string; dataUrl: string }>;

}

export interface IExportStrategy {
    export(data: ExportData, metadata: ExportMetadata): Promise<Buffer>;
}

export const IExportStrategy = Symbol.for("BaoCaoThongKe.IExportStrategy");
