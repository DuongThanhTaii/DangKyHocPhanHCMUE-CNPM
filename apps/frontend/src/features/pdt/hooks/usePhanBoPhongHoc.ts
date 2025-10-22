import { useState, useEffect, useCallback } from "react";
import { pdtApi } from "../api/pdtApi";
import type { KhoaDTO, PhongHocDTO } from "../types/pdtTypes";
import { useModalContext } from "../../../hook/ModalContext";

export function usePhanBoPhongHoc() {
    const { openNotify } = useModalContext();

    const [khoas, setKhoas] = useState<KhoaDTO[]>([]);
    const [selectedKhoaId, setSelectedKhoaId] = useState<string>("");
    const [phongHocOfKhoa, setPhongHocOfKhoa] = useState<PhongHocDTO[]>([]);
    const [availablePhong, setAvailablePhong] = useState<PhongHocDTO[]>([]);

    const [loadingKhoas, setLoadingKhoas] = useState(false);
    const [loadingPhong, setLoadingPhong] = useState(false);
    const [loadingAvailable, setLoadingAvailable] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // ========== Fetch Khoas ==========
    const fetchKhoas = useCallback(async () => {
        setLoadingKhoas(true);
        try {
            const res = await pdtApi.getDanhSachKhoa();
            if (res.isSuccess && res.data) {
                setKhoas(res.data);
                // Auto-select first khoa
                if (res.data.length > 0 && !selectedKhoaId) {
                    setSelectedKhoaId(res.data[0].id);
                }
            } else {
                openNotify({ message: res.message || "Lỗi tải danh sách khoa", type: "error" });
            }
        } catch (error) {
            console.error(error);
            openNotify({ message: "Lỗi tải danh sách khoa", type: "error" });
        } finally {
            setLoadingKhoas(false);
        }
    }, [openNotify, selectedKhoaId]);

    // ========== Fetch Phong by Khoa ==========
    const fetchPhongByKhoa = useCallback(
        async (khoaId: string) => {
            if (!khoaId) {
                setPhongHocOfKhoa([]);
                return;
            }

            setLoadingPhong(true);
            try {
                const res = await pdtApi.getPhongHocByKhoa(khoaId);
                if (res.isSuccess && res.data) {
                    setPhongHocOfKhoa(res.data);
                } else {
                    openNotify({ message: res.message || "Lỗi tải phòng học", type: "error" });
                    setPhongHocOfKhoa([]);
                }
            } catch (error) {
                console.error(error);
                openNotify({ message: "Lỗi tải phòng học", type: "error" });
                setPhongHocOfKhoa([]);
            } finally {
                setLoadingPhong(false);
            }
        },
        [openNotify]
    );

    // ========== Fetch Available Phong ==========
    const fetchAvailablePhong = useCallback(async () => {
        setLoadingAvailable(true);
        try {
            const res = await pdtApi.getAvailablePhongHoc();
            if (res.isSuccess && res.data) {
                setAvailablePhong(res.data);
            } else {
                openNotify({ message: res.message || "Lỗi tải phòng available", type: "error" });
                setAvailablePhong([]);
            }
        } catch (error) {
            console.error(error);
            openNotify({ message: "Lỗi tải phòng available", type: "error" });
            setAvailablePhong([]);
        } finally {
            setLoadingAvailable(false);
        }
    }, [openNotify]);

    // ========== Assign Phong to Khoa ==========
    const addPhongToKhoa = useCallback(
        async (khoaId: string, phongIds: string[]) => {
            if (!khoaId || phongIds.length === 0) return;

            setSubmitting(true);
            try {
                const res = await pdtApi.assignPhongToKhoa(khoaId, { phongHocIds: phongIds });
                if (res.isSuccess) {
                    openNotify({ message: `Đã thêm ${phongIds.length} phòng`, type: "success" });
                    await fetchPhongByKhoa(khoaId);
                    await fetchAvailablePhong();
                } else {
                    openNotify({ message: res.message || "Lỗi thêm phòng", type: "error" });
                }
            } catch (error) {
                console.error(error);
                openNotify({ message: "Lỗi thêm phòng", type: "error" });
            } finally {
                setSubmitting(false);
            }
        },
        [openNotify, fetchPhongByKhoa, fetchAvailablePhong]
    );

    // ========== Unassign Phong from Khoa ==========
    const removePhongFromKhoa = useCallback(
        async (khoaId: string, phongId: string) => {
            if (!khoaId || !phongId) return;

            setSubmitting(true);
            try {
                const res = await pdtApi.unassignPhongFromKhoa(khoaId, { phongHocIds: [phongId] });
                if (res.isSuccess) {
                    openNotify({ message: "Đã xóa phòng khỏi khoa", type: "success" });
                    await fetchPhongByKhoa(khoaId);
                    await fetchAvailablePhong();
                } else {
                    openNotify({ message: res.message || "Lỗi xóa phòng", type: "error" });
                }
            } catch (error) {
                console.error(error);
                openNotify({ message: "Lỗi xóa phòng", type: "error" });
            } finally {
                setSubmitting(false);
            }
        },
        [openNotify, fetchPhongByKhoa, fetchAvailablePhong]
    );

    // ========== Auto-fetch on mount ==========
    useEffect(() => {
        fetchKhoas();
    }, [fetchKhoas]);

    // ========== Auto-fetch phong when khoa changes ==========
    useEffect(() => {
        if (selectedKhoaId) {
            fetchPhongByKhoa(selectedKhoaId);
        }
    }, [selectedKhoaId, fetchPhongByKhoa]);

    return {
        khoas,
        selectedKhoaId,
        setSelectedKhoaId,
        phongHocOfKhoa,
        availablePhong,
        loadingKhoas,
        loadingPhong,
        loadingAvailable,
        submitting,
        fetchAvailablePhong,
        addPhongToKhoa,
        removePhongFromKhoa,
    };
}