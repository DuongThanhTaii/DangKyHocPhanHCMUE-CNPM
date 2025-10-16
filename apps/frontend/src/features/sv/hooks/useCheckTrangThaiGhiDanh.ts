import { useState, useEffect } from "react";
import { svApi } from "../api/svApi";

export const useCheckTrangThaiGhiDanh = () => {
    const [canGhiDanh, setCanGhiDanh] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string>("");

    const checkTrangThai = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("🔍 Checking trạng thái ghi danh...");

            const result = await svApi.checkTrangThaiGhiDanh();

            console.log("📦 Check result:", result);

            if (result.isSuccess) {
                console.log("✅ Sinh viên được phép ghi danh");
                setCanGhiDanh(true);
                setMessage(result.message || "Đang trong thời gian ghi danh");
            } else {
                console.log("❌ Sinh viên không được phép ghi danh");
                setCanGhiDanh(false);
                setMessage(result.message || "Không trong thời gian ghi danh");
                setError(result.message);
            }
        } catch (err: any) {
            console.error("💥 Error checking trạng thái:", err);
            setCanGhiDanh(false);
            setError(err.message || "Có lỗi xảy ra khi kiểm tra trạng thái");
            setMessage("Không thể kiểm tra trạng thái ghi danh");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkTrangThai();
    }, []);

    return {
        canGhiDanh,
        loading,
        error,
        message,
        refetch: checkTrangThai,
    };
};