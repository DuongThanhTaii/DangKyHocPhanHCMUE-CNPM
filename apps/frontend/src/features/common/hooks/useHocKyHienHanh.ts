import { useState, useEffect } from "react";
import { commonApi } from "../api/commonApi";
import type { HocKyHienHanhDTO } from "../types";

/**
 * ✅ Hook lấy học kỳ hiện hành (public, auth required)
 */
export const useHocKyHienHanh = () => {
    const [data, setData] = useState<HocKyHienHanhDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await commonApi.getHocKyHienHanh();

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

    return {
        data,
        loading,
        error,
        refetch: fetchData,
    };
};
