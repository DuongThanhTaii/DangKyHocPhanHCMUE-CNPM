import { fetchJSON } from "../../../utils/fetchJSON";
import type { ServiceResult } from "../../common/ServiceResult";
import type { TuChoiDeXuatHocPhanRequest } from "../../common/types";
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
    DeXuatHocPhanForPDTDTO,
    UpdateTrangThaiByPDTRequest,
    HocKyHienHanhDTO,
    PhasesByHocKyDTO,
    GetPhasesByHocKyRequest,
    KhoaDTO,
    UpdateDotGhiDanhRequest, // ✅ Import
    DotGhiDanhResponseDTO, // ✅ Import
    PhongHocDTO,
    AssignPhongRequest,
    UnassignPhongRequest,
} from "../types/pdtTypes";

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
    getHocKyHienHanh: async (): Promise<ServiceResult<HocKyHienHanhDTO>> => {
        return await fetchJSON("pdt/hoc-ky-hien-hanh", {
            method: "GET",
        });
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

    /**
     * ✅ Lấy danh sách đề xuất học phần cho PDT
     */
    getDeXuatHocPhan: async (): Promise<ServiceResult<DeXuatHocPhanForPDTDTO[]>> => {
        return await fetchJSON("pdt/de-xuat-hoc-phan", {
            method: "GET",
        });
    },

    /**
     * ✅ Duyệt đề xuất học phần (PDT)
     */
    duyetDeXuatHocPhan: async (
        data: UpdateTrangThaiByPDTRequest
    ): Promise<ServiceResult<null>> => {
        return await fetchJSON("pdt/de-xuat-hoc-phan/duyet", {
            method: "PATCH",
            body: data,
        });
    },

    /**
     * ✅ Từ chối đề xuất học phần (shared endpoint)
     */
    tuChoiDeXuatHocPhan: async (
        data: TuChoiDeXuatHocPhanRequest
    ): Promise<ServiceResult<null>> => {
        return await fetchJSON("pdt/de-xuat-hoc-phan/tu-choi", {
            method: "PATCH",
            body: data,
        });
    },

    /**
     * ✅ Lấy tất cả phases theo học kỳ ID
     */
    getPhasesByHocKy: async (hocKyId: string): Promise<ServiceResult<PhasesByHocKyDTO>> => {
        return await fetchJSON(`pdt/ky-phase/${hocKyId}`, {
            method: "GET",
        });
    },

    /**
     * ✅ Lấy danh sách khoa
     */
    getDanhSachKhoa: async (): Promise<ServiceResult<KhoaDTO[]>> => {
        return await fetchJSON("pdt/khoa", {
            method: "GET",
        });
    },

    /**
     * ✅ Cập nhật đợt ghi danh theo khoa
     */
    updateDotGhiDanh: async (
        data: UpdateDotGhiDanhRequest
    ): Promise<ServiceResult<DotGhiDanhResponseDTO[]>> => {
        return await fetchJSON("pdt/dot-ghi-danh/update", {
            method: "POST",
            body: data,
        });
    },

    /**
     * ✅ Lấy danh sách đợt ghi danh theo học kỳ
     */
    getDotGhiDanhByHocKy: async (
        hocKyId: string
    ): Promise<ServiceResult<DotGhiDanhResponseDTO[]>> => {
        return await fetchJSON(`pdt/dot-dang-ky/${hocKyId}`, {
            method: "GET",
        });
    },
    /**
     * ✅ Lấy danh sách phòng học available (chưa được phân)
     */
    getAvailablePhongHoc: async (): Promise<ServiceResult<PhongHocDTO[]>> => {
        return await fetchJSON("pdt/phong-hoc/available", {
            method: "GET",
        });
    },

    /**
     * ✅ Lấy danh sách phòng học của khoa
     */
    getPhongHocByKhoa: async (khoaId: string): Promise<ServiceResult<PhongHocDTO[]>> => {
        return await fetchJSON(`pdt/phong-hoc/khoa/${khoaId}`, {
            method: "GET",
        });
    },

    /**
     * ✅ Gán phòng cho khoa
     */
    assignPhongToKhoa: async (
        khoaId: string,
        data: AssignPhongRequest
    ): Promise<ServiceResult<{ count: number }>> => {
        return await fetchJSON(`pdt/phong-hoc/khoa/${khoaId}/assign`, {
            method: "PATCH",
            body: data,
        });
    },

    /**
     * ✅ Xóa phòng khỏi khoa
     */
    unassignPhongFromKhoa: async (
        khoaId: string,
        data: UnassignPhongRequest
    ): Promise<ServiceResult<{ count: number }>> => {
        return await fetchJSON(`pdt/phong-hoc/khoa/${khoaId}/unassign`, {
            method: "PATCH",
            body: data,
        });
    },
};

