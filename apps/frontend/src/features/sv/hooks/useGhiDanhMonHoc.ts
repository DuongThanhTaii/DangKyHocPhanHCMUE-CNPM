import { useState } from "react";
import { svApi } from "../api/svApi";
import { useModalContext } from "../../../hook/ModalContext";

/**
 * Hook xử lý ghi danh & hủy ghi danh môn học
 */
export const useGhiDanhMonHoc = () => {
    const [loading, setLoading] = useState(false);
    const { openNotify } = useModalContext();

    /**
     * ✅ Ghi danh 1 môn học
     */
    const ghiDanhMonHoc = async (id: string): Promise<boolean> => {
        try {
            setLoading(true);

            const result = await svApi.ghiDanhMonHoc({ id });

            if (result.isSuccess) {
                openNotify({
                    message: "Ghi danh thành công",
                    type: "success",
                });
                return true;
            } else {
                openNotify({
                    message: result.message || "Ghi danh thất bại",
                    type: "error",
                });
                return false;
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Lỗi không xác định";
            openNotify({
                message: errorMessage,
                type: "error",
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    /**
     * ✅ Ghi danh nhiều môn học (sequential - từng môn 1)
     * @param ids - Mảng ID học phần cần ghi danh
     * @returns Số môn ghi danh thành công
     */
    const ghiDanhNhieuMonHoc = async (ids: string[]): Promise<number> => {
        if (ids.length === 0) {
            openNotify({
                message: "Chưa chọn môn học để ghi danh",
                type: "warning",
            });
            return 0;
        }

        setLoading(true);
        let successCount = 0;
        const errors: string[] = [];

        for (const id of ids) {
            try {
                const result = await svApi.ghiDanhMonHoc({ id });

                if (result.isSuccess) {
                    successCount++;
                } else {
                    errors.push(result.message || `Lỗi ghi danh môn ${id}`);
                }
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Lỗi không xác định";
                errors.push(`Môn ${id}: ${errorMessage}`);
            }
        }

        setLoading(false);

        // ✅ Thông báo kết quả
        if (successCount === ids.length) {
            openNotify({
                message: `Ghi danh thành công ${successCount}/${ids.length} môn học`,
                type: "success",
            });
        } else if (successCount > 0) {
            openNotify({
                message: `Ghi danh thành công ${successCount}/${ids.length} môn học. ${errors.length} môn thất bại.`,
                type: "warning",
                title: "Ghi danh một phần",
            });
        } else {
            openNotify({
                message: `Ghi danh thất bại tất cả ${ids.length} môn học`,
                type: "error",
                title: "Lỗi",
            });
        }

        return successCount;
    };

    /**
     * ✅ Hủy ghi danh 1 môn học
     */
    const huyGhiDanhMonHoc = async (id: string): Promise<boolean> => {
        try {
            setLoading(true);

            const result = await svApi.huyGhiDanhMonHoc(id);

            if (result.isSuccess) {
                openNotify({
                    message: "Hủy ghi danh thành công",
                    type: "success",
                });
                return true;
            } else {
                openNotify({
                    message: result.message || "Hủy ghi danh thất bại",
                    type: "error",
                });
                return false;
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Lỗi không xác định";
            openNotify({
                message: errorMessage,
                type: "error",
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    /**
     * ✅ Hủy ghi danh nhiều môn học
     */
    const huyGhiDanhNhieuMonHoc = async (ids: string[]): Promise<number> => {
        if (ids.length === 0) {
            openNotify({
                message: "Chưa chọn môn học để hủy",
                type: "warning",
            });
            return 0;
        }

        setLoading(true);
        let successCount = 0;

        for (const id of ids) {
            try {
                const result = await svApi.huyGhiDanhMonHoc(id);
                if (result.isSuccess) {
                    successCount++;
                }
            } catch (err) {
                console.error(`Lỗi hủy môn ${id}:`, err);
            }
        }

        setLoading(false);

        openNotify({
            message: `Hủy ghi danh thành công ${successCount}/${ids.length} môn học`,
            type: successCount === ids.length ? "success" : "warning",
        });

        return successCount;
    };

    return {
        loading,
        ghiDanhMonHoc,
        ghiDanhNhieuMonHoc,
        huyGhiDanhMonHoc,
        huyGhiDanhNhieuMonHoc,
    };
};