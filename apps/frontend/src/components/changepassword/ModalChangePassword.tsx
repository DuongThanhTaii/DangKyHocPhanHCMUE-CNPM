import React, { useEffect, useMemo, useState } from "react";
import "./modal-change-password.css";
import { useAppSelector } from "../../app/store";
import { selectAuth } from "../../features/auth/authSlice";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

// === SVG EYE ICONS (Font Awesome paths bạn cung cấp) ===
const EyeOpen: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 576 512"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6-46.8 43.5-78.1 95.4-93 131.1-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64-11.5 0-22.3-3-31.7-8.4-1 10.9-.1 22.1 2.9 33.2 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-12.2-45.7-55.5-74.8-101.1-70.8 5.3 9.3 8.4 20.1 8.4 31.7z" />
  </svg>
);

const EyeClosed: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 576 512"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M41-24.9c-9.4-9.4-24.6-9.4-33.9 0S-2.3-.3 7 9.1l528 528c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-96.4-96.4c2.7-2.4 5.4-4.8 8-7.2 46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6-56.8 0-105.6 18.2-146 44.2L41-24.9zM204.5 138.7c23.5-16.8 52.4-26.7 83.5-26.7 79.5 0 144 64.5 144 144 0 31.1-9.9 59.9-26.7 83.5l-34.7-34.7c12.7-21.4 17-47.7 10.1-73.7-13.7-51.2-66.4-81.6-117.6-67.9-8.6 2.3-16.7 5.7-24 10l-34.7-34.7zM325.3 395.1c-11.9 3.2-24.4 4.9-37.3 4.9-79.5 0-144-64.5-144-144 0-12.9 1.7-25.4 4.9-37.3L69.4 139.2c-32.6 36.8-55 75.8-66.9 104.5-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6 37.3 0 71.2-7.9 101.5-20.6l-64.2-64.2z" />
  </svg>
);

export default function ModalChangePassword({ isOpen, onClose }: Props) {
  const { token } = useAppSelector(selectAuth);

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "ok"; text: string }>();

  const strip = (s = "") => s.replace(/<[^>]*>/g, "");

  const fieldErrors = useMemo(() => {
    const errs: Record<string, string | undefined> = {};
    if (!oldPass) errs.old = "Vui lòng nhập mật khẩu hiện tại";
    if (!newPass) errs.new = "Vui lòng nhập mật khẩu mới";
    else if (newPass.length < 6) errs.new = "Mật khẩu mới tối thiểu 6 ký tự";
    if (!confirm) errs.confirm = "Vui lòng xác nhận mật khẩu mới";
    else if (confirm !== newPass) errs.confirm = "Xác nhận mật khẩu không khớp";
    return errs;
  }, [oldPass, newPass, confirm]);

  useEffect(() => {
    if (!isOpen) {
      setOldPass("");
      setNewPass("");
      setConfirm("");
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
      setMsg(undefined);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(undefined);

    if (fieldErrors.old || fieldErrors.new || fieldErrors.confirm) {
      setMsg({ type: "error", text: "Vui lòng kiểm tra lại thông tin." });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
      });

      let json: any = undefined;
      try {
        json = await res.json();
      } catch {
        /* ignore */
      }

      if (!res.ok) {
        const serverMsg =
          json?.error ||
          json?.message ||
          (res.status === 401
            ? "Phiên đăng nhập đã hết hạn."
            : "Đổi mật khẩu thất bại");
        throw new Error(serverMsg);
      }

      setMsg({ type: "ok", text: "Đổi mật khẩu thành công." });
      setTimeout(onClose, 1200);
    } catch (err: any) {
      setMsg({
        type: "error",
        text: strip(err?.message || "Không thể đổi mật khẩu."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="cp-modal__overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Đổi mật khẩu"
    >
      <div className="cp-modal__popup" onClick={(e) => e.stopPropagation()}>
        <div className="cp-modal__header">
          <p>ĐỔI MẬT KHẨU</p>
        </div>

        <form onSubmit={onSubmit} className="form__change__password">
          {/* Mật khẩu hiện tại */}
          <div className={`form__group ${fieldErrors.old ? "has-error" : ""}`}>
            <input
              id="old-password"
              type={showOld ? "text" : "password"}
              placeholder=" "
              required
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              autoComplete="current-password"
            />
            <label htmlFor="old-password">Mật khẩu hiện tại</label>
            <button
              type="button"
              className="pw-eye-btn"
              aria-label={showOld ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              onClick={() => setShowOld((s) => !s)}
            >
              {showOld ? <EyeClosed size={18} /> : <EyeOpen size={18} />}
            </button>
            <p className="form__message">
              {fieldErrors.old
                ? fieldErrors.old
                : "Nhập mật khẩu hiện tại của bạn"}
            </p>
          </div>

          {/* Mật khẩu mới */}
          <div className={`form__group ${fieldErrors.new ? "has-error" : ""}`}>
            <input
              id="new-password"
              type={showNew ? "text" : "password"}
              placeholder=" "
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              autoComplete="new-password"
            />
            <label htmlFor="new-password">Mật khẩu mới</label>
            <button
              type="button"
              className="pw-eye-btn"
              aria-label={showNew ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              onClick={() => setShowNew((s) => !s)}
            >
              {showNew ? <EyeClosed size={20} /> : <EyeOpen size={20} />}
            </button>
            <p className="form__message">
              {fieldErrors.new ? fieldErrors.new : "Tối thiểu 6 ký tự"}
            </p>
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div
            className={`form__group ${fieldErrors.confirm ? "has-error" : ""}`}
          >
            <input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              placeholder=" "
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
            <label htmlFor="confirm-password">Xác nhận mật khẩu mới</label>
            <button
              type="button"
              className="pw-eye-btn"
              aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              onClick={() => setShowConfirm((s) => !s)}
            >
              {showConfirm ? <EyeClosed size={20} /> : <EyeOpen size={20} />}
            </button>
            <p className="form__message">
              {fieldErrors.confirm
                ? fieldErrors.confirm
                : "Nhập lại mật khẩu mới"}
            </p>
          </div>

          {msg && (
            <p
              className={`cp-modal__msg ${
                msg.type === "error" ? "is-error" : "is-ok"
              }`}
              aria-live="polite"
            >
              {strip(msg.text)}
            </p>
          )}

          <div className="cp-modal__actions">
            <button
              type="button"
              className="cp-btn cp-btn--ghost"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="cp-btn cp-btn--primary"
              disabled={loading}
            >
              {loading ? "Đang đổi..." : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
