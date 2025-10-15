import { useState, useEffect } from "react";
import { pdtApi } from "../api/pdtApi";
import type { HocKyHienHanhDTO } from "../types/pdtTypes";

/**
 * Hook lấy học kỳ hiện hành (đơn giản)
 */
export const useGetHocKyHienHanh = () => {
    const [data, setData] = useState<HocKyHienHanhDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await pdtApi.getHocKyHienHanh();

            if (result.isSuccess && result.data) {
                setData(result.data);
            } else {
                setError(result.message || "Không thể lấy học kỳ hiện hành");
            }
        } catch (err: any) {
            setError(err.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ✅ Expose refetch method
    const refetch = () => {
        fetchData();
    };

    return {
        data,
        loading,
        error,
        refetch, // ✅ Add refetch
    };
};