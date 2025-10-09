import React, { useEffect, useMemo, useState } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { fetchJSON } from "../../utils/fetchJSON";
import { useModalContext } from "../../hook/ModalContext";
import type { JSX } from "react";

type Semester = {
  hoc_ky_id: string;
  ma_hoc_ky: string; // "1" | "2" | "3"
  ten_nien_khoa: string; // "2025-2026"
  trang_thai_hien_tai?: boolean;
  ngay_bat_dau?: string | null; // ISO date
  ngay_ket_thuc?: string | null; // ISO date
};

type ScheduleItem = {
  ma_lop_hp: string;
  ma_mon: string;
  ten_mon: string;
  gio_hoc: string; // "07:00-08:50"
  phong_hoc?: string | null;
  ten_giang_vien?: string | null;
  ngay_bat_dau_lhp: string; // ISO date
  ngay_ket_thuc_lhp: string; // ISO date
  ngay_hoc: (string | number)[]; // ["2","3"] or [2,3]
};

type WeekInfo = { index: number; start: string; end: string };

export default function Timetable(): JSX.Element {
  const { openNotify } = useModalContext();

  const [dsHocKy, setDsHocKy] = useState<Semester[]>([]);
  const [dsNienKhoa, setDsNienKhoa] = useState<string[]>([]);

  const [selectedHocKyId, setSelectedHocKyId] = useState<string>("");
  const [selectedNienKhoa, setSelectedNienKhoa] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const [allScheduleData, setAllScheduleData] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const weekDays = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];

  const todayDateString = useMemo(() => {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, "0");
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const y = today.getFullYear();
    return `${d}/${m}/${y}`;
  }, []);

  // ============ Fetch semesters ============
  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const res = await fetchJSON("/api/metadata/semesters", { method: "GET" });
      const semesters: Semester[] = Array.isArray(res)
        ? res
        : (res as any)?.data ?? [];
      setDsHocKy(semesters);

      const uniqueNienKhoa = Array.from(
        new Set(semesters.map((hk) => hk.ten_nien_khoa))
      );
      setDsNienKhoa(uniqueNienKhoa);

      openNotify?.(
        `Đã tải ${semesters.length} học kỳ • ${uniqueNienKhoa.length} niên khóa`,
        "info"
      );

      const currentSemester = semesters.find((hk) => hk.trang_thai_hien_tai);
      if (currentSemester) {
        setSelectedHocKyId(currentSemester.hoc_ky_id);
        setSelectedNienKhoa(currentSemester.ten_nien_khoa);
        openNotify?.(
          `Tự chọn học kỳ hiện tại: HK${currentSemester.ma_hoc_ky} (${currentSemester.ten_nien_khoa})`,
          "info"
        );
      }
      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải danh sách học kỳ:", err);
      setError("Lỗi khi tải danh sách học kỳ.");
      openNotify?.("Không tải được danh sách học kỳ", "error");
    } finally {
      setLoading(false);
    }
  };

  // ============ Fetch timetable by semester ============
  const fetchData = async (hocKyId: string) => {
    if (!hocKyId) {
      setAllScheduleData([]);
      return;
    }

    setLoading(true);
    try {
      const currentSemester = dsHocKy.find((hk) => hk.hoc_ky_id === hocKyId);
      if (!currentSemester) {
        throw new Error("Không tìm thấy thông tin học kỳ.");
      }

      const url = `/api/thoi-khoa-bieu?hocKy=${encodeURIComponent(
        currentSemester.ma_hoc_ky
      )}&namHoc=${encodeURIComponent(currentSemester.ten_nien_khoa)}`;

      const res = await fetchJSON(url, { method: "GET" });
      const data: ScheduleItem[] = Array.isArray(res)
        ? res
        : (res as any)?.data ?? [];

      setAllScheduleData(data);
      setError(null);

      openNotify?.(
        data.length
          ? `Đã tải ${data.length} lớp trong học kỳ đã chọn`
          : "Không có dữ liệu thời khóa biểu cho học kỳ này",
        data.length ? "info" : "warning"
      );
    } catch (err) {
      console.error("Lỗi tải dữ liệu thời khóa biểu:", err);
      setError("Lỗi tải dữ liệu thời khóa biểu.");
      setAllScheduleData([]);
      openNotify?.("Không tải được thời khóa biểu", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedHocKyId) {
      fetchData(selectedHocKyId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHocKyId]);

  // ============ Tính tuần hiện tại khi có dữ liệu ============
  useEffect(() => {
    if (selectedHocKyId && allScheduleData.length > 0) {
      const semester = dsHocKy.find((hk) => hk.hoc_ky_id === selectedHocKyId);
      if (semester?.ngay_bat_dau) {
        const firstClassDate = allScheduleData.reduce<Date>((minDate, item) => {
          const classStartDate = new Date(item.ngay_bat_dau_lhp);
          return classStartDate < minDate ? classStartDate : minDate;
        }, new Date(allScheduleData[0].ngay_bat_dau_lhp));

        const semesterStartDate = new Date(semester.ngay_bat_dau);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        firstClassDate.setHours(0, 0, 0, 0);

        const referenceDate = today < firstClassDate ? firstClassDate : today;
        const diffTime = referenceDate.getTime() - semesterStartDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const calculatedWeekIndex = Math.max(1, Math.floor(diffDays / 7) + 1);
        setSelectedWeek(calculatedWeekIndex);
      }
    } else if (selectedHocKyId && allScheduleData.length === 0) {
      setSelectedWeek(1);
    }
  }, [selectedHocKyId, dsHocKy, allScheduleData]);

  const currentSemesterInfo =
    dsHocKy.find((hk) => hk.hoc_ky_id === selectedHocKyId) || null;

  // ============ Build weeks ============
  const weeks: WeekInfo[] = useMemo(() => {
    if (
      !currentSemesterInfo?.ngay_bat_dau ||
      !currentSemesterInfo?.ngay_ket_thuc
    )
      return [];

    const startDate = new Date(currentSemesterInfo.ngay_bat_dau);
    const endDate = new Date(currentSemesterInfo.ngay_ket_thuc);
    const out: WeekInfo[] = [];

    let currentWeekStart = new Date(startDate);
    let i = 1;

    const formatDate = (date: Date) => {
      const d = String(date.getDate()).padStart(2, "0");
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    };

    while (currentWeekStart <= endDate) {
      const weekStart = new Date(currentWeekStart);
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      out.push({
        index: i,
        start: formatDate(weekStart),
        end: formatDate(weekEnd),
      });

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      i++;
    }
    return out;
  }, [currentSemesterInfo]);

  // ============ Lọc theo tuần ============
  const filteredSchedule = useMemo(() => {
    if (!allScheduleData.length || !currentSemesterInfo) return [];

    const selectedWeekInfo = weeks.find((w) => w.index === selectedWeek);
    if (!selectedWeekInfo) return [];

    const weekStartDate = new Date(
      selectedWeekInfo.start.split("/").reverse().join("-")
    );
    const weekEndDate = new Date(
      selectedWeekInfo.end.split("/").reverse().join("-")
    );
    weekEndDate.setHours(23, 59, 59, 999);

    return allScheduleData.filter((item) => {
      const classStartDate = new Date(item.ngay_bat_dau_lhp);
      const classEndDate = new Date(item.ngay_ket_thuc_lhp);
      return classStartDate <= weekEndDate && classEndDate >= weekStartDate;
    });
  }, [allScheduleData, selectedWeek, currentSemesterInfo, weeks]);

  // ============ Tính danh sách ngày trong tuần ============
  const getDatesForSelectedWeek = useMemo(() => {
    const selectedWeekInfo = weeks.find((w) => w.index === selectedWeek);
    if (!selectedWeekInfo) return [] as string[];

    const startDate = new Date(
      selectedWeekInfo.start.split("/").reverse().join("-")
    );
    const dates: string[] = [];
    const formatDate = (date: Date) => {
      const d = String(date.getDate()).padStart(2, "0");
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    };
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(formatDate(date));
    }
    return dates;
  }, [selectedWeek, weeks]);

  // ============ Gom lớp theo ngày ============
  const scheduleGroupedByDay = useMemo(() => {
    const grouped: Record<string, ScheduleItem[]> = {};
    filteredSchedule.forEach((item) => {
      const dayMap: Record<string, string> = {
        "2": "Thứ 2",
        "3": "Thứ 3",
        "4": "Thứ 4",
        "5": "Thứ 5",
        "6": "Thứ 6",
        "7": "Thứ 7",
        CN: "Chủ nhật",
      };

      const days = item.ngay_hoc
        .map((dayNum) => dayMap[String(dayNum).trim()])
        .filter(Boolean) as string[];

      days.forEach((dayName) => {
        if (!grouped[dayName]) grouped[dayName] = [];
        grouped[dayName].push(item);
      });
    });
    return grouped;
  }, [filteredSchedule]);

  const getSessionFromTime = (timeString?: string | null) => {
    if (!timeString) return "N/A";
    const [startTime] = timeString.split("-");
    const [hour] = startTime.split(":").map(Number);
    return hour >= 12 ? "Buổi chiều" : "Buổi sáng";
  };

  const handlePrevWeek = () => {
    setSelectedWeek((prev) => Math.max(1, prev - 1));
  };

  const handleNextWeek = () => {
    setSelectedWeek((prev) => Math.min(weeks.length || 1, prev + 1));
  };

  const handleCurrentWeek = () => {
    if (!currentSemesterInfo?.ngay_bat_dau) return;
    const semesterStartDate = new Date(currentSemesterInfo.ngay_bat_dau);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - semesterStartDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const calculatedWeekIndex = Math.max(1, Math.floor(diffDays / 7) + 1);
    setSelectedWeek(calculatedWeekIndex);
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={8} className="loading-state">
            Đang tải...
          </td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr>
          <td colSpan={8} className="error-state">
            Lỗi: {error}
          </td>
        </tr>
      );
    }

    const allRooms = new Set<string>();
    filteredSchedule.forEach((item) => {
      if (item.phong_hoc) allRooms.add(item.phong_hoc);
    });

    const sortedRooms = Array.from(allRooms).sort();

    if (sortedRooms.length === 0) {
      return (
        <tr>
          <td colSpan={8} className="empty-state">
            Không có lớp học nào trong tuần đã chọn.
          </td>
        </tr>
      );
    }

    return sortedRooms.map((room) => (
      <tr key={room}>
        <td className="tkb__phong">
          <p>{room}</p>
        </td>
        {weekDays.map((day) => {
          const classesForDay = scheduleGroupedByDay[day] || [];
          const classesInRoom = classesForDay.filter(
            (cls) => cls.phong_hoc === room
          );

          return (
            <td key={day}>
              {classesInRoom.map((cls) => (
                <div
                  key={`${day}-${cls.ma_lop_hp}-${cls.phong_hoc}-${cls.gio_hoc}`}
                  className="class-item"
                >
                  <strong>
                    <p>{cls.ten_mon}</p>
                    <p>({cls.ma_mon})</p>
                  </strong>
                  <p>Buổi: {getSessionFromTime(cls.gio_hoc)}</p>
                  <p>Giờ: {cls.gio_hoc}</p>
                  <p>Phòng: {cls.phong_hoc}</p>
                  <p className="tkb__gv">
                    GV: {cls.ten_giang_vien || "Chưa phân công"}
                  </p>
                </div>
              ))}
            </td>
          );
        })}
      </tr>
    ));
  };

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">THỜI KHÓA BIỂU</p>
      </div>

      <div className="body__inner">
        <div className="selecy__duyethp__container">
          {/* Dropdown Niên khóa */}
          <div className="mr_20">
            <select
              className="form__select w__200"
              value={selectedNienKhoa}
              onChange={(e) => {
                setSelectedNienKhoa(e.target.value);
                setSelectedHocKyId("");
              }}
            >
              <option value="">-- Chọn Niên khóa --</option>
              {dsNienKhoa.map((nienKhoa) => (
                <option key={nienKhoa} value={nienKhoa}>
                  {nienKhoa}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Học kỳ */}
          <div className="mr_20">
            <select
              className="form__select w__200"
              value={selectedHocKyId}
              onChange={(e) => setSelectedHocKyId(e.target.value)}
              disabled={!selectedNienKhoa}
            >
              <option value="">-- Chọn Học kỳ --</option>
              {dsHocKy
                .filter((hk) => hk.ten_nien_khoa === selectedNienKhoa)
                .map((hk) => (
                  <option key={hk.hoc_ky_id} value={hk.hoc_ky_id}>
                    Học kỳ {hk.ma_hoc_ky}
                  </option>
                ))}
            </select>
          </div>

          {/* Dropdown Tuần */}
          <div className="mr_20">
            <select
              className="form__select"
              value={selectedWeek}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") return; // giữ tuần hiện tại nếu chọn placeholder
                setSelectedWeek(Number(v));
              }}
              disabled={!selectedHocKyId || weeks.length === 0}
            >
              <option value="">-- Chọn Tuần --</option>
              {weeks.map((week) => (
                <option key={week.index} value={week.index}>
                  Tuần {week.index} ({week.start} - {week.end})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="week-navigation-container">
          <button
            className="btn__chung P__10__20"
            onClick={handlePrevWeek}
            disabled={selectedWeek === 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path
                fill="#ffffff"
                d="M491 100.8C478.1 93.8 462.3 94.5 450 102.6L192 272.1L192 128C192 110.3 177.7 96 160 96C142.3 96 128 110.3 128 128L128 512C128 529.7 142.3 544 160 544C177.7 544 192 529.7 192 512L192 367.9L450 537.5C462.3 545.6 478 546.3 491 539.3C504 532.3 512 518.8 512 504.1L512 136.1C512 121.4 503.9 107.9 491 100.9z"
              />
            </svg>
          </button>

          <button className="btn__chung P__10__20" onClick={handleCurrentWeek}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path
                fill="#ffffff"
                d="M80 259.8L289.2 345.9C299 349.9 309.4 352 320 352C330.6 352 341 349.9 350.8 345.9L593.2 246.1C602.2 242.4 608 233.7 608 224C608 214.3 602.2 205.6 593.2 201.9L350.8 102.1C341 98.1 330.6 96 320 96C309.4 96 299 98.1 289.2 102.1L46.8 201.9C37.8 205.6 32 214.3 32 224L32 520C32 533.3 42.7 544 56 544C69.3 544 80 533.3 80 520L80 259.8zM128 331.5L128 448C128 501 214 544 320 544C426 544 512 501 512 448L512 331.4L369.1 390.3C353.5 396.7 336.9 400 320 400C303.1 400 286.5 396.7 270.9 390.3L128 331.4z"
              />
            </svg>{" "}
            Hiện tại
          </button>

          <button
            className="btn__chung P__10__20"
            onClick={handleNextWeek}
            disabled={selectedWeek === (weeks.length || 1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path
                fill="#ffffff"
                d="M149 100.8C161.9 93.8 177.7 94.5 190 102.6L448 272.1L448 128C448 110.3 462.3 96 480 96C497.7 96 512 110.3 512 128L512 512C512 529.7 497.7 544 480 544C462.3 544 448 529.7 448 512L448 367.9L190 537.5C177.7 545.6 162 546.3 149 539.3C136 532.3 128 518.7 128 504L128 136C128 121.3 136.1 107.8 149 100.8z"
              />
            </svg>{" "}
          </button>
        </div>

        <table className="table table__tkb">
          <thead>
            <tr>
              <th>Phòng</th>
              {weekDays.map((day, index) => (
                <th
                  key={day}
                  className={
                    getDatesForSelectedWeek[index] === todayDateString
                      ? "highlight-today"
                      : ""
                  }
                >
                  {day} <br />
                  <span className="date-number">
                    {getDatesForSelectedWeek[index] || ""}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderTableBody()}</tbody>
        </table>
      </div>
    </section>
  );
}
