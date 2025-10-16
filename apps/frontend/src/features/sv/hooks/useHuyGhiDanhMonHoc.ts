import { useState } from "react";
import { svApi } from "../api/svApi";
import { useModalContext } from "../../../hook/ModalContext";

export const useHuyGhiDanhMonHoc = () => {
    const [loading, setLoading] = useState(false);
    const { openNotify } = useModalContext();

    /**
     * ✅ Hủy ghi danh nhiều môn học cùng lúc
     * @param ghiDanhIds - Array of ghi danh IDs to cancel
     * @returns Number of successfully cancelled items
     */
    const huyGhiDanhNhieuMonHoc = async (ghiDanhIds: string[]): Promise<number> => {
        if (ghiDanhIds.length === 0) {
            openNotify({
                message: "Vui lòng chọn ít nhất 1 môn học để hủy",
                type: "warning",
            });
            return 0;
        }

        setLoading(true);

        try {
            console.log("🗑️ Hủy ghi danh:", ghiDanhIds);

            const result = await svApi.huyGhiDanhMonHoc({ ghiDanhIds });

            if (result.isSuccess) {
                const successCount = ghiDanhIds.length;

                console.log(`✅ Hủy thành công ${successCount} môn học`);

                openNotify({
                    message: `✅ Đã hủy ghi danh ${successCount} môn học`,
                    type: "success",
                });

                return successCount;
            } else {
                console.log("❌ Hủy thất bại:", result.message);

                openNotify({
                    message: result.message || "Không thể hủy ghi danh",
                    type: "error",
                });

                return 0;
            }
        } catch (error: any) {
            console.error("💥 Error hủy ghi danh:", error);

            openNotify({
                message: error.message || "Có lỗi xảy ra khi hủy ghi danh",
                type: "error",
            });

            return 0;
        } finally {
            setLoading(false);
        }
    };

    return {
        huyGhiDanhNhieuMonHoc,
        loading,
    };
};