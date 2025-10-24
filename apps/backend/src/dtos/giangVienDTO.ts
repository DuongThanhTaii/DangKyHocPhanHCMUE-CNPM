/**
 * Response item cho TKB theo tuần
 */
export interface TKBWeeklyItemDTO {
    thu: number;                          // Thứ trong tuần (1=CN, 2=T2, ..., 7=T7)
    tiet_bat_dau: number;                 // Tiết bắt đầu (1-12)
    tiet_ket_thuc: number;                // Tiết kết thúc (1-12)
    phong: {
        id: string;                         // UUID phòng học
        ma_phong: string;                   // Mã phòng (VD: "B.310")
    };
    lop_hoc_phan: {
        id: string;                         // UUID lớp học phần
        ma_lop: string;                     // Mã lớp (VD: "COMP1010_1")
    };
    mon_hoc: {
        ma_mon: string;                     // Mã môn học (VD: "COMP1010")
        ten_mon: string;                    // Tên môn học (VD: "Lập trình căn bản")
    };
    ngay_hoc?: Date; // ✅ Thêm ngày học cụ thể
}
