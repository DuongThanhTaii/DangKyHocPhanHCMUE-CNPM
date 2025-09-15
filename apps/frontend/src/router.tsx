import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

const Dummy = (text: string) => () => <div style={{ padding: 24 }}>{text}</div>;

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },

  {
    element: <ProtectedRoute allow={["phong_dao_tao"]} />,
    children: [{ path: "/pdt", element: Dummy("Trang PĐT")() }],
  },
  {
    element: <ProtectedRoute allow={["tro_ly_khoa"]} />,
    children: [{ path: "/tlk", element: Dummy("Trang Trợ lý Khoa")() }],
  },
  {
    element: <ProtectedRoute allow={["truong_khoa"]} />,
    children: [{ path: "/tk", element: Dummy("Trang Trưởng khoa")() }],
  },
  {
    element: <ProtectedRoute allow={["giang_vien"]} />,
    children: [{ path: "/gv", element: Dummy("Trang Giảng viên")() }],
  },
  {
    element: <ProtectedRoute allow={["sinh_vien"]} />,
    children: [{ path: "/main", element: Dummy("Trang Sinh viên")() }],
  },

  { path: "*", element: Dummy("404 Not Found")() },
]);

export default router;
