export interface CalculationResultDTO {
    totalProcessed: number;
    successCount: number;
    failedCount: number;
    errors: Array<{
        sinhVienId: string;
        mssv: string;
        error: string;
    }>;
}
