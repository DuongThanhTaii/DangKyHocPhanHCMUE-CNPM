import { fetchJSON } from "../../../utils/fetchJSON";
import type {
    HienHanh,
    NienKhoa,
    HocKy,
    CreateBulkKyPhaseRequest,
    HocKyNienKhoaDTO,
    SetHocKyHienTaiRequest,
    SetHocKyHienThanhRequest,
    KyPhaseResponseDTO,
    HocKyDTO,
} from "../types/pdtTypes";
import type { ServiceResult } from "../../common/ServiceResult";

/**
 * PDT API Service
 */
export const pdtApi = {
    /**
     * Lấy thông tin học kỳ hiện hành
     */
    getHienHanh: async (): Promise<HienHanh | null> => {
        const response = await fetchJSON("/api/hien-hanh");
        return response?.data ?? null;
    },

    /**
     * Lấy danh sách niên khóa
     */
    getNienKhoa: async (): Promise<NienKhoa[]> => {
        const response = await fetchJSON("/api/pdt/nien-khoa");
        return response?.data ?? [];
    },

    /**
     * Lấy danh sách học kỳ theo niên khóa
     */
    getHocKy: async (nienKhoaId: string): Promise<HocKy[]> => {
        const response = await fetchJSON(`/api/pdt/hoc-ky?nien_khoa_id=${nienKhoaId}`);
        return response?.data ?? [];
    },

    /**
     * Lấy danh sách học kỳ kèm niên khóa
     */
    getHocKyNienKhoa: async (): Promise<HocKyNienKhoaDTO[]> => {
        const response = await fetchJSON("/pdt/hoc-ky-nien-khoa");
        return response?.data ?? [];
    },

    /**
     * ✅ Lấy thông tin học kỳ hiện hành
     */
    getHocKyHienHanh: async (): Promise<ServiceResult<HocKyDTO>> => {
        return await fetchJSON("/pdt/hoc-ky-hien-hanh");
    },

    /**
     * ✅ Thiết lập học kỳ hiện tại (cần ngày)
     */
    setHocKyHienTai: async (
        data: SetHocKyHienTaiRequest
    ): Promise<ServiceResult<KyPhaseResponseDTO>> => {
        return await fetchJSON("/pdt/ky-phase/create", {
            method: "POST",
            body: data,
        });
    },

    /**
     * ✅ Chuyển trạng thái học kỳ hiện hành (chỉ cần hocKyId)
     */
    setHocKyHienHanh: async (
        data: SetHocKyHienThanhRequest
    ): Promise<ServiceResult<HocKyDTO>> => {
        return await fetchJSON("/pdt/hoc-ky-hien-hanh", {
            method: "POST",
            body: data,
        });
    },

    /**
     * ✅ Bulk upsert phases
     */
    createBulkKyPhase: async (
        data: CreateBulkKyPhaseRequest
    ): Promise<ServiceResult<KyPhaseResponseDTO[]>> => {
        return await fetchJSON("/pdt/ky-phase/bulk", {
            method: "POST",
            body: data,
        });
    },
};

