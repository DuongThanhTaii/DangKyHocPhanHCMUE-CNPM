import "../styles/reset.css";
import "../styles/dangnhap.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLoginMutation } from "../features/auth/api";
import { useAppDispatch } from "../app/hooks";
import { setCredentials } from "../features/auth/slice";
import { ROLE_HOME } from "../features/auth/roleMap";

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
      // điều hướng theo role
      const home = ROLE_HOME[data.user.loai_tai_khoan] ?? "/login";
      navigate(home, { replace: true });
    } catch (err: any) {
      // RTK Query error format
      const msg =
        err?.data?.error ||
        err?.error ||
        "Đăng nhập thất bại hoặc lỗi kết nối máy chủ";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="container">
      <div className="school">
        <img
          src="public/assets/img/school.jpg"
          alt=""
          className="school__img"
        />
      </div>
      <div className="main">
        <div className="header">
          <div className="header__logo">
            <img
              src="public/assets/img/logo2.png"
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

        <form className="form" onSubmit={handleLogin}>
          <h2 className="form__title">ĐĂNG NHẬP</h2>
          <p className="form__desc">Cổng đăng ký học phần</p>

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

          <button type="submit" className="submit" disabled={isLoading}>
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="copyright">
          <p className="copyright__text">
            © 2025 OOAD | Developed by Anh Trai Say Ges{" "}
            <a
              href="https://psctelecom.com.vn/"
              target="_blank"
              rel="noreferrer"
            >
              <img src="public/assets/icon/Logo_PSC_white.png" alt="" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
