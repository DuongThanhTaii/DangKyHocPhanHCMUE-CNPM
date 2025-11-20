export interface ImportResultItemDTO {
    row: number;
    status: "success" | "failed" | "skipped";
    key?: string;
    error?: string;
}

export interface ImportSinhVienOutputDTO {
    summary: {
        total: number;
        created: number;
        failed: number;
        skipped: number;
    };
    results: ImportResultItemDTO[];
}
