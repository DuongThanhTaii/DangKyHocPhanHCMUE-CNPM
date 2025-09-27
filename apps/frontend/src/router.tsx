import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import PDTLayout from "./layouts/PDTLayout";
import LoginPage from "./pages/LoginPage";
import ChuyenTrangThai from "./pages/pdt/ChuyenTrangThai";
import DuyetHocPhan from "./pages/pdt/DuyetHocPhan";
import TaoLopHocPhan from "./pages/pdt/TaoLopHocPhan";
import QuanLyNoiBo from "./pages/pdt/QuanLyNoiBo";
import ThongKeDashboard from "./pages/pdt/ThongKeDashboard";
import GVLayout from "./layouts/GVLayout";
import GiaoVienDashboard from "./pages/gv/Dashboard";

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
          { path: "duyet-hoc-phan", element: <DuyetHocPhan /> },
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
  { path: "*", element: <Navigate to="/" replace /> },
]);
