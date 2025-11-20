import { useState, useCallback } from "react";
import { tlkAPI } from "../api/tlkAPI";
import type { HocPhanForCreateLopDTO } from "../types";

export const useHocPhansForCreateLop = () => {
    const [data, setData] = useState<HocPhanForCreateLopDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ✅ Wrap với useCallback để giữ reference ổn định
    const fetchData = useCallback(async (hocKyId: string) => {
        if (!hocKyId) {
            setData([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await tlkAPI.getHocPhansForCreateLop(hocKyId);

            if (result.isSuccess && result.data) {
                setData(result.data);
            } else {
                setError(result.message || "Không thể tải danh sách học phần");
                setData([]);
            }
        } catch (err) {
            console.error("Error fetching hoc phans for create lop:", err);
            setError("Đã xảy ra lỗi khi tải dữ liệu");
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []); // ✅ Empty dependency - function không đổi

    return {
        data,
        loading,
        error,
        fetchData,
    };
};