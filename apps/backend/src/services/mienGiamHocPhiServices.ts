import { MienGiamHocPhiRepository } from "../repositories/mienGiamHocPhiRepository";

type UpsertInput = {
  sinh_vien_id: string;
  hoc_ky_id: string;
  loai: string; // ví dụ: 'nghi_dinh_mien_hoc_phi'
  mien_phi?: boolean; // true => auto 100%
  ti_le_giam?: number; // 0..100
  ghi_chu?: string;
};

export const MienGiamHocPhiServices = {
  /** Tạo/cập nhật miễn-giảm theo (sv, kỳ, loại) */
  async upsert(input: UpsertInput) {
    return MienGiamHocPhiRepository.upsert(input);
  },

  /** Liệt kê miễn-giảm của 1 học kỳ (kèm thông tin SV) */
  async listBySemester(hoc_ky_id: string) {
    return MienGiamHocPhiRepository.listBySemester(hoc_ky_id);
  },

  /** Xoá một record miễn-giảm cụ thể */
  async delete(sinh_vien_id: string, hoc_ky_id: string, loai: string) {
    return MienGiamHocPhiRepository.delete(sinh_vien_id, hoc_ky_id, loai);
  },
};
