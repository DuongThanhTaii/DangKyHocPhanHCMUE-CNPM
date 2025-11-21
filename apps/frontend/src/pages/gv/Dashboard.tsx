import React from "react";
import { useAppSelector } from "../../app/store";

export default function GiaoVienDashboard() {
  const { user } = useAppSelector((s) => s.auth);

  return (
    <div className="p-6">
      <h1 className="text-3xl text-amber-800 font-bold mb-4">
        Dashboard Giáo Viên
      </h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>
          Xin chào, <strong>{user?.ho_ten}</strong>!
        </p>
        <p>Đây là trang dashboard demo cho giáo viên.</p>
        <p>Role: {user?.loai_tai_khoan}</p>
      </div>
    </div>
  );
}
