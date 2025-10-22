import { AuthGuard } from "../components/AuthGuard";
import BaseLayout from "./BaseLayout";
import type { LayoutConfig } from "./types";
import type { PropsWithChildren } from "react";

const troLyKhoaConfig: LayoutConfig = {
  role: "tro_ly_khoa",
  headerTitle: "TRƯỜNG ĐẠI HỌC SƯ PHẠM THÀNH PHỐ HỒ CHÍ MINH",
  menuItems: [
    {
      to: "len-danh-sach-hoc-phan",
      label: "Lên danh sách học phần",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="21"
          viewBox="0 0 20 21"
          fill="none"
        >
          <path
            d="M14.1667 7.12669H12.5V5.46002C12.5 4.53502 11.75 3.79335 10.8333 3.79335H9.16667C8.25 3.79335 7.5 4.54335 7.5 5.46002V7.12669H5.83333C4.91667 7.12669 4.16667 7.87669 4.16667 8.79335V15.9601C4.16667 16.8767 4.91667 17.6267 5.83333 17.6267H14.1667C15.0833 17.6267 15.8333 16.8767 15.8333 15.9601V8.79335C15.8333 7.87669 15.0833 7.12669 14.1667 7.12669ZM9.16667 5.46002H10.8333V7.12669H9.16667V5.46002ZM14.1667 15.96H5.83333V8.79335H7.5V10.46H9.16667V8.79335H10.8333V10.46H12.5V8.79335H14.1667V15.96Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      to: "duyet-hoc-phan",
      label: "Duyệt danh sách học phần",
      icon: (
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
      ),
    },
    {
      to: "tao-lop-hoc-phan",
      label: "Tạo lớp học phần",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path
            fill="currentColor"
            d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM232 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"
          />
        </svg>
      ),
    },
  ],
};

export default function TroLyKhoaLayout({ children }: PropsWithChildren) {
  return (
    <AuthGuard requiredRole="tro_ly_khoa">
      <BaseLayout config={troLyKhoaConfig}>{children}</BaseLayout>
    </AuthGuard>
  );
}
