// ======================================
// src/pages/pdt/QuanLyPDT.tsx
// Dashboard chuyển đổi giữa nhiều CRUD
// ======================================
import React, { Suspense, useEffect, useMemo, useState } from "react";

// Lazy load để giảm bundle
const QuanLySinhVien = React.lazy(
  () => import("../pdt/components/crud_sv/QuanLySinhVien")
);
const QuanLyGiangVien = React.lazy(
  () => import("../pdt/components/crud_gv/QuanLyGiangVien")
);
const QuanLyMonHoc = React.lazy(
  () => import("../pdt/components/crud_mh/QuanLyMonHoc")
);

// Nếu bạn có thêm CRUD khác, tiếp tục lazy như trên
// const QuanLyHocPhan = React.lazy(() => import("./QuanLyHocPhan"));

// Kiểu view cho đồng nhất
export type PDTViewKey = "sv" | "gv" | "mh"; // | "hp" | "lhp" ...

const TAB_LABELS: Record<PDTViewKey, string> = {
  sv: "Quản lý sinh viên",
  gv: "Quản lý giảng viên",
  mh: "Quản lý học phần",
};

// Helper: đồng bộ view với URL (hash) để share link nhanh
const getInitialView = (): PDTViewKey => {
  const hash = (window.location.hash || "").replace("#", "");
  if (hash === "gv") return "gv";
  return "sv";
};

const setHash = (v: PDTViewKey) => {
  if (window?.history?.replaceState) {
    window.history.replaceState(null, "", `#${v}`);
  } else {
    window.location.hash = v;
  }
};

const QuanLyPDT: React.FC = () => {
  const [view, setView] = useState<PDTViewKey>(getInitialView());

  // Khi đổi tab thì cập nhật hash để có thể reload/ share link
  useEffect(() => {
    setHash(view);
  }, [view]);

  const buttons = useMemo(
    () => (
      <div className="df" style={{ gap: 8 }}>
        <button
          className={`btn__quanlysv ${view === "sv" ? "active" : ""}`}
          onClick={() => setView("sv")}
        >
          {TAB_LABELS.sv}
        </button>
        <button
          className={`btn__quanlygv ${view === "gv" ? "active" : ""}`}
          onClick={() => setView("gv")}
        >
          {TAB_LABELS.gv}
        </button>
        <button
          className={`btn__quanlyhp ${view === "mh" ? "active" : ""}`}
          onClick={() => setView("mh")}
        >
          {TAB_LABELS.mh}
        </button>
        {/* 
        Ví dụ thêm tab khác:
        <button className={`btn__quanlyhp ${view === "hp" ? "active" : ""}`} onClick={() => setView("hp")}>
          Quản lý học phần
        </button>
      */}
      </div>
    ),
    [view]
  );

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">QUẢN LÝ</p>
      </div>

      <div className="body__inner">
        {buttons}

        {/* Phần nội dung tương ứng tab */}
        <Suspense fallback={<div style={{ padding: 16 }}>Đang tải...</div>}>
          {view === "sv" && <QuanLySinhVien />}
          {view === "gv" && <QuanLyGiangVien />}
          {view === "mh" && <QuanLyMonHoc />}

          {/* {view === "hp" && <QuanLyHocPhan />} */}
        </Suspense>
      </div>
    </section>
  );
};

export default QuanLyPDT;
