import { useState, useEffect } from "react";
import { pdtApi } from "../api/pdtApi";
import type { DotDangKyResponseDTO } from "../types/pdtTypes";

export const useGetDotDangKyByHocKy = (hocKyId: string) => {
    const [data, setData] = useState<DotDangKyResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!hocKyId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await pdtApi.getDotDangKyByHocKy(hocKyId);
            if (result.isSuccess && result.data) {
                setData(result.data);
            } else {
                setError(result.message || "Không thể tải dữ liệu");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [hocKyId]);

    return { data, loading, error, refetch: fetchData };
};
