import { useState } from "react";
import { svApi } from "../api/svApi";
import type { CreatePaymentRequest } from "../types";
import { useModalContext } from "../../../hook/ModalContext";

export const useCreatePayment = () => {
    const { openNotify } = useModalContext();
    const [loading, setLoading] = useState(false);

    const createPayment = async (data: CreatePaymentRequest) => {
        setLoading(true);
        try {
            const result = await svApi.createPayment(data);

            if (result.isSuccess && result.data) {
                console.log("✅ Payment created:", result.data);
                return { success: true, data: result.data };
            } else {
                // ✅ Handle specific error codes
                const errorCode = result.errorCode;

                if (errorCode === "ALREADY_PAID") {
                    openNotify({
                        message: "Học phí đã được thanh toán rồi",
                        type: "warning",
                    });
                } else if (errorCode === "PAYMENT_PENDING") {
                    openNotify({
                        message: "Bạn đang có 1 giao dịch chưa hoàn tất. Vui lòng hoàn tất hoặc hủy trước.",
                        type: "warning",
                    });
                } else {
                    openNotify({
                        message: result.message || "Không thể tạo thanh toán",
                        type: "error",
                    });
                }

                return { success: false, message: result.message };
            }
        } catch (error: any) {
            console.error("❌ Error creating payment:", error);
            openNotify({
                message: error.message || "Đã xảy ra lỗi khi tạo thanh toán",
                type: "error",
            });
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    return { createPayment, loading };
};
