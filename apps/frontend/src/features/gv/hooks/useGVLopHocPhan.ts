import { useState, useEffect } from "react";
import { gvLopHocPhanAPI, type GVLopHocPhanDTO } from "../api/gvLopHocPhanAPI";

export const useGVLopHocPhan = () => {
    const [data, setData] = useState<GVLopHocPhanDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await gvLopHocPhanAPI.getMyLopHocPhan();

            if (result.isSuccess && result.data) {
                setData(result.data);
            } else {
                setError(result.message || "Không thể tải danh sách lớp");
                setData([]);
            }
        } catch (err) {
            console.error("Error fetching lop hoc phan:", err);
            setError("Đã xảy ra lỗi khi tải dữ liệu");
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
