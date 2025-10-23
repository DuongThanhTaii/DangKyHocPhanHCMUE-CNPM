import { useEffect, useMemo, useState } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { fetchJSON } from "../../utils/fetchJSON";
import { getThoiGianLabel } from "../../constants/thoiKhoaBieu";

type HocKyItem = {
  hoc_ky_id: string;
  ma_hoc_ky: string; // "1" | "2" | ...
  ten_nien_khoa: string; // "2025-2026"
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD"
};

type WeekItem = { index: number; start: string; end: string };

type TKBItem = {
  thu: number; // 1..7 (1=CN nếu bạn dùng vậy; nếu 2..7 thì nhớ chỉnh render)
  tiet_bat_dau: number;
  tiet_ket_thuc: number;
  phong: { id: string; ma_phong: string };
  lop_hoc_phan: { id: string; ma_lop: string };
  mon_hoc: { ma_mon: string; ten_mon: string };
};

const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Sinh danh sách tuần theo học kỳ (từ start đến end, tuần 1 bắt đầu tại start) */
function buildWeeks(hk: HocKyItem | null): WeekItem[] {
  if (!hk?.start || !hk?.end) return [];
  const s = new Date(hk.start);
  const e = new Date(hk.end);

  const weeks: WeekItem[] = [];
  let curStart = new Date(s);
  let idx = 1;
  while (curStart <= e) {
    const curEnd = addDays(curStart, 6);
    weeks.push({ index: idx++, start: fmt(curStart), end: fmt(curEnd) });
    curStart = addDays(curStart, 7);
  }
  return weeks;
}

/** Lấy 7 ngày (yyyy-mm-dd) của tuần đã chọn, dùng để render header */
function getDatesOfWeek(week: WeekItem | null) {
  if (!week) return Array(7).fill("");
  const start = new Date(week.start);
  return [...Array(7)].map((_, i) => fmt(addDays(start, i)));
}

