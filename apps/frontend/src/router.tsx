import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PDTLayout from "./layouts/PDTLayout";
import LoginPage from "./pages/LoginPage";
import ChuyenHocKyHienHanh from "./pages/pdt/ChuyenHocKyHienHanh";
import ChuyenTrangThai from "./pages/pdt/ChuyenTrangThai";
import PDTDuyetHocPhan from "./pages/pdt/DuyetHocPhan-PDT";
import TaoLopHocPhan from "./pages/pdt/TaoLopHocPhan";
import QuanLyNoiBo from "./pages/pdt/QuanLyNoiBo";
import ThongKeDashboard from "./pages/pdt/ThongKeDashboard";

import GVLayout from "./layouts/GVLayout";
import GiaoVienDashboard from "./pages/gv/Dashboard";

import TroLyKhoaLayout from "./layouts/TroLyKhoaLayout";
import LenDanhSachHocPhan from "./pages/tlk/LenDanhSachHocPhan";
import TlkDuyetHocPhan from "./pages/tlk/DuyetHocPhan-TLK";

import TruongKhoaLayout from "./layouts/TruongKhoaLayout";
import TkDuyetHocPhan from "./pages/tk/DuyetHocPhan-TK";

import GhiDanhHocPhan from "./pages/sv/GhiDanhHocPhan";
import TraCuuMonHoc from "./pages/sv/TraCuuMonHoc";
import SVLayout from "./layouts/SVLayout";
import LichSuDangKy from "./pages/sv/LichSuDangKyHocPhan";
import XemThoiKhoaBieu from "./pages/sv/XemThoiKhoaBieu";

export const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },

  // PDT - chỉ cho phong_dao_tao
  {
    path: "/pdt",
    element: (
      <ProtectedRoute allow={["phong_dao_tao"]}>
        <PDTLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="chuyen-trang-thai" replace /> },
      { path: "chuyen-trang-thai", element: <ChuyenTrangThai /> },
      { path: "duyet-hoc-phan", element: <PDTDuyetHocPhan /> },
      { path: "tao-lop-hoc-phan", element: <TaoLopHocPhan /> },
      { path: "quan-ly", element: <QuanLyNoiBo /> },
      { path: "thong-ke-dashboard", element: <ThongKeDashboard /> },
      { path: "chuyen-hoc-ky", element: <ChuyenHocKyHienHanh /> },
    ],
  },

  // GV - giang_vien
  {
    path: "/gv",
    element: (
      <ProtectedRoute allow={["giang_vien"]}>
        <GVLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <GiaoVienDashboard /> },
    ],
  },

  // TLK - tro_ly_khoa
  {
    path: "/tlk",
    element: (
      <ProtectedRoute allow={["tro_ly_khoa"]}>
        <TroLyKhoaLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="len-danh-sach-hoc-phan" replace />,
      },
      { path: "len-danh-sach-hoc-phan", element: <LenDanhSachHocPhan /> },
      { path: "duyet-hoc-phan", element: <TlkDuyetHocPhan /> },
    ],
  },

  // TK - truong_khoa
  {
    path: "/tk",
    element: (
      <ProtectedRoute allow={["truong_khoa"]}>
        <TruongKhoaLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="duyet-hoc-phan" replace /> },
      { path: "duyet-hoc-phan", element: <TkDuyetHocPhan /> },
    ],
  },

  // SV - sinh_vien
  {
    path: "/sv",
    element: <SVLayout />,
    children: [
      { index: true, element: <Navigate to="ghi-danh-hoc-phan" replace /> },
      { path: "ghi-danh-hoc-phan", element: <GhiDanhHocPhan /> },
      { path: "tra-cuu-mon-hoc", element: <TraCuuMonHoc /> },
      { path: "lich-su-dang-ky-hoc-phan", element: <LichSuDangKy /> },
      { path: "xem-thoi-khoa-bieu", element: <XemThoiKhoaBieu /> },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);
