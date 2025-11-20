import { useState, useEffect } from "react";
import { svApi } from "../api/svApi";
import type { LopDaDangKyWithTaiLieuDTO, SVTaiLieuDTO } from "../types";

export function useSVTaiLieu(hocKyId: string | null) {
    const [lopDaDangKy, setLopDaDangKy] = useState<LopDaDangKyWithTaiLieuDTO[]>([]);
    const [selectedLop, setSelectedLop] = useState<LopDaDangKyWithTaiLieuDTO | null>(null);
    const [taiLieu, setTaiLieu] = useState<SVTaiLieuDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load danh sách lớp đã đăng ký kèm tài liệu
    useEffect(() => {
        if (!hocKyId) {
            setLopDaDangKy([]);
            return;
        }

        const fetchLopDaDangKy = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await svApi.getLopDaDangKyWithTaiLieu(hocKyId);

                if (result.isSuccess && result.data) {
                    setLopDaDangKy(result.data);

                    // Auto select lớp đầu tiên nếu có
                    if (result.data.length > 0 && !selectedLop) {
                        setSelectedLop(result.data[0]);
                        setTaiLieu(result.data[0].taiLieu);
                    }
                } else {
                    setError(result.message || "Không thể tải danh sách lớp");
                    setLopDaDangKy([]);
                }
            } catch (err) {
                setError("Lỗi khi tải danh sách lớp");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLopDaDangKy();
    }, [hocKyId]);

    // Load chi tiết tài liệu của lớp đã chọn
    const loadTaiLieuByLop = async (lopHocPhanId: string) => {
        setLoading(true);
        setError(null);

        try {
            const result = await svApi.getTaiLieuByLopHocPhan(lopHocPhanId);

            if (result.isSuccess && result.data) {
                setTaiLieu(result.data);
            } else {
                setError(result.message || "Không thể tải tài liệu");
                setTaiLieu([]);
            }
        } catch (err) {
            setError("Lỗi khi tải tài liệu");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Chọn lớp và load tài liệu
    const selectLop = (lop: LopDaDangKyWithTaiLieuDTO) => {
        setSelectedLop(lop);
        setTaiLieu(lop.taiLieu);
        // Nếu cần load chi tiết hơn, có thể gọi loadTaiLieuByLop
        // loadTaiLieuByLop(lop.lopHocPhanId);
    };

    // Download tài liệu
    const downloadTaiLieu = async (docId: string, fileName: string) => {
        if (!selectedLop) return;

        try {
            const blob = await svApi.downloadTaiLieu(selectedLop.lopHocPhanId, docId);

            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error("Download failed:", err);
            setError("Không thể tải xuống tài liệu");
        }
    };

    return {
        lopDaDangKy,
        selectedLop,
        taiLieu,
        loading,
        error,
        selectLop,
        loadTaiLieuByLop,
        downloadTaiLieu,
    };
}
