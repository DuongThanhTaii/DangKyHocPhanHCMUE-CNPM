import { useState, useEffect } from "react";
import { svApi } from "../api/svApi";
import type {
    DanhSachLopHocPhanDTO,
    DanhSachLopDaDangKyDTO,
    DangKyHocPhanRequest,
    HuyDangKyHocPhanRequest,
    ChuyenLopHocPhanRequest,
} from "../types";

import type { LopHocPhanItemDTO } from "../types";

/**
 * Hook kiểm tra phase đăng ký học phần
 */
export const useCheckPhaseDangKy = (hocKyId: string) => {
    const [canRegister, setCanRegister] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!hocKyId) {
            setLoading(false);
            return;
        }

        const checkPhase = async () => {
            setLoading(true);
            try {
                const result = await svApi.checkPhaseDangKy(hocKyId);

                // ✅ Backend: isSuccess = true → canRegister = true
                //           isSuccess = false → canRegister = false
                setCanRegister(result.isSuccess);
                setMessage(result.message || "");
            } catch (err) {
                console.error("Error checking phase:", err);
                setCanRegister(false);
                setMessage("Lỗi khi kiểm tra phase");
            } finally {
                setLoading(false);
            }
        };

        checkPhase();
    }, [hocKyId]);

    return { canRegister, loading, message };
};

/**
 * Hook lấy danh sách lớp học phần (chưa đăng ký)
 */
export const useDanhSachLopHocPhan = (hocKyId: string) => {
    const [data, setData] = useState<DanhSachLopHocPhanDTO | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!hocKyId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const result = await svApi.getDanhSachLopHocPhan(hocKyId);
            if (result.isSuccess && result.data) {
                setData(result.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [hocKyId]);

    return { data, loading, refetch: fetchData };
};

/**
 * Hook lấy danh sách lớp đã đăng ký
 */
export const useLopDaDangKy = (hocKyId: string) => {
    const [data, setData] = useState<DanhSachLopDaDangKyDTO>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!hocKyId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const result = await svApi.getLopDaDangKy(hocKyId);
            if (result.isSuccess && result.data) {
                setData(result.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [hocKyId]);

    return { data, loading, refetch: fetchData };
};

/**
 * Hook đăng ký & hủy đăng ký học phần
 */
export const useDangKyActions = () => {
    const [loading, setLoading] = useState(false);

    const dangKy = async (data: DangKyHocPhanRequest) => {
        setLoading(true);
        try {
            const result = await svApi.dangKyLopHocPhan(data);
            return result;
        } catch (err) {
            console.error(err);
            return {
                isSuccess: false,
                message: "Lỗi kết nối",
                data: null,
            };
        } finally {
            setLoading(false);
        }
    };

    const huyDangKy = async (data: HuyDangKyHocPhanRequest) => {
        setLoading(true);
        try {
            const result = await svApi.huyDangKyLopHocPhan(data);
            return result;
        } catch (err) {
            console.error(err);
            return {
                isSuccess: false,
                message: "Lỗi kết nối",
                data: null,
            };
        } finally {
            setLoading(false);
        }
    };

    return { dangKy, huyDangKy, loading };
};

/**
 * ✅ Hook chuyển lớp học phần
 */
export const useChuyenLopHocPhan = () => {
    const [loading, setLoading] = useState(false);

    const chuyenLop = async (data: ChuyenLopHocPhanRequest) => {
        setLoading(true);
        try {
            const result = await svApi.chuyenLopHocPhan(data);
            return result;
        } catch (err) {
            console.error(err);
            return {
                isSuccess: false,
                message: "Lỗi kết nối",
                data: null,
            };
        } finally {
            setLoading(false);
        }
    };

    return { chuyenLop, loading };
};

/**
 * ✅ Hook load lớp chưa đăng ký theo môn
 */
export const useLopChuaDangKyByMonHoc = () => {
    const [data, setData] = useState<LopHocPhanItemDTO[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLop = async (monHocId: string, hocKyId: string) => {
        if (!monHocId || !hocKyId) {
            setData([]);
            return;
        }

        setLoading(true);
        try {
            const result = await svApi.getLopChuaDangKyByMonHoc(monHocId, hocKyId);
            if (result.isSuccess && result.data) {
                setData(result.data);
            } else {
                setData([]);
            }
        } catch (err) {
            console.error(err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, fetchLop };
};
