import { useState, useEffect } from "react";
import { pdtApi } from "../api/pdtApi";
import type { ChinhSachTinChiDTO, CreateChinhSachTinChiRequest } from "../types/pdtTypes";
import { useModalContext } from "../../../hook/ModalContext";

export const useChinhSachTinChi = () => {
    const { openNotify } = useModalContext();
    const [data, setData] = useState<ChinhSachTinChiDTO[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await pdtApi.getChinhSachTinChi();
            if (result.isSuccess && result.data) {
                setData(result.data);
            } else {
                openNotify({ message: result.message || "Lỗi tải dữ liệu", type: "error" });
            }
        } catch (error: any) {
            openNotify({ message: `Lỗi: ${error.message}`, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const createChinhSach = async (payload: CreateChinhSachTinChiRequest) => {
        setLoading(true);
        try {
            const result = await pdtApi.createChinhSachTinChi(payload);
            if (result.isSuccess) {
                openNotify({ message: "Lưu chính sách thành công!", type: "success" });
                await fetchData();
                return true;
            } else {
                openNotify({ message: result.message || "Không thể lưu", type: "error" });
                return false;
            }
        } catch (error: any) {
            openNotify({ message: `Lỗi: ${error.message}`, type: "error" });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateChinhSach = async (id: string, phiMoiTinChi: number) => {
        setLoading(true);
        try {
            const result = await pdtApi.updateChinhSachTinChi(id, { phiMoiTinChi });
            if (result.isSuccess) {
                openNotify({ message: "Cập nhật phí tín chỉ thành công!", type: "success" });
                await fetchData();
                return true;
            } else {
                openNotify({ message: result.message || "Không thể cập nhật", type: "error" });
                return false;
            }
        } catch (error: any) {
            openNotify({ message: `Lỗi: ${error.message}`, type: "error" });
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, createChinhSach, updateChinhSach, refetch: fetchData };
};
