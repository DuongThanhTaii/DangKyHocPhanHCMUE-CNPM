export interface TietHoc {
    tiet: number;
    gioVao: string;
    gioRa: string;
    label: string; // "6h30-7h20"
}

export const TIET_HOC_CONFIG: TietHoc[] = [
    { tiet: 1, gioVao: "06:30", gioRa: "07:20", label: "6h30-7h20" },
    { tiet: 2, gioVao: "07:20", gioRa: "08:10", label: "7h20-8h10" },
    { tiet: 3, gioVao: "08:10", gioRa: "09:00", label: "8h10-9h00" },
    { tiet: 4, gioVao: "09:10", gioRa: "10:00", label: "9h10-10h00" },
    { tiet: 5, gioVao: "10:00", gioRa: "10:50", label: "10h00-10h50" },
    { tiet: 6, gioVao: "10:50", gioRa: "11:40", label: "10h50-11h40" },
    { tiet: 7, gioVao: "12:30", gioRa: "13:20", label: "12h30-13h20" },
    { tiet: 8, gioVao: "13:20", gioRa: "14:10", label: "13h20-14h10" },
    { tiet: 9, gioVao: "14:10", gioRa: "15:00", label: "14h10-15h00" },
    { tiet: 10, gioVao: "15:10", gioRa: "16:00", label: "15h10-16h00" },
    { tiet: 11, gioVao: "16:00", gioRa: "16:50", label: "16h00-16h50" },
    { tiet: 12, gioVao: "16:50", gioRa: "17:40", label: "16h50-17h40" },
];

/**
 * Get thông tin tiết học theo số tiết
 */
export function getTietHocInfo(tiet: number): TietHoc | undefined {
    return TIET_HOC_CONFIG.find((t) => t.tiet === tiet);
}

/**
 * Get label thời gian theo range tiết
 */
export function getThoiGianLabel(
    tietBatDau: number,
    tietKetThuc: number
): string {
    const batDau = getTietHocInfo(tietBatDau);
    const ketThuc = getTietHocInfo(tietKetThuc);

    if (!batDau || !ketThuc) return "";

    return `${batDau.gioVao}-${ketThuc.gioRa}`;
}

/**
 * Validate tiết học hợp lệ
 */
export function isValidTiet(tiet: number): boolean {
    return tiet >= 1 && tiet <= 12;
}

/**
 * Validate range tiết hợp lệ
 */
export function isValidTietRange(
    tietBatDau: number,
    tietKetThuc: number
): boolean {
    return (
        isValidTiet(tietBatDau) &&
        isValidTiet(tietKetThuc) &&
        tietBatDau <= tietKetThuc
    );
}