import { useState } from "react";
import { commonApi } from "../api/commonApi";

interface UpdateHocKyDateRequest {
    hocKyId: string;
    ngayBatDau: string; // YYYY-MM-DD
    ngayKetThuc: string; // YYYY-MM-DD
}

export const useUpdateHocKyDate = () => {
    const [loading, setLoading] = useState(false);

    const updateHocKyDate = async (data: UpdateHocKyDateRequest) => {
        setLoading(true);
        try {
            // ✅ Send exactly as BE expects
            const result = await commonApi.updateHocKyDate({
                hocKyId: data.hocKyId,
                ngayBatDau: data.ngayBatDau,
                ngayKetThuc: data.ngayKetThuc,
            });
            return result;
        } catch (error) {
            console.error("Error updating hoc ky date:", error);
            return {
                isSuccess: false,
                message: error instanceof Error ? error.message : "Lỗi khi cập nhật",
                data: null,
            };
        } finally {
            setLoading(false);
        }
    };

    return { updateHocKyDate, loading };
};
