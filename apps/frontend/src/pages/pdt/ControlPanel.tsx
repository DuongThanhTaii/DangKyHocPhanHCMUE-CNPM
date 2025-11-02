// src/pages/pdt/ControlPanel.tsx
import React from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";

type ControlPanelProps = {
  statuses?: { key: string; label: string }[];
  onSet?: (key: string) => void;
  onReset?: () => void;
};

const DEFAULT_STATUSES = [
  { key: "state_1", label: "Tiền ghi danh" },
  { key: "state_2", label: "Ghi danh" },
  { key: "state_3", label: "Sắp xếp thời khóa biểu" },
  { key: "state_4", label: "Đăng ký học phần" },
  { key: "state_5", label: "Thống kê" },
];

export default function ControlPanel({
  statuses = DEFAULT_STATUSES,
  onSet,
  onReset,
}: ControlPanelProps) {
  const handleSet = (key: string) => (onSet ? onSet(key) : console.log(key));
  const handleReset = () => (onReset ? onReset() : console.log("RESET"));

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">CONTROL PANEL</p>
      </div>

      <div className="body__inner">
        {/* Header */}
        <div className="cp-row cp-row--head">
          <div className="cp-cell">Tên trạng thái</div>
          <div className="cp-cell cp-cell--right">Thao tác</div>
        </div>

        {/* Rows */}
        {statuses.map((st, idx) => (
          <div className="cp-row" key={st.key}>
            <div className="cp-cell">
              <label className="pos__unset cp-label">
                <span className="cp-dot" aria-hidden />
                {st.label}
              </label>
            </div>
            <div className="cp-cell cp-cell--right">
              <button
                type="button"
                className="btn__chung h__40__w__100"
                onClick={() => handleSet(st.key)}
              >
                Set
              </button>
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="cp-footer">
          <button
            type="button"
            className="btn-cancel h__40__w__100"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
