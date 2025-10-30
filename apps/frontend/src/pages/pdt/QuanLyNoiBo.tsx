// ======================================
// src/pages/pdt/QuanLyPDT.tsx
// ======================================
import React, { Suspense, useEffect, useMemo, useState } from "react";

// Lazy load các module quản lý
const QuanLySinhVien = React.lazy(
  () => import("../pdt/components/crud_sv/QuanLySinhVien")
);
const QuanLyGiangVien = React.lazy(
  () => import("../pdt/components/crud_gv/QuanLyGiangVien")
);
const QuanLyMonHoc = React.lazy(
  () => import("../pdt/components/crud_mh/QuanLyMonHoc")
);
const QuanLyTinChi = React.lazy(
  () => import("../pdt/components/crud_tc/QuanLyTinChi")
); // ✅ mới thêm

// Các tab hiển thị
export type PDTViewKey = "sv" | "gv" | "mh" | "tc"; // ✅ thêm "bc"

const TAB_LABELS: Record<PDTViewKey, string> = {
  sv: "Quản lý sinh viên",
  gv: "Quản lý giảng viên",
  mh: "Quản lý học phần",
  tc: "Quản lý chính sách tín chỉ", // ✅
};

// Đồng bộ URL hash
const getInitialView = (): PDTViewKey => {
  const hash = (window.location.hash || "").replace("#", "");
  if (hash === "gv") return "gv";
  if (hash === "mh") return "mh";
  if (hash === "tc") return "tc";
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
          className={`btn__quanlysv ${view === "gv" ? "active" : ""}`}
          onClick={() => setView("gv")}
        >
          {TAB_LABELS.gv}
        </button>
        <button
          className={`btn__quanlysv ${view === "mh" ? "active" : ""}`}
          onClick={() => setView("mh")}
        >
          {TAB_LABELS.mh}
        </button>
        <button
          className={`btn__quanlysv ${view === "tc" ? "active" : ""}`}
          onClick={() => setView("tc")}
        >
          {TAB_LABELS.tc}
        </button>
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
        <Suspense fallback={<div style={{ padding: 16 }}>Đang tải...</div>}>
          {view === "sv" && <QuanLySinhVien />}
          {view === "gv" && <QuanLyGiangVien />}
          {view === "mh" && <QuanLyMonHoc />}
          {view === "tc" && <QuanLyTinChi />} {/* ✅ thêm */}
        </Suspense>
      </div>
    </section>
  );
};

export default QuanLyPDT;
