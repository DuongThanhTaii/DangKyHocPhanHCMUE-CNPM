import { fetchJSON } from "../../../utils/fetchJSON";
import type {
    HienHanh,
    NienKhoa,
    HocKy,
    CreateBulkKyPhaseRequest,
    HocKyNienKhoaDTO,
    SetHocKyHienTaiRequest,
    KyPhaseResponseDTO,
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
     * Thiết lập học kỳ hiện tại và tạo KyPhase
     */
    setHocKyHienTai: async (
        data: SetHocKyHienTaiRequest
    ): Promise<ServiceResult<KyPhaseResponseDTO>> => {
        try {
            const response = await fetchJSON("/pdt/ky-phase/create", {
                method: "POST",
                body: data,
            });

            if (!response?.isSuccess) {
                return {
                    isSuccess: false,
                    message: response?.message || "Không thể thiết lập học kỳ hiện tại",
                    errorCode: response?.errorCode,
                };
            }

            // Parse Date từ response data
            const parsedData: KyPhaseResponseDTO | undefined = response.data
                ? {
                    id: response.data.id,
                    hocKyId: response.data.hocKyId,
                    phase: response.data.phase,
                    startAt: new Date(response.data.startAt),
                    endAt: new Date(response.data.endAt),
                    isEnabled: response.data.isEnabled,
                }
                : undefined;

            return {
                isSuccess: true,
                message: response.message || "Thiết lập học kỳ hiện tại thành công",
                data: parsedData,
            };
        } catch (error) {
            return {
                isSuccess: false,
                message: error instanceof Error ? error.message : "Lỗi không xác định",
                errorCode: "NETWORK_ERROR",
            };
        }
    },
    createBulkKyPhase: async (
        data: CreateBulkKyPhaseRequest
    ): Promise<ServiceResult<KyPhaseResponseDTO[]>> => {
        const response = await fetchJSON("/pdt/ky-phase/bulk", {
            method: "POST",
            body: data,
        });

        if (response?.isSuccess && Array.isArray(response.data)) {
            response.data = response.data.map((item: any) => ({
                ...item,
                startAt: new Date(item.startAt),
                endAt: new Date(item.endAt),
            }));
        }

        return response as ServiceResult<KyPhaseResponseDTO[]>;
    },

};

