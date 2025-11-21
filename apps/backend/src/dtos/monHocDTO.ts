// Danh sách loại môn gợi ý (không bắt buộc, tuỳ DB bạn)
export type TLoaiMon = "chuyen_nganh" | "tu_chon";

export type TCreateMonHocDTO = {
  ma_mon: string;
  ten_mon: string;
  so_tin_chi: number;
  khoa_id: string;
  loai_mon?: string; // "chuyen_nganh" | ...
  la_mon_chung?: boolean; // default false
  thu_tu_hoc?: number; // >=1

  // gán ngành: danh sách nganh_id
  nganh_ids?: string[];

  // khai báo môn điều kiện (tiên quyết/ song hành hoặc tuỳ bạn quy ước)
  // chú ý: tham chiếu theo id của mon_hoc đã có
  dieu_kien?: Array<{
    mon_lien_quan_id: string;
    loai: string; // ví dụ: "tien_quyet" | "song_hanh"
    bat_buoc?: boolean; // default true
  }>;
};

export type TUpdateMonHocDTO = Partial<Omit<TCreateMonHocDTO, "ma_mon">> & {
  // cho phép đổi ma_mon nếu bạn muốn; nếu không thì bỏ
  ma_mon?: string;
};
