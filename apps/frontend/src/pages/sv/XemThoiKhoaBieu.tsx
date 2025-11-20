import { useEffect, useMemo, useState } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { useSVTKBWeekly } from "../../features/sv/hooks";
import { useTietHocConfig } from "../../features/gv/hooks";
import { useHocKyNienKhoa } from "../../features/common/hooks";
import {
  buildWeeksFromHocKy,
  getCurrentWeekIndexFromHocKy,
  formatDate,
} from "../../features/gv/utils/weekUtils";
import type { RoomItem } from "../../features/gv/types";
import TKBClassCard from "../tlk/tao-lop-hoc-phan/TKBClassCard";
import type { ClassInstance } from "../tlk/tao-lop-hoc-phan/TaoThoiKhoaBieuModal";
import type { HocKyItemDTO } from "../../features/common/types";
import HocKySelector from "../../components/HocKySelector";

const WEEK_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function XemThoiKhoaBieu() {
  // ========= Custom Hooks =========
  const { data: hocKyNienKhoas } = useHocKyNienKhoa();
  const { config: tietHocConfig, loading: loadingConfig } = useTietHocConfig();

  // ========= State =========
  const [selectedHocKyId, setSelectedHocKyId] = useState<string>("");
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(1);

  // ========= Computed Values - Flatten data =========
  const flatHocKys = useMemo(() => {
    const result: (HocKyItemDTO & { tenNienKhoa: string })[] = [];

    hocKyNienKhoas.forEach((nienKhoa) => {
      nienKhoa.hocKy.forEach((hk) => {
        result.push({
          ...hk,
          tenNienKhoa: nienKhoa.tenNienKhoa,
        });
      });
    });

    return result;
  }, [hocKyNienKhoas]);

  const currentHocKy = useMemo(
    () => flatHocKys.find((hk) => hk.id === selectedHocKyId) || null,
    [flatHocKys, selectedHocKyId]
  );

  const weeks = useMemo(() => {
    if (!currentHocKy) return [];
    return buildWeeksFromHocKy(
      currentHocKy.ngayBatDau?.toString() || null,
      currentHocKy.ngayKetThuc?.toString() || null
    );
  }, [currentHocKy]);

  const selectedWeek = useMemo(
    () => weeks.find((w) => w.index === selectedWeekIndex) || null,
    [weeks, selectedWeekIndex]
  );

  // ✅ Tính ngày trong tuần (T2 → CN)
  const weekDates = useMemo(() => {
    if (!selectedWeek) return Array(7).fill("");

    const monday = new Date(selectedWeek.dateStart);
    const dates: string[] = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      dates.push(formatDate(day));
    }

    return dates;
  }, [selectedWeek]);

  const todayString = formatDate(new Date());

  // ========= Fetch TKB =========
  const { tkb, loading: loadingTKB } = useSVTKBWeekly(
    selectedHocKyId,
    selectedWeek?.dateStart || "",
    selectedWeek?.dateEnd || ""
  );

  // ========= Auto-select học kỳ hiện hành ONLY on mount (once) =========
  useEffect(() => {
    // Only run if both data loaded AND no selection made yet
    if (!hocKyNienKhoas || flatHocKys.length === 0) {
      return;
    }

    // ✅ Only auto-select if BOTH fields are empty (first load)
    if (selectedHocKyId) {
      return;
    }

    const hkHienHanh = flatHocKys.find(
      (hk) => hk.id === hocKyNienKhoas[0].hocKy[0].id
    );

    if (hkHienHanh) {
      setSelectedHocKyId(hkHienHanh.id);
    }
    // ✅ Remove selectedHocKyId from dependencies to prevent re-running
  }, [hocKyNienKhoas, flatHocKys]);

  // ========= Auto-select tuần hiện tại khi chọn học kỳ =========
  useEffect(() => {
    if (weeks.length > 0) {
      const currentWeek = getCurrentWeekIndexFromHocKy(weeks);
      setSelectedWeekIndex(currentWeek);
    } else {
      setSelectedWeekIndex(1);
    }
  }, [weeks]);

  // ========= Week Navigation =========
  const handlePrevWeek = () => {
    setSelectedWeekIndex((prev) => Math.max(1, prev - 1));
  };

  const handleNextWeek = () => {
    setSelectedWeekIndex((prev) => Math.min(weeks.length, prev + 1));
  };

  const handleCurrentWeek = () => {
    if (weeks.length === 0) return;
    setSelectedWeekIndex(getCurrentWeekIndexFromHocKy(weeks));
  };

  // ========= Render Logic =========
  const rooms = useMemo<RoomItem[]>(() => {
    const roomMap = new Map<string, string>();
    tkb.forEach((item) => {
      roomMap.set(item.phong.id, item.phong.ma_phong);
    });

    return Array.from(roomMap.entries())
      .map(([id, ma]) => ({ id, ma }))
      .sort((a, b) => a.ma.localeCompare(b.ma));
  }, [tkb]);

  const getCellItems = (roomId: string, dateString: string) => {
    return tkb
      .filter((item) => {
        const itemDate = new Date(item.ngay_hoc).toISOString().split("T")[0];
        return item.phong.id === roomId && itemDate === dateString;
      })
      .sort((a, b) => a.tiet_bat_dau - b.tiet_bat_dau);
  };

  const renderTableBody = () => {
    if (loadingTKB || loadingConfig) {
      return (
        <tr>
          <td colSpan={8} style={{ textAlign: "center", padding: 20 }}>
            Đang tải thời khóa biểu...
          </td>
        </tr>
      );
    }

    if (rooms.length === 0) {
      return (
        <tr>
          <td colSpan={8} style={{ textAlign: "center", padding: 20 }}>
            Không có lịch trong tuần này.
          </td>
        </tr>
      );
    }

    return rooms.map((room) => (
      <tr key={room.id}>
        <td className="tkb-room">{room.ma}</td>
        {weekDates.map((dateString, dayIndex) => {
          const items = getCellItems(room.id, dateString);
          return (
            <td key={dayIndex} className="tkb-cell">
              {items.map((item, i) => {
                const classInstance: ClassInstance = {
                  id: `${item.mon_hoc.ma_mon}_${i}`,
                  maLopHP: item.mon_hoc.ma_mon,
                  tenMon: item.mon_hoc.ten_mon,
                  tenLop: item.mon_hoc.ten_mon,
                  lopHocPhanId: item.phong.id,
                  tenGiangVien: item.giang_vien,
                  position: { thu: item.thu, tiet: item.tiet_bat_dau },
                  tietBatDau: item.tiet_bat_dau,
                  tietKetThuc: item.tiet_ket_thuc,
                  phongHocId: item.phong.id,
                  tenPhongHoc: item.phong.ma_phong,
                  ngayBatDau: new Date(item.ngay_hoc)
                    .toISOString()
                    .split("T")[0],
                  ngayKetThuc: new Date(item.ngay_hoc)
                    .toISOString()
                    .split("T")[0],
                  isFromBackend: true,
                  isReadonly: true,
                };

                return (
                  <TKBClassCard
                    key={i}
                    instance={classInstance}
                    isSelected={false}
                    isComplete={true}
                    isForSinhVien={true}
                  />
                );
              })}
            </td>
          );
        })}
      </tr>
    ));
  };

  // ========= Render =========
  if (loadingConfig) {
    return (
      <section className="main__body">
        <div className="body__title">
          <p className="body__title-text">THỜI KHÓA BIỂU</p>
        </div>
        <div
          className="body__inner"
          style={{ textAlign: "center", padding: 40 }}
        >
          Đang tải dữ liệu...
        </div>
      </section>
    );
  }

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">THỜI KHÓA BIỂU</p>
      </div>

      <div className="body__inner">
        {/* Filters */}
        <div className="selecy__duyethp__container">
          <HocKySelector onHocKyChange={setSelectedHocKyId} />

          {/* Tuần */}
          <div className="mr_20">
            <select
              className="form__select"
              value={selectedWeekIndex}
              onChange={(e) => setSelectedWeekIndex(Number(e.target.value))}
              disabled={!selectedHocKyId}
            >
              <option value="">-- Chọn Tuần --</option>
              {weeks.map((w) => (
                <option key={w.index} value={w.index}>
                  Tuần {w.index} ({w.dateStart} - {w.dateEnd})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="week-navigation-container">
          <button
            className="btn__chung"
            onClick={handlePrevWeek}
            disabled={selectedWeekIndex === 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path
                fill="#ffffff"
                d="M491 100.8C478.1 93.8 462.3 94.5 450 102.6L192 272.1L192 128C192 110.3 177.7 96 160 96C142.3 96 128 110.3 128 128L128 512C128 529.7 142.3 544 160 544C177.7 544 192 529.7 192 512L192 367.9L450 537.5C462.3 545.6 478 546.3 491 539.3C504 532.3 512 518.8 512 504.1L512 136.1C512 121.4 503.9 107.9 491 100.9z"
              />
            </svg>
          </button>

          <button className="btn__chung" onClick={handleCurrentWeek}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path
                fill="#ffffff"
                d="M80 259.8L289.2 345.9C299 349.9 309.4 352 320 352C330.6 352 341 349.9 350.8 345.9L593.2 246.1C602.2 242.4 608 233.7 608 224C608 214.3 602.2 205.6 593.2 201.9L350.8 102.1C341 98.1 330.6 96 320 96C309.4 96 299 98.1 289.2 102.1L46.8 201.9C37.8 205.6 32 214.3 32 224L32 520C32 533.3 42.7 544 56 544C69.3 544 80 533.3 80 520L80 259.8zM128 331.5L128 448C128 501 214 544 320 544C426 544 512 501 512 448L512 331.4L369.1 390.3C353.5 396.7 336.9 400 320 400C303.1 400 286.5 396.7 270.9 390.3L128 331.4z"
              />
            </svg>{" "}
            Hiện tại
          </button>

          <button
            className="btn__chung"
            onClick={handleNextWeek}
            disabled={selectedWeekIndex === weeks.length}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path
                fill="#ffffff"
                d="M149 100.8C161.9 93.8 177.7 94.5 190 102.6L448 272.1L448 128C448 110.3 462.3 96 480 96C497.7 96 512 110.3 512 128L512 512C512 529.7 497.7 544 480 544C462.3 544 448 529.7 448 512L448 367.9L190 537.5C177.7 545.6 162 546.3 149 539.3C136 532.3 128 518.7 128 504L128 136C128 121.3 136.1 107.8 149 100.8z"
              />
            </svg>
          </button>
        </div>

        {/* TKB Table */}
        <table className="table table__tkb">
          <thead>
            <tr>
              <th>Phòng</th>
              {WEEK_DAYS.map((day, i) => (
                <th
                  key={day}
                  className={
                    weekDates[i] === todayString ? "highlight-today" : ""
                  }
                >
                  {day}
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
