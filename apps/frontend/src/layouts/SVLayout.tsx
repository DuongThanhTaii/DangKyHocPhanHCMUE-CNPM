import { AuthGuard } from "../components/AuthGuard";
import BaseLayout from "./BaseLayout";
import type { LayoutConfig } from "./types";

const svConfig: LayoutConfig = {
  role: "sinh_vien",
  headerTitle: "HỆ THỐNG SINH VIÊN - TRƯỜNG ĐH SƯ PHẠM TP.HCM",
  menuItems: [
    {
      to: "dang-ky-hoc-phan",
      label: "Đăng ký học phần",
      icon: (
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
      ),
    },
    {
      to: "ghi-danh-hoc-phan",
      label: "Đăng ký ghi danh",
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
      to: "tra-cuu-mon-hoc",
      label: "Tra cứu học phần",
      icon: (
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
      ),
    },
    {
      to: "lich-su-dang-ky-hoc-phan",
      label: "Lịch sử đăng ký",
      icon: (
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
      ),
    },
    {
      to: "xem-thoi-khoa-bieu",
      label: "Xem TKB",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path
            fill="currentColor"
            d="M224 64C206.3 64 192 78.3 192 96L192 128L160 128C124.7 128 96 156.7 96 192L96 240L544 240L544 192C544 156.7 515.3 128 480 128L448 128L448 96C448 78.3 433.7 64 416 64C398.3 64 384 78.3 384 96L384 128L256 128L256 96C256 78.3 241.7 64 224 64zM96 288L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 288L96 288z"
          />
        </svg>
      ),
    },
    {
      to: "thanh-toan-hoc-phi",
      label: "Thanh toán học phí",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
    },
  ],
};

export default function SVLayout() {
  console.log("🔍 SVLayout config:", svConfig);

  return <BaseLayout config={svConfig} />;
}
