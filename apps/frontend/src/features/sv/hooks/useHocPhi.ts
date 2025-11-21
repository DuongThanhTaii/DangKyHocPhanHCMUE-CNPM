import { useState, useEffect, useCallback } from "react";
import { svApi } from "../api/svApi";
import type { ChiTietHocPhiDTO, ThanhToanHocPhiRequest } from "../types";
import { useModalContext } from "../../../hook/ModalContext";

export const useHocPhi = (hocKyId: string) => {
    const { openNotify } = useModalContext();
    const [data, setData] = useState<ChiTietHocPhiDTO | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        // ✅ FIX: Không gọi API nếu hocKyId rỗng
        if (!hocKyId) {
            setData(null);
            return;
        }

        setLoading(true);
        try {
            const result = await svApi.getChiTietHocPhi(hocKyId);
            if (result.isSuccess && result.data) {
                setData(result.data);
            } else {
                setData(null);
                openNotify({ message: result.message || "Không thể tải học phí", type: "error" });
            }
        } catch (error: any) {
            setData(null);
            openNotify({ message: error.message || "Lỗi tải dữ liệu", type: "error" });
        } finally {
            setLoading(false);
        }
    }, [hocKyId, openNotify]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const thanhToan = async (payload: ThanhToanHocPhiRequest) => {
        setSubmitting(true);
        try {
            const result = await svApi.thanhToanHocPhi(payload);
            if (result.isSuccess) {
                openNotify({ message: "✅ Thanh toán thành công!", type: "success" });
                await fetchData(); // ✅ Reload data
                return true;
            } else {
                openNotify({ message: result.message || "❌ Thanh toán thất bại", type: "error" });
                return false;
            }
        } catch (error: any) {
            openNotify({ message: error.message || "❌ Lỗi thanh toán", type: "error" });
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    return { data, loading, submitting, thanhToan, refetch: fetchData };
};
