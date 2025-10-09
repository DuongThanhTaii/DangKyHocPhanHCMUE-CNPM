import { useState } from "react";
import { useModalContext } from "../../../hook/ModalContext";
import { pdtApi } from "../api/pdtApi";
import type {
    SetHocKyHienTaiRequest,
    SetHocKyHienThanhRequest,
    KyPhaseResponseDTO,
    HocKyDTO
} from "../types/pdtTypes";
import type { ServiceResult } from "../../common/ServiceResult";


export const useSetHocKyHienHanh = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { openNotify } = useModalContext(); // ✅ Lấy toast

    const setHocKyHienHanh = async (
        data: SetHocKyHienThanhRequest
    ): Promise<ServiceResult<HocKyDTO>> => {
        setLoading(true);
        setError(null);

        try {
            const result = await pdtApi.setHocKyHienHanh(data);

            if (result.isSuccess) {
                openNotify({
                    message: result.message || "Chuyển học kỳ hiện hành thành công",
                    type: "success",
                    title: "Thành công",
                });
            } else {
                setError(result.message);
                openNotify({
                    message: result.message || "Không thể chuyển học kỳ",
                    type: "error",
                    title: "Lỗi",
                });
            }

            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
            setError(errorMessage);

            openNotify({
                message: errorMessage,
                type: "error",
                title: "Lỗi hệ thống",
            });

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
        setHocKyHienHanh,
        loading,
        error,
        openNotify,
    };
};



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