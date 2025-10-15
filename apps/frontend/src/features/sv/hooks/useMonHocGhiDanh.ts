import { useState, useEffect } from "react";
import { svApi } from "../api/svApi";
import type { MonHocGhiDanhForSinhVien } from "../types";

/**
 * Hook lấy danh sách môn học có thể ghi danh cho sinh viên
 */
export const useMonHocGhiDanh = () => {
    const [data, setData] = useState<MonHocGhiDanhForSinhVien[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await svApi.getMonHocGhiDanh();

            if (result.isSuccess && result.data) {
                setData(result.data);
            } else {
                setError(result.message || "Không thể lấy danh sách môn học");
                setData([]);
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Lỗi không xác định";
            setError(errorMessage);
            setData([]);
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