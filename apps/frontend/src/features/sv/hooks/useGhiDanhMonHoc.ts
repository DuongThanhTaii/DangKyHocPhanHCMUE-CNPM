import { useState } from "react";
import { svApi } from "../api/svApi";
import { useModalContext } from "../../../hook/ModalContext";

export const useGhiDanhMonHoc = () => {
    const [loading, setLoading] = useState(false);
    const { openNotify } = useModalContext();

    /**
     * ✅ Ghi danh nhiều môn học cùng lúc
     */
    const ghiDanhNhieuMonHoc = async (monHocIds: string[]): Promise<number> => {
        if (monHocIds.length === 0) {
            openNotify({
                message: "Vui lòng chọn ít nhất 1 môn học",
                type: "warning",
            });
            return 0;
        }

        setLoading(true);

        let successCount = 0;
        const errors: string[] = [];

        try {
            for (const monHocId of monHocIds) {
                try {
                    console.log(`📝 Ghi danh môn: ${monHocId}`);

                    const result = await svApi.ghiDanhMonHoc({ monHocId });
                    console.log(result);
                    if (result.isSuccess) {
                        successCount++;
                        console.log(`✅ Success: ${monHocId}`);
                    } else {
                        errors.push(result.message);
                        console.log(`❌ Failed: ${monHocId} - ${result.message}`);
                    }
                } catch (err: any) {
                    errors.push(err.message || `Lỗi môn ${monHocId}`);
                    console.error(`💥 Exception for ${monHocId}:`, err);
                }
            }

            // Show result notification
            if (successCount > 0) {
                openNotify({
                    message: `✅ Đã ghi danh thành công ${successCount}/${monHocIds.length} môn học`,
                    type: "success",
                });
            }

            if (errors.length > 0) {
                openNotify({
                    message: `❌ Có ${errors.length} môn thất bại: ${errors.join(", ")}`,
                    type: "error",
                });
            }

            return successCount;
        } finally {
            setLoading(false);
        }
    };

    /**
     * ✅ Hủy ghi danh nhiều môn học
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
        ghiDanhNhieuMonHoc,
        huyGhiDanhNhieuMonHoc,
        loading,
    };
};