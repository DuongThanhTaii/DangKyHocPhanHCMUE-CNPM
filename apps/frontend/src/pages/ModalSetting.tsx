import React from "react";

export default function SettingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="layout__overlay" onClick={onClose} />
      <div className="card setting__card">
        <h3>Cài đặt</h3>
        <p>
          Placeholder cho phần Setting – thêm theme, ngôn ngữ, cấu hình kỳ đăng
          ký…
        </p>
        <button onClick={onClose} className="btn btn-primary">
          Đóng
        </button>
      </div>
    </div>
  );
}
