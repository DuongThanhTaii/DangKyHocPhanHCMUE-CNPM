import type { WeekItem, TietHoc } from "../types";
import type { HocKyDTO } from "../../pdt/types/pdtTypes";

/**
 * Format Date → YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
    return date.toISOString().slice(0, 10);
};

/**
 * Add days to date
 */
export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/**
 * Build weeks từ học kỳ (tuần 1 bắt đầu từ ngayBatDau)
 */
export const buildWeeks = (hocKy: HocKyDTO | null): WeekItem[] => {
    if (!hocKy?.ngayBatDau || !hocKy?.ngayKetThuc) return [];

    const startDate = new Date(hocKy.ngayBatDau);
    const endDate = new Date(hocKy.ngayKetThuc);

    const weeks: WeekItem[] = [];
    let currentStart = new Date(startDate);
    let index = 1;

    while (currentStart <= endDate) {
        const currentEnd = addDays(currentStart, 6);
        weeks.push({
            index,
            start: formatDate(currentStart),
            end: formatDate(currentEnd),
        });
        currentStart = addDays(currentStart, 7);
        index++;
    }

    return weeks;
};

/**
 * Get 7 ngày (YYYY-MM-DD) của tuần
 */
export const getWeekDates = (week: WeekItem | null): string[] => {
    if (!week) return Array(7).fill("");

    const startDate = new Date(week.start);
    return Array.from({ length: 7 }, (_, i) => formatDate(addDays(startDate, i)));
};

/**
 * Tìm index tuần hiện tại (1-based)
 */
export const getCurrentWeekIndex = (weeks: WeekItem[]): number => {
    if (!weeks.length) return 1;

    const today = new Date();
    const foundIndex = weeks.findIndex((week) => {
        const start = new Date(week.start);
        const end = addDays(start, 6);
        return today >= start && today <= end;
    });

    return foundIndex >= 0 ? foundIndex + 1 : 1;
};

/**
 * Get label thời gian từ tiết học (sử dụng config từ BE)
 */
export const getThoiGianLabel = (
    tietBatDau: number,
    tietKetThuc: number,
    config: TietHoc[]
): string => {
    const start = config.find((t) => t.tiet === tietBatDau);
    const end = config.find((t) => t.tiet === tietKetThuc);

    if (!start || !end) return "";

    return `${start.gioVao} - ${end.gioRa}`;
};

/**
 * ✅ Tính các tuần từ học kỳ hiện hành (theo ISO: thứ 2 là đầu tuần)
 */
export const buildWeeksFromHocKy = (
    ngayBatDau: string | null, // YYYY-MM-DD
    ngayKetThuc: string | null  // YYYY-MM-DD
): Array<{ index: number; dateStart: string; dateEnd: string }> => {
    if (!ngayBatDau || !ngayKetThuc) return [];

    const start = new Date(ngayBatDau);
    const end = new Date(ngayKetThuc);

    // ✅ Tìm thứ 2 đầu tiên (ISO week start)
    const firstMonday = new Date(start);
    const dayOfWeek = firstMonday.getDay(); // 0=CN, 1=T2, ..., 6=T7
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
    firstMonday.setDate(firstMonday.getDate() + daysUntilMonday);

    const weeks: Array<{ index: number; dateStart: string; dateEnd: string }> = [];
    let weekIndex = 1;
    let currentMonday = new Date(firstMonday);

    while (currentMonday <= end) {
        const sunday = new Date(currentMonday);
        sunday.setDate(sunday.getDate() + 6);

        weeks.push({
            index: weekIndex++,
            dateStart: formatDate(currentMonday),
            dateEnd: formatDate(sunday),
        });

        currentMonday.setDate(currentMonday.getDate() + 7);
    }

    return weeks;
};

/**
 * ✅ Tìm tuần hiện tại (theo ISO week)
 */
export const getCurrentWeekIndexFromHocKy = (
    weeks: Array<{ dateStart: string; dateEnd: string }>
): number => {
    const today = formatDate(new Date());

    const currentWeek = weeks.find(
        (w) => w.dateStart <= today && today <= w.dateEnd
    );

    return currentWeek ? weeks.indexOf(currentWeek) + 1 : 1;
};