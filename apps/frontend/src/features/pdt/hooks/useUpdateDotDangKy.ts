import { useState } from "react";
import { pdtApi } from "../api/pdtApi";
import type { UpdateDotDangKyRequest } from "../types/pdtTypes";
import { useModalContext } from "../../../hook/ModalContext";

export const useUpdateDotDangKy = () => {
    const { openNotify } = useModalContext();
    const [loading, setLoading] = useState(false);

    const updateDotDangKy = async (data: UpdateDotDangKyRequest) => {
        setLoading(true);
        try {
            const result = await pdtApi.updateDotDangKy(data);

            if (result.isSuccess) {
                openNotify({
                    message: "✅ Cập nhật đợt đăng ký học phần thành công",
                    type: "success",
                });
            } else {
                openNotify({
                    message: result.message || "❌ Cập nhật thất bại",
                    type: "error",
                });
            }

            return result;
        } catch (error: any) {
            openNotify({
                message: `❌ Lỗi: ${error.message}`,
                type: "error",
            });
            return {
                isSuccess: false,
                message: error.message,
                data: null,
            };
        } finally {
            setLoading(false);
        }
    };

    return { updateDotDangKy, loading };
};
