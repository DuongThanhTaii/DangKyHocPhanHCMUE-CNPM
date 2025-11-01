import { AuthGuard } from "../components/AuthGuard";
import BaseLayout from "./BaseLayout";
import type { LayoutConfig } from "./types";
import type { PropsWithChildren } from "react";

const svConfig: LayoutConfig = {
  role: "sinh_vien",
  headerTitle: "HỆ THỐNG SINH VIÊN - TRƯỜNG ĐH SƯ PHẠM TP.HCM",
  menuItems: [
    {
      to: "ghi-danh-hoc-phan",
      label: "Đăng ký ghi danh",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path
            fill="currentColor"
            d="M320 96C284.7 96 256 124.7 256 160C256 195.3 284.7 224 320 224C355.3 224 384 195.3 384 160C384 124.7 355.3 96 320 96zM320 256C266.1 256 224 213.9 224 160C224 106.1 266.1 64 320 64C373.9 64 416 106.1 416 160C416 213.9 373.9 256 320 256zM208 352C181.5 352 160 373.5 160 400L160 448C160 483.3 188.7 512 224 512L416 512C451.3 512 480 483.3 480 448L480 400C480 373.5 458.5 352 432 352L208 352zM128 400C128 355.8 163.8 320 208 320L432 320C476.2 320 512 355.8 512 400L512 448C512 501.9 469.9 544 416 544L224 544C170.1 544 128 501.9 128 448L128 400z"
          />
        </svg>
      ),
    },
    {
      to: "dang-ky-hoc-phan",
      label: "Đăng ký học phần",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path
            fill="currentColor"
            d="M96 96C96 60.7 124.7 32 160 32L384 32C419.3 32 448 60.7 448 96L448 416C448 451.3 419.3 480 384 480L160 480C124.7 480 96 451.3 96 416L96 96z"
          />
        </svg>
      ),
    },
    {
      to: "tra-cuu-mon-hoc",
      label: "Tra cứu môn học",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path
            fill="currentColor"
            d="M416 208C416 225.7 401.7 240 384 240L288 240C270.3 240 256 225.7 256 208C256 190.3 270.3 176 288 176L384 176C401.7 176 416 190.3 416 208z"
          />
        </svg>
      ),
    },
    {
      to: "lich-su-dang-ky-hoc-phan",
      label: "Lịch sử đăng ký",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path
            fill="currentColor"
            d="M256 0C273.7 0 288 14.3 288 32L288 64L416 64L416 32C416 14.3 430.3 0 448 0C465.7 0 480 14.3 480 32L480 64L512 64C547.3 64 576 92.7 576 128L576 448C576 483.3 547.3 512 512 512L192 512C156.7 512 128 483.3 128 448L128 128C128 92.7 156.7 64 192 64L224 64L224 32C224 14.3 238.3 0 256 0z"
          />
        </svg>
      ),
    },
    {
      to: "xem-thoi-khoa-bieu",
      label: "Thời khóa biểu",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path
            fill="currentColor"
            d="M152 24C152 10.7 162.7 0 176 0C189.3 0 200 10.7 200 24L200 64L256 64L256 24C256 10.7 266.7 0 280 0C293.3 0 304 10.7 304 24L304 64L360 64L360 24C360 10.7 370.7 0 384 0C397.3 0 408 10.7 408 24L408 64L464 64L464 24C464 10.7 474.7 0 488 0C501.3 0 512 10.7 512 24L512 64L528 64C569.1 64 602.7 96.9 608 138L48 138C53.3 96.9 86.9 64 128 64L144 64L144 24C144 10.7 154.7 0 168 0C181.3 0 192 10.7 192 24L192 64L216 64L216 24C216 10.7 226.7 0 240 0C253.3 0 264 10.7 264 24L264 64L288 64L288 24C288 10.7 298.7 0 312 0C325.3 0 336 10.7 336 24L336 64L360 64L360 24C360 10.7 370.7 0 384 0C397.3 0 408 10.7 408 24L408 64L432 64L432 24C432 10.7 442.7 0 456 0C469.3 0 480 10.7 480 24L480 64L504 64L504 24C504 10.7 514.7 0 528 0C541.3 0 552 10.7 552 24L552 64L568 64C609.1 64 642.7 96.9 648 138L48 138C53.3 96.9 86.9 64 128 64L144 64L144 24C144 10.7 154.7 0 168 0C181.3 0 192 10.7 192 24z"
          />
        </svg>
      ),
    },
    {
      to: "thanh-toan-hoc-phi",
      label: "Thanh toán học phí",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path
            fill="currentColor"
            d="M144 160C144 142.3 158.3 128 176 128L464 128C481.7 128 496 142.3 496 160L496 352C496 369.7 481.7 384 464 384L176 384C158.3 384 144 369.7 144 352L144 160z"
          />
        </svg>
      ),
    },
  ],
};

export default function SVLayout({ children }: PropsWithChildren) {
  return (
    <AuthGuard requiredRole="sinh_vien">
      <BaseLayout config={svConfig}>{children}</BaseLayout>
    </AuthGuard>
  );
}
