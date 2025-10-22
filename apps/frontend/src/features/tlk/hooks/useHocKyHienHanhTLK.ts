import { useState, useEffect } from "react";
import { tlkAPI } from "../api/tlkAPI";
import type { HocKyHienHanhDTO } from "../types";

/**
 * Hook lấy học kỳ hiện hành cho TLK
 */
export const useHocKyHienHanhTLK = () => {
    const [data, setData] = useState<HocKyHienHanhDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await tlkAPI.getHocKyHienHanh();

                if (result.isSuccess && result.data) {
                    setData(result.data);
                } else {
                    setError(result.message || "Không thể lấy học kỳ hiện hành");
                }
            } catch (err: any) {
                console.error("Error fetching hoc ky hien hanh:", err);
                setError(err.message || "Có lỗi xảy ra");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // ✅ Empty dependency - chỉ chạy 1 lần

    return {
        hocKyHienHanh: data,
        loading,
        error,
    };
};