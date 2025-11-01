import "../styles/reset.css";
import "../styles/dangnhap.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLoginMutation } from "../features/auth/api";
import { useAppDispatch } from "../app/hooks";
import { setCredentials } from "../features/auth/authSlice";
import { ROLE_HOME } from "../features/auth/roleMap";
import { useModalContext } from "../hook/ModalContext";

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { openNotify } = useModalContext();

  const [login, { isLoading }] = useLoginMutation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [isSendingForgot, setIsSendingForgot] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSendingForgot(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ten_dang_nhap: username, email }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gửi thất bại");

      openNotify?.(
        "Đã gửi email khôi phục, vui lòng kiểm tra hộp thư!",
        "success"
      );
      setMode("login");
    } catch (err: any) {
      const msg = err?.message || "Không thể gửi email khôi phục";
      setErrorMsg(msg);
      openNotify?.(msg, "error");
    } finally {
      setIsSendingForgot(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const data = await login({
        tenDangNhap: username,
        matKhau: password,
      }).unwrap();

      // lưu vào store + localStorage
      dispatch(setCredentials({ token: data.token, user: data.user }));

      // notify & điều hướng theo role
      openNotify?.("Đăng nhập thành công", "success");
      const home = ROLE_HOME[data.user.loaiTaiKhoan] ?? "/login";
      navigate(home, { replace: true });
    } catch (err: any) {
      const msg =
        err?.data?.error ||
        err?.error ||
        "Đăng nhập thất bại hoặc lỗi kết nối máy chủ";
      setErrorMsg(msg);
      openNotify?.(msg, "error");
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
            <img
              src="/assets/img/logo2.png"
              alt=""
              className="header__logo-img"
            />
          </div>
          <div className="header__info">
            <h1 className="header__name-school">
              TRƯỜNG ĐẠI HỌC SƯ PHẠM THÀNH PHỐ HỒ CHÍ MINH
            </h1>
            <p className="header__label">CỔNG ĐĂNG KÝ HỌC PHẦN</p>
          </div>
        </div>

        <form
          className="form"
          onSubmit={mode === "login" ? handleLogin : handleForgot}
        >
          <h2 className="form__title">
            {mode === "login" ? "ĐĂNG NHẬP" : "QUÊN MẬT KHẨU"}
          </h2>
          <p className="form__desc">
            {mode === "login"
              ? "Cổng đăng ký học phần"
              : "Nhập thông tin để khôi phục mật khẩu"}
          </p>

          {/* Form đăng nhập */}
          {mode === "login" && (
            <>
              <div className="form__group">
                <input
                  type="text"
                  name="username"
                  placeholder=" "
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
                <label>Tên đăng nhập</label>
                <p className="form__message">Tên đăng nhập là bắt buộc</p>
              </div>

              <div className="form__group">
                <input
                  type="password"
                  name="password"
                  placeholder=" "
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <label>Mật khẩu</label>
                <p className="form__message">Mật khẩu là bắt buộc</p>
              </div>
            </>
          )}

          {/* Form quên mật khẩu */}
          {mode === "forgot" && (
            <>
              <div className="form__group">
                <input
                  type="text"
                  placeholder=" "
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
                <label>Tên đăng nhập</label>
                <p className="form__message">Tên đăng nhập là bắt buộc</p>
              </div>
              <div className="form__group">
                <input
                  type="email"
                  placeholder=" "
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <label>Email</label>
                <p className="form__message">
                  Email phải đúng với email được cấp
                </p>
              </div>
            </>
          )}

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

          <button
            type="submit"
            className="submit"
            disabled={isLoading || isSendingForgot}
          >
            {mode === "login"
              ? isLoading
                ? "Đang đăng nhập..."
                : "Đăng nhập"
              : isSendingForgot
              ? "Đang gửi..."
              : "Gửi email khôi phục"}
          </button>

          <hr />

          <p
            className="forget_password_text"
            onClick={() => setMode(mode === "login" ? "forgot" : "login")}
          >
            {mode === "login" ? "Quên mật khẩu?" : "Quay lại đăng nhập"}
          </p>
        </form>

        <div className="copyright">
          <p className="copyright__text">
            © 2025 CNPM | Developed by Anh Trai Say Ges{" "}
            <a
              href="https://psctelecom.com.vn/"
              target="_blank"
              rel="noreferrer"
            >
              <img src="/assets/icon/Logo_PSC_white.png" alt="" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
