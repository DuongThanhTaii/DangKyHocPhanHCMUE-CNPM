import { AuthGuard } from "../components/AuthGuard";
import BaseLayout from "./BaseLayout";
import type { LayoutConfig } from "./types";
import type { PropsWithChildren } from "react";

const gvConfig: LayoutConfig = {
  role: "giang_vien",
  headerTitle: "HỆ THỐNG GIẢNG VIÊN - TRƯỜNG ĐH SƯ PHẠM TP.HCM",
  menuItems: [
    {
      to: "dashboard",
      label: "Trang chủ",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
      ),
    },
    {
      to: "lop-hoc-phan",
      label: "Quản lý lớp học",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6L23 9l-11-6zM6.5 12.5l5.5 3 5.5-3-5.5-3-5.5 3z" />
        </svg>
      ),
    },
    {
      to: "diem-danh",
      label: "Điểm danh",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      ),
    },
    {
      to: "nhap-diem",
      label: "Nhập điểm",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      ),
    },
    {
      to: "thoi-khoa-bieu",
      label: "Thời khóa biểu",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z" />
        </svg>
      ),
    },
    {
      to: "bao-cao",
      label: "Báo cáo",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M3,3H21A1,1 0 0,1 22,4V20A1,1 0 0,1 21,21H3A1,1 0 0,1 2,20V4A1,1 0 0,1 3,3M4,5V19H20V5H4M6,7H18V9H6V7M6,11H18V13H6V11M6,15H13V17H6V15Z" />
        </svg>
      ),
    },
  ],
};

export default function GVLayout({ children }: PropsWithChildren) {
  return (
    <AuthGuard requiredRole="giang_vien">
      <BaseLayout config={gvConfig}>{children}</BaseLayout>
    </AuthGuard>
  );
}
