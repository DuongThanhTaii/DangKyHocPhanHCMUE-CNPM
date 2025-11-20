import { useState } from "react";
import { pdtApi } from "../api/pdtApi";
import type {
    UpdateDotGhiDanhRequest,
    DotGhiDanhResponseDTO,
} from "../types/pdtTypes";

export const useUpdateDotGhiDanh = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateDotGhiDanh = async (request: UpdateDotGhiDanhRequest) => {
        setLoading(true);
        setError(null);

        try {
            const result = await pdtApi.updateDotGhiDanh(request);

            if (result.isSuccess && result.data) {
                return {
                    isSuccess: true,
                    data: result.data,
                    message: result.message || "Cập nhật đợt ghi danh thành công",
                };
            } else {
                const errorMsg = result.message || "Cập nhật đợt ghi danh thất bại";
                setError(errorMsg);
                return {
                    isSuccess: false,
                    message: errorMsg,
                };
            }
        } catch (err: any) {
            const errorMsg = err.message || "Có lỗi xảy ra khi cập nhật đợt ghi danh";
            setError(errorMsg);
            return {
                isSuccess: false,
                message: errorMsg,
            };
        } finally {
            setLoading(false);
        }
    };

    return {
        updateDotGhiDanh,
        loading,
        error,
    };
};