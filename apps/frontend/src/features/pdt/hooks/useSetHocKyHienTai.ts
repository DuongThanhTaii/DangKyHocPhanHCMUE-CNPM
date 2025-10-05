import { useState } from "react";
import { pdtApi } from "../api/pdtApi";
import type { SetHocKyHienTaiRequest, KyPhaseResponseDTO } from "../types/pdtTypes";
import type { ServiceResult } from "../../common/ServiceResult";
export const useSetHocKyHienTai = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setHocKyHienTai = async (
        data: SetHocKyHienTaiRequest
    ): Promise<ServiceResult<KyPhaseResponseDTO>> => {
        setLoading(true);
        setError(null);

        try {
            const result = await pdtApi.setHocKyHienTai(data);

            if (!result.isSuccess) {
                setError(result.message);
            }

            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
            setError(errorMessage);
            return {
                isSuccess: false,
                message: errorMessage,
                errorCode: "UNKNOWN_ERROR",
            };
        } finally {
            setLoading(false);
        }
    };

    return {
        setHocKyHienTai,
        loading,
        error,
    };
};