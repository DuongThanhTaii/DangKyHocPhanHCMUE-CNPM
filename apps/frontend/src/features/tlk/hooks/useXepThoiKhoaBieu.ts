import { useState } from "react";
import { tlkAPI } from "../api/tlkAPI";
import type { XepTKBRequest } from "../types";
import { useModalContext } from "../../../hook/ModalContext";

export const useXepThoiKhoaBieu = () => {
    const { openNotify } = useModalContext();
    const [submitting, setSubmitting] = useState(false);

    const xepTKB = async (data: XepTKBRequest) => {
        setSubmitting(true);

        try {
            const result = await tlkAPI.xepThoiKhoaBieu(data);

            if (result.isSuccess) {
                openNotify({
                    message: "Đã xếp thời khóa biểu thành công!",
                    type: "success",
                });
                return { success: true };
            } else {
                openNotify({
                    message: result.message || "Lỗi xếp thời khóa biểu",
                    type: "error",
                });
                return { success: false, message: result.message };
            }
        } catch (error: any) {
            console.error("Error xep TKB:", error);
            openNotify({
                message: error.message || "Đã xảy ra lỗi khi xếp thời khóa biểu",
                type: "error",
            });
            return { success: false, message: error.message };
        } finally {
            setSubmitting(false);
        }
    };

    return {
        xepTKB,
        submitting,
    };
};