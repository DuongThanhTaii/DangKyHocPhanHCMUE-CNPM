import { useState, useEffect } from "react";
import { svApi } from "../api/svApi";
import type { PaymentStatusResponse } from "../types";

/**
 * ✅ Hook poll payment status (every 3s)
 * ✅ Stop polling when status is final (success, failed, cancelled)
 */
export const usePaymentStatus = (orderId: string, shouldPoll: boolean = false) => {
    const [data, setData] = useState<PaymentStatusResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pollCount, setPollCount] = useState(0);

    useEffect(() => {
        if (!orderId || !shouldPoll) {
            // ✅ Reset poll count when not polling
            setPollCount(0);
            return;
        }

        const MAX_POLLS = 20; // Max 20 * 3s = 60s polling
        let intervalId: ReturnType<typeof setInterval>; // ✅ Use ReturnType

        const fetchStatus = async () => {
            setLoading(true);
            try {
                const result = await svApi.getPaymentStatus(orderId);

                if (result.isSuccess && result.data) {
                    setData(result.data);

                    console.log("📦 Payment status:", result.data.status);

                    // ✅ Stop polling nếu status là final
                    const finalStatuses = ["success", "failed", "cancelled"];
                    if (finalStatuses.includes(result.data.status)) {
                        console.log("✅ Payment reached final status, stop polling");
                        clearInterval(intervalId);
                    }
                } else {
                    // ✅ Silently handle errors (401, etc.)
                    if (result.errorCode !== "UNAUTHORIZED") {
                        setError(result.message || "Không thể lấy trạng thái");
                    }
                }
            } catch (err: any) {
                console.warn("⚠️ Poll error:", err.message);
            } finally {
                setLoading(false);
            }
        };

        // ✅ Initial fetch
        fetchStatus();

        // ✅ Setup polling interval
        intervalId = setInterval(() => {
            setPollCount((prev) => {
                if (prev >= MAX_POLLS) {
                    console.log("⏱️ Max polls reached, stop polling");
                    clearInterval(intervalId);
                    return prev;
                }

                // ✅ Only poll if status is still pending
                if (data?.status === "pending" || !data) {
                    fetchStatus();
                }

                return prev + 1;
            });
        }, 3000) as unknown as number; // ✅ Cast if needed

        return () => {
            console.log("🧹 Cleanup: Clear polling interval");
            clearInterval(intervalId);
        };
    }, [orderId, shouldPoll]); // ✅ Remove data.status from deps

    return { data, loading, error, pollCount }; // ✅ Expose pollCount
};
