export type ImportStatus = "success" | "failed" | "skipped";

export interface ImportResultProps {
    row: number;
    status: ImportStatus;
    key?: string;
    error?: string;
}

export class ImportResult {
    private constructor(
        public readonly row: number,
        public readonly status: ImportStatus,
        public readonly key?: string,
        public readonly error?: string
    ) { }

    static success(row: number, key: string): ImportResult {
        return new ImportResult(row, "success", key);
    }

    static failed(row: number, error: string): ImportResult {
        return new ImportResult(row, "failed", undefined, error);
    }

    static skipped(row: number, reason: string): ImportResult {
        return new ImportResult(row, "skipped", undefined, reason);
    }

    isSuccess(): boolean {
        return this.status === "success";
    }

    isFailed(): boolean {
        return this.status === "failed";
    }
}

export class ImportSummary {
    constructor(
        public readonly total: number,
        public readonly created: number,
        public readonly failed: number,
        public readonly skipped: number
    ) { }

    static fromResults(results: ImportResult[]): ImportSummary {
        return new ImportSummary(
            results.length,
            results.filter((r) => r.status === "success").length,
            results.filter((r) => r.status === "failed").length,
            results.filter((r) => r.status === "skipped").length
        );
    }
}
