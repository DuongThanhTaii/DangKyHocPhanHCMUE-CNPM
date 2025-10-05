import { useState, useEffect, useCallback } from "react";
import { pdtApi } from "../api/pdtApi";
import type { HocKyNienKhoaDTO } from "../types/pdtTypes";

/**
 * Hook để lấy danh sách học kỳ - niên khóa
 */
export const useHocKyNienKhoa = () => {
    const [data, setData] = useState<HocKyNienKhoaDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await pdtApi.getHocKyNienKhoa();
            setData(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Lỗi khi tải danh sách";
            setError(errorMessage);
            console.error("Error fetching hoc ky nien khoa:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
    };
};
