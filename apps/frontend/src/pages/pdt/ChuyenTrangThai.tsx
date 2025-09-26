import React, { useEffect, useState } from "react";
import api from "../../utils/api";

type State = {
  dang_mo_dkhp: boolean;
  hoc_ky_hien_tai: string | null;
  nien_khoa_hien_tai: string | null;
};

export default function ChuyenTrangThai() {
  const [state, setState] = useState<State>({
    dang_mo_dkhp: false,
    hoc_ky_hien_tai: null,
    nien_khoa_hien_tai: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<State>("/pdt/system-state");
        setState(res.data);
      } catch (e) {
        // ignore demo
      }
    })();
  }, []);

  const toggleOpen = async () => {
    try {
      setLoading(true);
      setMessage(null);
      setError(null);
      const res = await api.put<State>("/pdt/system-state", {
        dang_mo_dkhp: !state.dang_mo_dkhp,
      });
      setState(res.data);
      setMessage("Cập nhật trạng thái thành công.");
    } catch (e) {
      setError("Lỗi cập nhật trạng thái");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Chuyển trạng thái hệ thống ĐKHP</h2>
      <p>
        Trạng thái hiện tại:{" "}
        <strong>
          {state.dang_mo_dkhp ? "Đang mở ĐKHP" : "Đang đóng ĐKHP"}
        </strong>
      </p>
      <button
        disabled={loading}
        onClick={toggleOpen}
        className="btn btn-primary"
      >
        {state.dang_mo_dkhp ? "Đóng ĐKHP" : "Mở ĐKHP"}
      </button>
      {message && <p className="text-success">{message}</p>}
      {error && <p className="text-error">{error}</p>}
    </div>
  );
}
