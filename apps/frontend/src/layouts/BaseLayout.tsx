import { NavLink, Outlet, useLocation } from "react-router-dom"; // ✅ Bỏ Navigate
import { useEffect, useState, type PropsWithChildren } from "react";
import "../styles/reset.css";
import "../styles/menu.css";
import logo from "../../public/assets/img/logo2.png";
import vnFlag from "../../public/assets/icon/Flag_of_Vietnam.svg";
import { useSidebar } from "../app/hooks/useSidebar";
import SettingModal from "../pages/ModalSetting";
import { selectAuth, logout as doLogout } from "../features/auth/authSlice";
import { useAppSelector, useAppDispatch } from "../app/store";
import type { LayoutConfig } from "./types";

// ✅ THÊM: import modal đổi mật khẩu (đã tách CSS trong file của modal)
import ModalChangePassword from "../components/changepassword/ModalChangePassword";

function formatRole(role?: string) {
  const roleMap: Record<string, string> = {
    sinh_vien: "Sinh viên",
    giang_vien: "Giảng viên",
    phong_dao_tao: "Phòng đào tạo",
    truong_khoa: "Trưởng khoa",
    tro_ly_khoa: "Trợ lý khoa",
  };
  return roleMap[role || ""] || "Người dùng";
}

interface BaseLayoutProps extends PropsWithChildren {
  config: LayoutConfig;
}

export default function BaseLayout({ config, children }: BaseLayoutProps) {
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);

  const [showSetting, setShowSetting] = useState(false);
  // ✅ THÊM: state mở/đóng modal đổi mật khẩu
  const [showChangePass, setShowChangePass] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

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

  // Auto close khi resize lên desktop
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1025px)");
    const onChange = () => m.matches && setSidebarOpen(false);
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, [setSidebarOpen]);

  // Dropdown + ripple
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

    // Ripple effect
    const links = document.querySelectorAll(".navbar__link");
    const rippleHandlers = new Map<Element, (e: any) => void>();

    links.forEach((link) => {
      const handler = (e: any) => {
        const existing = link.querySelector(".ripple");
        if (existing) existing.remove();
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.left = `${e.offsetX}px`;
        ripple.style.top = `${e.offsetY}px`;
        link.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      };
      rippleHandlers.set(link, handler);
      link.addEventListener("click", handler);
    });

    accountClick?.addEventListener("click", toggleAccount);
    langClick?.addEventListener("click", toggleLanguage);
    document.addEventListener("click", clickOutside);

    return () => {
      accountClick?.removeEventListener("click", toggleAccount);
      langClick?.removeEventListener("click", toggleLanguage);
      document.removeEventListener("click", clickOutside);
      rippleHandlers.forEach((handler, link) =>
        link.removeEventListener("click", handler)
      );
    };
  }, []);

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "navbar__link active" : "navbar__link";

  const handleLogout = () => dispatch(doLogout());

  const closeSidebarOnNavClick = () => {
    if (window.matchMedia("(max-width: 1024px)").matches) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="layout">
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
              <p className="user__name">{user?.hoTen}</p>
              <p className="user__score">{user?.maNhanVien}</p>
              <p className="user__role">{formatRole(user?.loaiTaiKhoan)}</p>
            </div>
          </div>
        </div>

        <div className="sidebar__menu">
          <h3 className="sidebar__menu-title">Chức năng</h3>
          <nav className="navbar" onClick={closeSidebarOnNavClick}>
            <ul className="navbar__list">
              {config.menuItems.map((item) => (
                <li key={item.to} className="navbar__item">
                  <NavLink to={item.to} className={getNavLinkClass}>
                    <span className="navbar__link-icon">{item.icon}</span>
                    <span className="navbar__link-text">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

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

          <h1 className="header__title">{config.headerTitle}</h1>

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
              <div className="name__student border_bottom">
                <h6>
                  {user?.hoTen} - {user?.maNhanVien}
                </h6>
              </div>

              {/* ✅ THÊM: nút mở modal đổi mật khẩu */}
              <div className="sign__out p__0 change__password">
                <button onClick={() => setShowChangePass(true)}>
                  <svg
                    focusable="false"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    data-testid="PasswordIcon"
                  >
                    <path d="M2 17h20v2H2v-2zm1.15-4.05L4 11.47l.85 1.48 1.3-.75-.85-1.48H7v-1.5H5.3l.85-1.47L4.85 7 4 8.47 3.15 7l-1.3.75.85 1.47H1v1.5h1.7l-.85 1.48 1.3.75zm6.7-.75 1.3.75.85-1.48.85 1.48 1.3-.75-.85-1.48H15v-1.5h-1.7l.85-1.47-1.3-.75L12 8.47 11.15 7l-1.3.75.85 1.47H9v1.5h1.7l-.85 1.48zM23 9.22h-1.7l.85-1.47-1.3-.75L20 8.47 19.15 7l-1.3.75.85 1.47H17v1.5h1.7l-.85 1.48 1.3.75.85-1.48.85 1.48 1.3-.75-.85-1.48H23v-1.5z"></path>
                  </svg>
                  Đổi mật khẩu
                </button>
              </div>

              <div className="sign__out">
                <button onClick={handleLogout}>Đăng xuất</button>
              </div>
            </div>
          </div>
        </header>

        <section className="main__body">{children ?? <Outlet />}</section>
      </main>

      {sidebarOpen && (
        <div
          className="layout__overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* <button
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
      </button> */}

      <SettingModal
        isOpen={showSetting}
        onClose={() => setShowSetting(false)}
      />

      {/* ✅ Render modal đổi mật khẩu */}
      <ModalChangePassword
        isOpen={showChangePass}
        onClose={() => setShowChangePass(false)}
      />
    </div>
  );
}
