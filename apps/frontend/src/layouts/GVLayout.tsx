import { AuthGuard } from "../components/AuthGuard";
import BaseLayout from "./BaseLayout";
import type { LayoutConfig } from "./types";
import type { PropsWithChildren } from "react";

const gvConfig: LayoutConfig = {
  role: "giang_vien",
  headerTitle: "HỆ THỐNG GIẢNG VIÊN - TRƯỜNG ĐH SƯ PHẠM TP.HCM",
  menuItems: [
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
  ],
};

export default function GVLayout({ children }: PropsWithChildren) {
  return (
    <AuthGuard requiredRole="giang_vien">
      <BaseLayout config={gvConfig}>{children}</BaseLayout>
    </AuthGuard>
  );
}
