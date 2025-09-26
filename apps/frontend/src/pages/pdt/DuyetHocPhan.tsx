import React, { useEffect, useState } from "react";
import api from "../../utils/api";

type HP = {
  id: string;
  ma_hp: string;
  ten_hp: string;
  ten_khoa: string;
  so_tin_chi: number;
};

export default function DuyetHocPhan() {
  const [items, setItems] = useState<HP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<HP[]>("/pdt/hoc-phan-cho-duyet");
        setItems(res.data);
      } catch (e) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleApprove = async (id: string) => {
    await api.post(`/pdt/duyet/${id}`);
    setItems((arr) => arr.filter((x) => x.id !== id));
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="card">
      <h2>Duyệt danh sách học phần</h2>
      {items.length === 0 ? (
        <p>Không có học phần chờ duyệt.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Mã HP</th>
              <th>Tên học phần</th>
              <th>Khoa</th>
              <th>Tín chỉ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((hp) => (
              <tr key={hp.id}>
                <td>{hp.ma_hp}</td>
                <td>{hp.ten_hp}</td>
                <td>{hp.ten_khoa}</td>
                <td>{hp.so_tin_chi}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleApprove(hp.id)}
                  >
                    Duyệt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
