import { useState, useEffect } from "react";
import { gvAPI } from "../api/gvAPI";
import type { TietHoc } from "../types";

/**
 * Hook lấy config tiết học (source of truth từ BE)
 */
export const useTietHocConfig = () => {
    const [config, setConfig] = useState<TietHoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await gvAPI.getTietHocConfig();

                if (result.isSuccess && result.data) {
                    setConfig(result.data);
                } else {
                    setError(result.message || "Không thể tải config tiết học");
                }
            } catch (err) {
                console.error("Error fetching tiet hoc config:", err);
                setError("Đã xảy ra lỗi khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    return {
        config,
        loading,
        error,
    };
};