import { useState, useEffect } from "react";
import { tlkAPI } from "../api/tlkAPI";
import type { DeXuatHocPhanForTroLyKhoaDTO } from "../types";

/**
 * Hook để lấy danh sách đề xuất học phần cho Trợ Lý Khoa (chỉ xem)
 */
export const useDeXuatHocPhanTLK = () => {
    const [data, setData] = useState<DeXuatHocPhanForTroLyKhoaDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await tlkAPI.getDeXuatHocPhan();

            if (result.isSuccess && result.data) {
                setData(result.data);
            } else {
                setError(result.message || "Không thể lấy danh sách đề xuất");
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
        // ✅ Không có duyetDeXuat, tuChoiDeXuat (TLK chỉ xem)
    };
};