export default function GVThoiKhoaBieu() {
  // Dropdown data
  const [dsHocKy, setDsHocKy] = useState<HocKyItem[]>([]);
  const [dsNienKhoa, setDsNienKhoa] = useState<string[]>([]);

  // Selections
  const [selectedNienKhoa, setSelectedNienKhoa] = useState<string>("");
  const [selectedHocKyId, setSelectedHocKyId] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<number | "">("");

  // Weeks & computed
  const currentHocKy = useMemo(
    () => dsHocKy.find((x) => x.hoc_ky_id === selectedHocKyId) || null,
    [dsHocKy, selectedHocKyId]
  );
  const weeks = useMemo(() => buildWeeks(currentHocKy), [currentHocKy]);
  const weekObj = useMemo(
    () =>
      typeof selectedWeek === "number"
        ? weeks.find((w) => w.index === selectedWeek) || null
        : null,
    [weeks, selectedWeek]
  );
  const getDatesForSelectedWeek = useMemo(
    () => getDatesOfWeek(weekObj),
    [weekObj]
  );
  const todayDateString = fmt(new Date());

  // Data của tuần
  const [tkb, setTkb] = useState<TKBItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ====== LOAD HỌC KỲ (cho GV) ======
  useEffect(() => {
    (async () => {
      // Gợi ý: backend trả tất cả học kỳ GV có phân công, kèm start/end
      const r = await fetchJSON("/api/gv/hoc-ky");
      const data: HocKyItem[] = r.data || [];
      setDsHocKy(data);
      const nk = Array.from(new Set(data.map((x) => x.ten_nien_khoa)));
      setDsNienKhoa(nk);

      // chọn mặc định (nếu muốn): niên khóa mới nhất + học kỳ có start gần hiện tại
      if (!selectedNienKhoa && nk.length)
        setSelectedNienKhoa(nk[nk.length - 1]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Khi đổi niên khóa → clear học kỳ & tuần
  useEffect(() => {
    setSelectedHocKyId("");
    setSelectedWeek("");
  }, [selectedNienKhoa]);

  // Khi chọn học kỳ → build weeks & chọn tuần hiện tại (nếu trong khoảng)
  useEffect(() => {
    const ws = buildWeeks(currentHocKy);
    if (!ws.length) {
      setSelectedWeek("");
      return;
    }
    // chọn tuần hiện tại nếu today nằm trong [start, end], else tuần 1
    const today = new Date();
    const found =
      ws.findIndex(
        (w) =>
          today >= new Date(w.start) && today <= addDays(new Date(w.start), 6)
      ) + 1;
    setSelectedWeek(found > 0 ? found : 1);
  }, [currentHocKy]);

  // LOAD LỊCH TUẦN
  useEffect(() => {
    if (!selectedHocKyId || !selectedWeek) {
      setTkb([]);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const r = await fetchJSON(
          `/api/gv/tkb-weekly?hoc_ky_id=${selectedHocKyId}&week=${selectedWeek}`
        );
        const rows: TKBItem[] = r.data || [];
        setTkb(rows);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedHocKyId, selectedWeek]);

  // ====== Điều hướng tuần ======
  const handlePrevWeek = () => {
    if (typeof selectedWeek !== "number") return;
    setSelectedWeek(Math.max(1, selectedWeek - 1));
  };
  const handleNextWeek = () => {
    if (typeof selectedWeek !== "number") return;
    setSelectedWeek(Math.min(weeks.length, selectedWeek + 1));
  };
  const handleCurrentWeek = () => {
    if (!weeks.length) return;
    const today = new Date();
    const found =
      weeks.findIndex(
        (w) =>
          today >= new Date(w.start) && today <= addDays(new Date(w.start), 6)
      ) + 1;
    setSelectedWeek(found > 0 ? found : 1);
  };

  // ====== Render table body ======
  // Lấy danh sách phòng có lớp trong tuần này (sắp xếp theo mã phòng)
  const rooms = useMemo(() => {
    const set = new Map<string, string>();
    tkb.forEach((x) => set.set(x.phong.id, x.phong.ma_phong));
    return [...set.entries()]
      .map(([id, ma]) => ({ id, ma }))
      .sort((a, b) => a.ma.localeCompare(b.ma));
  }, [tkb]);

  // Trả về các sự kiện (lớp) cho 1 ô (room, day)
  const getCellItems = (roomId: string, dayIdx: number) => {
    // dayIdx: 0..6 tương ứng CN..T7; map sang thu của dữ liệu
    // Nếu dữ liệu của bạn dùng 2..7 & CN=8/1, hãy chỉnh map dưới:
    const thu = dayIdx + 1; // 1..7 -> CN..T7
    return tkb
      .filter((x) => x.phong.id === roomId && x.thu === thu)
      .sort((a, b) => a.tiet_bat_dau - b.tiet_bat_dau);
  };

  const renderTableBody = () => {
    if (!rooms.length) {
      return (
        <tr>
          <td colSpan={8} style={{ textAlign: "center", padding: 20 }}>
            {loading ? "Đang tải..." : "Không có lịch trong tuần này."}
          </td>
        </tr>
      );
    }

    return rooms.map((room) => (
      <tr key={room.id}>
        <td className="tkb-room">{room.ma}</td>
        {weekDays.map((_, dayIdx) => {
          const items = getCellItems(room.id, dayIdx);
          return (
            <td key={dayIdx} className="tkb-cell">
              {items.map((it, i) => (
                <div className="tkb-slot" key={i}>
                  <div className="tkb-slot__title">
                    {it.mon_hoc.ma_mon} — {it.mon_hoc.ten_mon}
                  </div>
                  <div className="tkb-slot__sub">
                    Lớp: {it.lop_hoc_phan.ma_lop} • Tiết {it.tiet_bat_dau}-
                    {it.tiet_ket_thuc} (
                    {getThoiGianLabel(it.tiet_bat_dau, it.tiet_ket_thuc)})
                  </div>
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
              {dsNienKhoa.map((nk) => (
                <option key={nk} value={nk}>
                  {nk}
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
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              disabled={!selectedHocKyId}
            >
              <option value="">-- Chọn Tuần --</option>
              {weeks.map((w) => (
                <option key={w.index} value={w.index}>
                  Tuần {w.index} ({w.start} - {w.end})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Week navigation */}
        <div className="week-navigation-container">
          <button
            className="btn__chung"
            onClick={handlePrevWeek}
            disabled={selectedWeek === 1}
          >
            {/* icon trái */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path
                fill="#ffffff"
                d="M491 100.8C478.1 93.8 462.3 94.5 450 102.6L192 272.1L192 128C192 110.3 177.7 96 160 96C142.3 96 128 110.3 128 128L128 512C128 529.7 142.3 544 160 544C177.7 544 192 529.7 192 512L192 367.9L450 537.5C462.3 545.6 478 546.3 491 539.3C504 532.3 512 518.8 512 504.1L512 136.1C512 121.4 503.9 107.9 491 100.9z"
              />
            </svg>
          </button>

          <button className="btn__chung" onClick={handleCurrentWeek}>
            {/* icon hiện tại */}
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
            disabled={
              typeof selectedWeek !== "number" || selectedWeek === weeks.length
            }
          >
            {/* icon phải */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path
                fill="#ffffff"
                d="M149 100.8C161.9 93.8 177.7 94.5 190 102.6L448 272.1L448 128C448 110.3 462.3 96 480 96C497.7 96 512 110.3 512 128L512 512C512 529.7 497.7 544 480 544C462.3 544 448 529.7 448 512L448 367.9L190 537.5C177.7 545.6 162 546.3 149 539.3C136 532.3 128 518.7 128 504L128 136C128 121.3 136.1 107.8 149 100.8z"
              />
            </svg>{" "}
          </button>
        </div>

        {/* Bảng TKB */}
        <table className="table table__tkb">
          <thead>
            <tr>
              <th>Phòng</th>
              {weekDays.map((day, i) => (
                <th
                  key={day}
                  className={
                    getDatesForSelectedWeek[i] === todayDateString
                      ? "highlight-today"
                      : ""
                  }
                >
                  {day}
                  <br />
                  <span className="date-number">
                    {getDatesForSelectedWeek[i] || ""}
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
