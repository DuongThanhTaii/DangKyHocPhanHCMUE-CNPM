import { useState, useEffect } from "react";
import { svApi } from "../api/svApi";
import type { LichSuDangKyDTO } from "../types";

export const useLichSuDangKy = (hocKyId: string) => {
    const [data, setData] = useState<LichSuDangKyDTO | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!hocKyId) {
            setData(null);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await svApi.getLichSuDangKy(hocKyId);

                if (result.isSuccess && result.data) {
                    setData(result.data);
                } else {
                    setError(result.message || "Không thể tải lịch sử");
                    setData(null);
                }
            } catch (err: any) {
                setError(err.message || "Có lỗi xảy ra");
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [hocKyId]);

    return { data, loading, error };
};
