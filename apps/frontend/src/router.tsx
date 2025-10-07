import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import PDTLayout from "./layouts/PDTLayout";
import LoginPage from "./pages/LoginPage";
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

import SinhVienLayout from "./layouts/SVLayout";
import GhiDanhHocPhan from "./pages/sv/GhiDanhHocPhan";

export const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/pdt",
        element: <PDTLayout />,
        children: [
          { index: true, element: <Navigate to="chuyen-trang-thai" replace /> },
          { path: "chuyen-trang-thai", element: <ChuyenTrangThai /> },
          { path: "duyet-hoc-phan", element: <PDTDuyetHocPhan /> },
          { path: "tao-lop-hoc-phan", element: <TaoLopHocPhan /> },
          { path: "quan-ly", element: <QuanLyNoiBo /> },
          { path: "thong-ke-dashboard", element: <ThongKeDashboard /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/gv",
        element: <GVLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <GiaoVienDashboard /> },
        ],
      },
    ],
  },
  {
    path: "/tlk",
    element: <TroLyKhoaLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="len-danh-sach-hoc-phan" replace />,
      },
      { path: "len-danh-sach-hoc-phan", element: <LenDanhSachHocPhan /> },
      { path: "duyet-hoc-phan", element: <TlkDuyetHocPhan /> },
    ],
  },
  {
    path: "/tk",
    element: <TruongKhoaLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="duyet-hoc-phan" replace />,
      },

      { path: "duyet-hoc-phan", element: <TkDuyetHocPhan /> },
    ],
  },
  {
    path: "/sv",
    element: <SinhVienLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="ghi-danh-hoc-phan" replace />,
      },
      // { path: "dang-ky-hoc-phan", element: <DangKyHocPhan /> },
      { path: "ghi-danh-hoc-phan", element: <GhiDanhHocPhan /> },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);
