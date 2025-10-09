import { useState, useEffect } from "react";
import { pdtApi } from "../api/pdtApi";
import type { HocKyDTO } from "../types/pdtTypes";

export const useGetHocKyHienHanh = () => {
    const [data, setData] = useState<HocKyDTO | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await pdtApi.getHocKyHienHanh();

            if (result.isSuccess && result.data) {
                setData(result.data);
            } else {
                setError(result.message || "Không thể lấy thông tin học kỳ hiện hành");
                setData(null);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
            setError(errorMessage);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
    };
};