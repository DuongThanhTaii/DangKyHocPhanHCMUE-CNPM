import { useState, useEffect, useCallback } from "react";
import { commonApi } from "../api/commonApi";
import type  {HocKyNienKhoaDTO } from "../types";
export const useHocKyNienKhoa = () => {
    const [data, setData] = useState<HocKyNienKhoaDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await commonApi.getHocKyNienKhoa();

            if (result.isSuccess && result.data) {
                setData(result.data);
            } else {
                setError(result.message || "Lỗi khi tải danh sách");
            }
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
