import { useState, useEffect } from "react";
import { pdtApi } from "../api/pdtApi";
import type { DotGhiDanhResponseDTO } from "../types/pdtTypes";

export const useGetDotGhiDanhByHocKy = (hocKyId: string) => {
    const [data, setData] = useState<DotGhiDanhResponseDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!hocKyId) {
            setData([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await pdtApi.getDotGhiDanhByHocKy(hocKyId);

            if (result.isSuccess && result.data) {
                // ✅ Filter only "ghi_danh" type
                const ghiDanhDots = result.data.filter(
                    (dot) => dot.loaiDot === "ghi_danh"
                );

                console.log("📦 Đợt ghi danh fetched:", ghiDanhDots);
                setData(ghiDanhDots);
            } else {
                setError(result.message || "Không thể lấy đợt ghi danh");
                setData([]);
            }
        } catch (err: any) {
            console.error("❌ Error fetching dot ghi danh:", err);
            setError(err.message || "Có lỗi xảy ra");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [hocKyId]);

    const refetch = () => {
        fetchData();
    };

    return {
        data,
        loading,
        error,
        refetch,
    };
};