import { NavLink, Outlet, useLocation, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "../styles/reset.css";
import "../styles/menu.css";
import logo from "../../public/assets/img/logo2.png";
import vnFlag from "../../public/assets/icon/Flag_of_Vietnam.svg";
import { useSidebar } from "../app/hooks/useSidebar";
import SettingModal from "../pages/ModalSetting";
import { selectAuth, logout as doLogout } from "../features/auth/authSlice";
import { useAppSelector, useAppDispatch } from "../app/store";

function formatRole(role?: string) {
  switch (role) {
    case "sinh_vien":
      return "Sinh viên";
    case "giang_vien":
    case "giao_vien":
      return "Giảng viên";
    case "phong_dao_tao":
      return "Phòng đào tạo";
    case "truong_khoa":
      return "Trưởng khoa";
    case "tro_ly_khoa":
      return "Trợ lý khoa";
    default:
      return "Người dùng";
  }
}

export default function SinhVienLayout() {
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector(selectAuth);
  const [showSetting, setShowSetting] = useState(false);

  // ✅ Guard: chỉ cho sinh viên đã đăng nhập
  if (!token || !user || user.loai_tai_khoan !== "sinh_vien") {
    return <Navigate to="/" replace />;
  }

  // Đóng sidebar khi đổi route
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  // ESC để đóng + khóa scroll nền khi mở sidebar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setSidebarOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.classList.toggle("no-scroll", sidebarOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("no-scroll");
    };
  }, [sidebarOpen, setSidebarOpen]);

  // Nếu đang mở mà phóng to lên desktop thì tự đóng
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1025px)");
    const onChange = () => m.matches && setSidebarOpen(false);
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, [setSidebarOpen]);

  // Dropdown user + language + ripple (giống GVLayout)
  useEffect(() => {
    const accountClick = document.getElementById("user__icon");
    const accountPopup = document.getElementById("modal");
    const langClick = document.getElementById("header__country");
    const langPopup = document.getElementById("language");

    const toggleAccount = () => {
      if (accountPopup)
        accountPopup.style.display =
          accountPopup.style.display === "block" ? "none" : "block";
    };

    const toggleLanguage = () => {
      if (langPopup)
        langPopup.style.display =
          langPopup.style.display === "flex" ? "none" : "flex";
    };

    const clickOutside = (e: MouseEvent) => {
      if (
        accountPopup &&
        accountClick &&
        !accountClick.contains(e.target as Node) &&
        !accountPopup.contains(e.target as Node)
      ) {
        accountPopup.style.display = "none";
      }

      if (
        langPopup &&
        langClick &&
        !langClick.contains(e.target as Node) &&
        !langPopup.contains(e.target as Node)
      ) {
        langPopup.style.display = "none";
      }
    };

    // Ripple effect khi click navbar__link
    const links = document.querySelectorAll(".navbar__link");
    const addRipple = (link: Element) => (e: any) => {
      const existing = link.querySelector(".ripple");
      if (existing) existing.remove();
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.left = `${e.offsetX}px`;
      ripple.style.top = `${e.offsetY}px`;
      link.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    };
    links.forEach((link) => link.addEventListener("click", addRipple(link)));

    accountClick?.addEventListener("click", toggleAccount);
    langClick?.addEventListener("click", toggleLanguage);
    document.addEventListener("click", clickOutside);

    return () => {
      accountClick?.removeEventListener("click", toggleAccount);
      langClick?.removeEventListener("click", toggleLanguage);
      document.removeEventListener("click", clickOutside);
      links.forEach((link) =>
        link.removeEventListener("click", addRipple(link))
      );
    };
  }, []);

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "navbar__link active" : "navbar__link";

  const handleLogout = () => {
    dispatch(doLogout());
  };

  const closeSidebarOnNavClick = () => {
    if (window.matchMedia("(max-width: 1024px)").matches) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="layout">
      {/* SIDEBAR */}
      <aside
        id="app-sidebar"
        className={`layout__sidebar ${sidebarOpen ? "is-open" : ""}`}
        aria-hidden={!sidebarOpen}
      >
        <div className="sidebar__logo">
          <img src={logo} alt="logo" className="logo-img" />
        </div>

        <div className="sidebar__info">
          <div className="sidebar__user">
            <div className="user__icon">
              <svg
                className="user__icon-img"
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="37"
                viewBox="0 0 36 37"
                fill="none"
              >
                <path
                  d="M18 18.475C21.315 18.475 24 15.79 24 12.475C24 9.16001 21.315 6.47501 18 6.47501C14.685 6.47501 12 9.16001 12 12.475C12 15.79 14.685 18.475 18 18.475ZM18 21.475C13.995 21.475 6 23.485 6 27.475V30.475H30V27.475C30 23.485 22.005 21.475 18 21.475Z"
                  fill="#172B4D"
                />
              </svg>
            </div>
            <div className="user__body">
              <p className="user__name">{user?.ho_ten}</p>
              <p className="user__score">{user?.ma_so_sinh_vien || ""}</p>
              <p className="user__role">{formatRole(user?.loai_tai_khoan)}</p>
            </div>
          </div>
        </div>

        <div className="sidebar__menu">
          <h3 className="sidebar__menu-title">Chức năng</h3>
          <nav className="navbar" onClick={closeSidebarOnNavClick}>
            <ul className="navbar__list">
              <li className="navbar__item">
                <NavLink to="dang-ky-hoc-phan" className={getNavLinkClass}>
                  <span className="navbar__link-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="21"
                      viewBox="0 0 20 21"
                      fill="none"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.99999 13.004V16.204L9.59999 19.26L15.2 16.204V13.004L9.59999 16.06L3.99999 13.004ZM9.59999 4.86002L0.799988 9.66002L9.59999 14.46L16.8 10.532V16.06H18.4V9.66002L9.59999 4.86002Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <span className="navbar__link-text">Đăng ký học phần</span>
                </NavLink>
              </li>

              <li className="navbar__item">
                <NavLink to="ghi-danh" className={getNavLinkClass}>
                  <span className="navbar__link-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="21"
                      viewBox="0 0 20 21"
                      fill="none"
                    >
                      <path
                        d="M7.5 10.46L9.16667 12.1267L12.5 8.79336M17.5 10.46C17.5 11.4449 17.306 12.4202 16.9291 13.3301C16.5522 14.2401 15.9997 15.0669 15.3033 15.7633C14.6069 16.4598 13.7801 17.0122 12.8701 17.3891C11.9602 17.766 10.9849 17.96 10 17.96C9.01509 17.96 8.03982 17.766 7.12987 17.3891C6.21993 17.0122 5.39314 16.4598 4.6967 15.7633C4.00026 15.0669 3.44781 14.2401 3.0709 13.3301C2.69399 12.4202 2.5 11.4449 2.5 10.46C2.5 8.4709 3.29018 6.56324 4.6967 5.15672C6.10322 3.7502 8.01088 2.96002 10 2.96002C11.9891 2.96002 13.8968 3.7502 15.3033 5.15672C16.7098 6.56324 17.5 8.4709 17.5 10.46Z"
                        stroke="currentColor"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="navbar__link-text">Đăng ký ghi danh</span>
                </NavLink>
              </li>

              <li className="navbar__item">
                <NavLink to="tra-cuu" className={getNavLinkClass}>
                  <span className="navbar__link-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="21"
                      viewBox="0 0 20 21"
                      fill="none"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8 4.45999C6.93913 4.45999 5.92172 4.88142 5.17157 5.63157C4.42143 6.38171 4 7.39913 4 8.45999C4 9.52086 4.42143 10.5383 5.17157 11.2884C5.92172 12.0386 6.93913 12.46 8 12.46C9.06087 12.46 10.0783 12.0386 10.8284 11.2884C11.5786 10.5383 12 9.52086 12 8.45999C12 7.39913 11.5786 6.38171 10.8284 5.63157C10.0783 4.88142 9.06087 4.45999 8 4.45999ZM2 8.45999C1.99988 7.5157 2.22264 6.58471 2.65017 5.74274C3.0777 4.90077 3.69792 4.17159 4.4604 3.61452C5.22287 3.05745 6.10606 2.68821 7.03815 2.53683C7.97023 2.38545 8.92488 2.45621 9.82446 2.74335C10.724 3.03048 11.5432 3.5259 12.2152 4.18929C12.8872 4.85268 13.3931 5.66533 13.6919 6.56113C13.9906 7.45693 14.0737 8.41059 13.9343 9.34455C13.795 10.2785 13.4372 11.1664 12.89 11.936L17.707 16.753C17.8892 16.9416 17.99 17.1942 17.9877 17.4564C17.9854 17.7186 17.8802 17.9694 17.6948 18.1548C17.5094 18.3402 17.2586 18.4454 16.9964 18.4477C16.7342 18.4499 16.4816 18.3492 16.293 18.167L11.477 13.351C10.5794 13.9893 9.52335 14.3682 8.42468 14.4461C7.326 14.5241 6.22707 14.2981 5.2483 13.793C4.26953 13.2878 3.44869 12.523 2.87572 11.5823C2.30276 10.6417 1.99979 9.56143 2 8.45999Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <span className="navbar__link-text">Tra cứu học phần</span>
                </NavLink>
              </li>

              <li className="navbar__item">
                <NavLink
                  to="lich-su-dang-ky-hoc-phan"
                  className={getNavLinkClass}
                >
                  <span className="navbar__link-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="21"
                      viewBox="0 0 20 21"
                      fill="none"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2.46002C6.48 2.46002 2 6.94002 2 12.46C2 17.98 6.48 22.46 12 22.46C17.52 22.46 22 17.98 22 12.46C22 6.94002 17.52 2.46002 12 2.46002ZM7 7.46002H14V9.46002H7V7.46002ZM7 10.46H14V12.46H7V10.46ZM10 15.46H7V13.46H10V15.46ZM14.05 18.82L11.22 15.99L12.63 14.58L14.04 15.99L17.59 12.46L19 13.87L14.05 18.82Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <span className="navbar__link-text">Lịch sử đăng ký</span>
                </NavLink>
              </li>

              <li className="navbar__item">
                <NavLink to="xem-tkb" className={getNavLinkClass}>
                  <span className="navbar__link-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 640"
                    >
                      <path
                        fill="currentColor"
                        d="M224 64C206.3 64 192 78.3 192 96L192 128L160 128C124.7 128 96 156.7 96 192L96 240L544 240L544 192C544 156.7 515.3 128 480 128L448 128L448 96C448 78.3 433.7 64 416 64C398.3 64 384 78.3 384 96L384 128L256 128L256 96C256 78.3 241.7 64 224 64zM96 288L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 288L96 288z"
                      />
                    </svg>
                  </span>
                  <span className="navbar__link-text">Xem TKB</span>
                </NavLink>
              </li>

              <li className="navbar__item">
                <NavLink to="thanh-toan-hoc-phi" className={getNavLinkClass}>
                  <span className="navbar__link-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 640"
                    >
                      <path
                        fill="currentColor"
                        d="M128 128C92.7 128 64 156.7 64 192L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 192C576 156.7 547.3 128 512 128L128 128zM320 224C373 224 416 267 416 320C416 373 373 416 320 416C267 416 224 373 224 320C224 267 267 224 320 224zM512 248C512 252.4 508.4 256.1 504 255.5C475 251.9 452.1 228.9 448.5 200C448 195.6 451.6 192 456 192L504 192C508.4 192 512 195.6 512 200L512 248zM128 392C128 387.6 131.6 383.9 136 384.5C165 388.1 187.9 411.1 191.5 440C192 444.4 188.4 448 184 448L136 448C131.6 448 128 444.4 128 440L128 392zM136 255.5C131.6 256 128 252.4 128 248L128 200C128 195.6 131.6 192 136 192L184 192C188.4 192 192.1 195.6 191.5 200C187.9 229 164.9 251.9 136 255.5zM504 384.5C508.4 384 512 387.6 512 392L512 440C512 444.4 508.4 448 504 448L456 448C451.6 448 447.9 444.4 448.5 440C452.1 411 475.1 388.1 504 384.5z"
                      />
                    </svg>
                  </span>
                  <span className="navbar__link-text">Thanh toán</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* MAIN */}
      <main className="layout__main">
        <header className="header__menu">
          <button
            className="btn__hamburger"
            aria-label="Mở menu"
            aria-controls="app-sidebar"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path
                fill="#ffffff"
                d="M96 160C96 142.3 110.3 128 128 128L512 128C529.7 128 544 142.3 544 160C544 177.7 529.7 192 512 192L128 192C110.3 192 96 177.7 96 160zM96 320C96 302.3 110.3 288 128 288L512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352L128 352C110.3 352 96 337.7 96 320zM544 480C544 497.7 529.7 512 512 512L128 512C110.3 512 96 497.7 96 480C96 462.3 110.3 448 128 448L512 448C529.7 448 544 462.3 544 480z"
              />
            </svg>
          </button>

          <h1 className="header__title">
            HỆ THỐNG SINH VIÊN - TRƯỜNG ĐH SƯ PHẠM TP.HCM
          </h1>

          <div className="header__user">
            <div className="header__country" id="header__country">
              <img className="header__country-img" src={vnFlag} alt="vn" />
            </div>
            <div className="language hidden__language" id="language">
              <img src={vnFlag} alt="Vietnamese" />
              <p>Vietnamese</p>
            </div>
            <div className="user__icon" id="user__icon">
              <svg
                className="user__icon-img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 36 37"
                fill="currentColor"
              >
                <path d="M18 18.475C21.315 18.475 24 15.79 24 12.475C24 9.16001 21.315 6.47501 18 6.47501C14.685 6.47501 12 9.16001 12 12.475C12 15.79 14.685 18.475 18 18.475ZM18 21.475C13.995 21.475 6 23.485 6 27.475V30.475H30V27.475C30 23.485 22.005 21.475 18 21.475Z" />
              </svg>
            </div>
            <div className="modal" id="modal">
              <div className="name__student">
                <h6>
                  {user?.ho_ten}{" "}
                  {user?.ma_so_sinh_vien ? `- ${user.ma_so_sinh_vien}` : ""}
                </h6>
              </div>
              <div className="sign__out">
                <button onClick={handleLogout}>Đăng xuất</button>
              </div>
            </div>
          </div>
        </header>

        <section className="main__body">
          <Outlet />
        </section>
      </main>

      {sidebarOpen && (
        <div
          className="layout__overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <button
        className="btn__setting"
        onClick={() => setShowSetting(true)}
        aria-label="Cài đặt"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path
            fill="currentColor"
            d="M259.1 73.5C262.1 58.7 275.2 48 290.4 48L350.2 48C365.4 48 378.5 58.7 381.5 73.5L396 143.5C410.1 149.5 423.3 157.2 435.3 166.3L503.1 143.8C517.5 139 533.3 145 540.9 158.2L570.8 210C578.4 223.2 575.7 239.8 564.3 249.9L511 297.3C511.9 304.7 512.3 312.3 512.3 320C512.3 327.7 511.8 335.3 511 342.7L564.4 390.2C575.8 400.3 578.4 417 570.9 430.1L541 481.9C533.4 495 517.6 501.1 503.2 496.3L435.4 473.8C423.3 482.9 410.1 490.5 396.1 496.6L381.7 566.5C378.6 581.4 365.5 592 350.4 592L290.6 592C275.4 592 262.3 581.3 259.3 566.5L244.9 496.6C230.8 490.6 217.7 482.9 205.6 473.8L137.5 496.3C123.1 501.1 107.3 495.1 99.7 481.9L69.8 430.1C62.2 416.9 64.9 400.3 76.3 390.2L129.7 342.7C128.8 335.3 128.4 327.7 128.4 320C128.4 312.3 128.9 304.7 129.7 297.3L76.3 249.8C64.9 239.7 62.3 223 69.8 209.9L99.7 158.1C107.3 144.9 123.1 138.9 137.5 143.7L205.3 166.2C217.4 157.1 230.6 149.5 244.6 143.4L259.1 73.5zM320.3 400C364.5 399.8 400.2 363.9 400 319.7C399.8 275.5 363.9 239.8 319.7 240C275.5 240.2 239.8 276.1 240 320.3C240.2 364.5 276.1 400.2 320.3 400z"
          />
        </svg>
      </button>

      <SettingModal
        isOpen={showSetting}
        onClose={() => setShowSetting(false)}
      />
    </div>
  );
}
