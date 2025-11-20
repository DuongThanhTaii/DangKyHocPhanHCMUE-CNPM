import "../styles/reset.css";
import "../styles/dangnhap.css";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useModalContext } from "../hook/ModalContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { openNotify } = useModalContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!token) {
      const msg = "Thiếu token khôi phục trong đường dẫn.";
      setErrorMsg(msg);
      openNotify?.(msg, "error");
      return;
    }
    if (!password || password.length < 6) {
      const msg = "Mật khẩu phải có ít nhất 6 ký tự.";
      setErrorMsg(msg);
      openNotify?.(msg, "warning");
      return;
    }
    if (password !== confirm) {
      const msg = "Xác nhận mật khẩu không khớp.";
      setErrorMsg(msg);
      openNotify?.(msg, "warning");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Đổi mật khẩu thất bại");

      openNotify?.("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.", "success");
      navigate("/login", { replace: true });
    } catch (err: any) {
      const msg = err?.message || "Không thể đổi mật khẩu";
      setErrorMsg(msg);
      openNotify?.(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="school">
        <img src="/assets/img/school.jpg" alt="" className="school__img" />
      </div>

      <div className="main">
        <div className="header">
          <div className="header__logo">
            <img src="/assets/img/logo2.png" alt="" className="header__logo-img" />
          </div>
          <div className="header__info">
            <h1 className="header__name-school">
              TRƯỜNG ĐẠI HỌC SƯ PHẠM THÀNH PHỐ HỒ CHÍ MINH
            </h1>
            <p className="header__label">CỔNG ĐĂNG KÝ HỌC PHẦN</p>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <h2 className="form__title">ĐỔI MẬT KHẨU</h2>
          <p className="form__desc">Nhập mật khẩu mới cho tài khoản của bạn</p>

          {!token && (
            <p style={{ color: "red", textAlign: "center", marginBottom: 12 }}>
              Link không hợp lệ hoặc thiếu token.
            </p>
          )}

          <div className="form__group">
            <input
              type="password"
              placeholder=" "
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <label>Mật khẩu mới</label>
            <p className="form__message">Ít nhất 6 ký tự</p>
          </div>

          <div className="form__group">
            <input
              type="password"
              placeholder=" "
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
            <label>Xác nhận mật khẩu</label>
            <p className="form__message">Nhập lại giống mật khẩu mới</p>
          </div>

          {errorMsg && (
            <p
              style={{
                color: "red",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              {errorMsg}
            </p>
          )}

          <button type="submit" className="submit" disabled={loading || !token}>
            {loading ? "Đang đổi..." : "Xác nhận"}
          </button>
          <hr />
          <p className="forget_password_text" onClick={() => navigate("/login")}>
            Quay lại đăng nhập
          </p>
        </form>

        <div className="copyright">
          <p className="copyright__text">
            © 2025 OOAD | Developed by Anh Trai Say Ges{" "}
            <a href="https://psctelecom.com.vn/" target="_blank" rel="noreferrer">
              <img src="/assets/icon/Logo_PSC_white.png" alt="" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
