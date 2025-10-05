import { useState } from "react";
import { pdtApi } from "../api/pdtApi";
import type {
    CreateBulkKyPhaseRequest,
    KyPhaseResponseDTO,
} from "../types/pdtTypes";
import type { ServiceResult } from "../../common/ServiceResult";
export const useCreateBulkKyPhase = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createBulkKyPhase = async (
        data: CreateBulkKyPhaseRequest
    ): Promise<ServiceResult<KyPhaseResponseDTO[]>> => {
        setLoading(true);
        setError(null);

        try {
            const result = await pdtApi.createBulkKyPhase(data);

            if (!result.isSuccess) {
                setError(result.message);
            }

            return result;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Lỗi không xác định";
            setError(errorMessage);
            return {
                isSuccess: false,
                message: errorMessage,
                errorCode: "NETWORK_ERROR",
            };
        } finally {
            setLoading(false);
        }
    };

    return {
        createBulkKyPhase,
        loading,
        error,
    };
};