import { useState, useEffect } from "react";
import { tlkAPI } from "../api/tlkAPI";
import type { PhongHocDTO } from "../types";

export const usePhongHocTLK = () => {
    const [data, setData] = useState<PhongHocDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await tlkAPI.getPhongHocByTLK();

            if (result.isSuccess && result.data) {
                setData(result.data);
            } else {
                setError(result.message || "Không thể tải danh sách phòng học");
                setData([]);
            }
        } catch (err) {
            console.error("Error fetching phong hoc:", err);
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
        phongHocs: data,
        loading,
        error,
        refetch: fetchData,
    };
};