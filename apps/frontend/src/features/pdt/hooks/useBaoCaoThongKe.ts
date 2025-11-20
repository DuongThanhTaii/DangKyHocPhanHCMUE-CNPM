import { useState } from "react";
import { pdtApi } from "../api/pdtApi";
import type {
    OverviewPayload,
    DKTheoKhoaRow,
    DKTheoNganhRow,
    TaiGiangVienRow,
} from "../types/pdtTypes";

/**
 * Hook lấy thống kê tổng quan
 */
export const useBaoCaoOverview = () => {
    const [data, setData] = useState<OverviewPayload | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = async (params: {
        hoc_ky_id: string;
        khoa_id?: string;
        nganh_id?: string;
    }) => {
        setLoading(true);
        setError(null);

        try {
            const result = await pdtApi.getBaoCaoOverview(params);

            if (result.isSuccess && result.data) {
                setData(result.data);
            } else {
                setError(result.message || "Không thể lấy thống kê tổng quan");
                setData(null);
            }

            return result;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Lỗi không xác định";
            setError(errorMessage);
            setData(null);
            return { isSuccess: false, message: errorMessage, data: null };
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, fetch };
};

/**
 * Hook lấy thống kê đăng ký theo khoa
 */
export const useBaoCaoDangKyTheoKhoa = () => {
    const [data, setData] = useState<DKTheoKhoaRow[]>([]);
    const [ketLuan, setKetLuan] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = async (hocKyId: string) => {
        setLoading(true);
        setError(null);

        try {
            const result = await pdtApi.getBaoCaoDangKyTheoKhoa(hocKyId);

            if (result.isSuccess && result.data) {
                setData(result.data.data || []);
                setKetLuan(result.data.ketLuan || "");
            } else {
                setError(result.message || "Không thể lấy thống kê theo khoa");
                setData([]);
                setKetLuan("");
            }

            return result;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Lỗi không xác định";
            setError(errorMessage);
            setData([]);
            setKetLuan("");
            return { isSuccess: false, message: errorMessage, data: null };
        } finally {
            setLoading(false);
        }
    };

    return { data, ketLuan, loading, error, fetch };
};

/**
 * Hook lấy thống kê đăng ký theo ngành
 */
export const useBaoCaoDangKyTheoNganh = () => {
    const [data, setData] = useState<DKTheoNganhRow[]>([]);
    const [ketLuan, setKetLuan] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = async (params: { hocKyId: string; khoaId?: string }) => {
        setLoading(true);
        setError(null);

        try {
            const result = await pdtApi.getBaoCaoDangKyTheoNganh(params);

            if (result.isSuccess && result.data) {
                setData(result.data.data || []);
                setKetLuan(result.data.ketLuan || "");
            } else {
                setError(result.message || "Không thể lấy thống kê theo ngành");
                setData([]);
                setKetLuan("");
            }

            return result;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Lỗi không xác định";
            setError(errorMessage);
            setData([]);
            setKetLuan("");
            return { isSuccess: false, message: errorMessage, data: null };
        } finally {
            setLoading(false);
        }
    };

    return { data, ketLuan, loading, error, fetch };
};

/**
 * Hook lấy thống kê tải giảng viên
 */
export const useBaoCaoTaiGiangVien = () => {
    const [data, setData] = useState<TaiGiangVienRow[]>([]);
    const [ketLuan, setKetLuan] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = async (params: { hocKyId: string; khoaId?: string }) => {
        setLoading(true);
        setError(null);

        try {
            const result = await pdtApi.getBaoCaoTaiGiangVien(params);

            if (result.isSuccess && result.data) {
                setData(result.data.data || []);
                setKetLuan(result.data.ketLuan || "");
            } else {
                setError(result.message || "Không thể lấy thống kê tải giảng viên");
                setData([]);
                setKetLuan("");
            }

            return result;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Lỗi không xác định";
            setError(errorMessage);
            setData([]);
            setKetLuan("");
            return { isSuccess: false, message: errorMessage, data: null };
        } finally {
            setLoading(false);
        }
    };

    return { data, ketLuan, loading, error, fetch };
};

/**
 * Hook export Excel/PDF
 */
export const useBaoCaoExport = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const exportExcel = async (params: {
        hoc_ky_id: string;
        khoa_id?: string;
        nganh_id?: string;
    }) => {
        setLoading(true);
        setError(null);

        try {
            const blob = await pdtApi.exportBaoCaoExcel(params);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `bao_cao_${params.hoc_ky_id}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Lỗi không xác định";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const exportPDF = async (data: {
        hoc_ky_id: string;
        khoa_id?: string; // ✅ Changed from string | null
        nganh_id?: string; // ✅ Changed from string | null
        charts: { name: string; dataUrl: string }[];
    }) => {
        setLoading(true);
        setError(null);

        try {
            const blob = await pdtApi.exportBaoCaoPDF(data);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `bao_cao_${data.hoc_ky_id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Lỗi không xác định";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, exportExcel, exportPDF };
};
