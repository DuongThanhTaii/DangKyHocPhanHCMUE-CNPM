import { useState, useEffect } from "react";
import { pdtApi } from "../api/pdtApi";
import type { KhoaDTO } from "../types/pdtTypes";

/**
 * Hook lấy danh sách khoa
 */
export const useDanhSachKhoa = () => {
    const [data, setData] = useState<KhoaDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await pdtApi.getDanhSachKhoa();

                if (result.isSuccess && result.data) {
                    setData(result.data);
                } else {
                    setError(result.message || "Không thể lấy danh sách khoa");
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

        fetchData();
    }, []);

    return { data, loading, error };
};