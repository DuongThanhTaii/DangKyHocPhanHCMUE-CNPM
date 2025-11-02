import { useState, useEffect } from "react";
import { tkApi } from "../api/tkApi";
import { useModalContext } from "../../../hook/ModalContext";
import type { DeXuatHocPhanForTruongKhoaDTO } from "../types";

/**
 * Hook để quản lý đề xuất học phần cho Trưởng Khoa
 */
export const useDeXuatHocPhan = () => {
  const [data, setData] = useState<DeXuatHocPhanForTruongKhoaDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { openNotify } = useModalContext();

  /**
   * ✅ Fetch danh sách đề xuất
   */
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await tkApi.getDeXuatHocPhan();

      if (result.isSuccess && result.data) {
        setData(result.data);
      } else {
        setError(result.message || "Không thể lấy danh sách đề xuất");
        setData([]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi không xác định";
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ Duyệt đề xuất
   */
  const duyetDeXuat = async (id: string) => {
    try {
      setLoading(true);
      console.log("Duyệt đề xuất với id:", id);
      const result = await tkApi.duyetDeXuatHocPhan({ id });

      if (result.isSuccess) {
        openNotify({
          message: "Đã duyệt đề xuất thành công",
          type: "success",
          title: "Thành công",
        });
        await fetchData();
        return true;
      } else {
        openNotify({
          message: result.message || "Duyệt đề xuất thất bại",
          type: "error",
          title: "Lỗi",
        });
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi không xác định";
      openNotify({
        message: errorMessage,
        type: "error",
        title: "Lỗi",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ Từ chối đề xuất
   */
  const tuChoiDeXuat = async (id: string) => {
    try {
      setLoading(true);

      const result = await tkApi.tuChoiDeXuatHocPhan({ id });

      if (result.isSuccess) {
        openNotify({
          message: "Đã từ chối đề xuất",
          type: "success",
          title: "Thành công",
        });
        await fetchData();
        return true;
      } else {
        openNotify({
          message: result.message || "Từ chối đề xuất thất bại",
          type: "error",
          title: "Lỗi",
        });
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi không xác định";
      openNotify({
        message: errorMessage,
        type: "error",
        title: "Lỗi",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    duyetDeXuat,
    tuChoiDeXuat, // ✅ Export action từ chối
  };
};
