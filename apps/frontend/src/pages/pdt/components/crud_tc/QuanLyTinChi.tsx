import React, { useEffect, useMemo, useState } from "react";
import "../../../../styles/reset.css";
import "../../../../styles/menu.css";
import { useModalContext } from "../../../../hook/ModalContext";
import {
  useChinhSachTinChi,
  useDanhSachKhoa,
  useDanhSachNganh,
  useTinhHocPhiHangLoat,
} from "../../../../features/pdt/hooks";
import type { HocKyItemDTO } from "../../../../features/common/types";
import {
  useHocKyNienKhoa,
  useHocKyHienHanh,
} from "../../../../features/common/hooks";
const formatCurrency = (v: number) =>
  (isFinite(v) ? v : 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export default function QuanLyTinChi() {
  const { openNotify, openConfirm } = useModalContext();

  // ========= Custom Hooks =========
  const {
    data: chinhSachs,
    loading: loadingCS,
    createChinhSach,
    updateChinhSach,
  } = useChinhSachTinChi();
  const { data: khoas, loading: loadingKhoa } = useDanhSachKhoa();
  const { data: hocKyNienKhoas, loading: loadingHocKy } = useHocKyNienKhoa();
  const { data: hocKyHienHanh, loading: loadingHocKyHienHanh } =
    useHocKyHienHanh();
  const { tinhHocPhi, loading: calculatingFee } = useTinhHocPhiHangLoat(); // ✅ Add

  // ========= State =========
  const [selectedNienKhoa, setSelectedNienKhoa] = useState<string>("");
  const [selectedKhoaId, setSelectedKhoaId] = useState("");
  const [form, setForm] = useState({
    hocKyId: "",
    khoaId: "",
    nganhId: "",
    phiMoiTinChi: "",
  });

  // ✅ State for editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  // ========= Computed - Flatten học kỳ =========
  const nienKhoas = useMemo(
    () => Array.from(new Set(hocKyNienKhoas.map((nk) => nk.tenNienKhoa))),
    [hocKyNienKhoas]
  );

  const flatHocKys = useMemo(() => {
    const result: (HocKyItemDTO & { tenNienKhoa: string })[] = [];

    hocKyNienKhoas.forEach((nienKhoa) => {
      nienKhoa.hocKy.forEach((hk) => {
        result.push({
          ...hk,
          tenNienKhoa: nienKhoa.tenNienKhoa,
        });
      });
    });

    return result;
  }, [hocKyNienKhoas]);

  const hocKysBySelectedNK = useMemo(
    () => flatHocKys.filter((hk) => hk.tenNienKhoa === selectedNienKhoa),
    [flatHocKys, selectedNienKhoa]
  );

  // ========= ✅ Fetch Ngành theo Khoa VÀ HocKyId =========
  const { data: nganhs } = useDanhSachNganh(form.hocKyId, selectedKhoaId);

  // ========= Auto-select học kỳ hiện hành =========
  useEffect(() => {
    // ✅ Đợi cả 2 APIs load xong
    if (loadingHocKy || loadingHocKyHienHanh) return;

    // ✅ Chỉ auto-select 1 lần (khi form.hocKyId còn trống)
    if (form.hocKyId) return;

    // ✅ Cần cả 2 data
    if (!hocKyHienHanh || flatHocKys.length === 0) return;

    console.log(
      "✅ [QuanLyTinChi] Auto-selecting học kỳ hiện hành:",
      hocKyHienHanh
    );
    console.log("✅ [QuanLyTinChi] Flat học kỳ:", flatHocKys);

    // ✅ Tìm học kỳ trong flatHocKys
    const foundHocKy = flatHocKys.find((hk) => hk.id === hocKyHienHanh.id);

    if (foundHocKy) {
      console.log("✅ [QuanLyTinChi] Found học kỳ:", foundHocKy);

      setSelectedNienKhoa(foundHocKy.tenNienKhoa);
      setForm((f) => ({ ...f, hocKyId: foundHocKy.id }));

      console.log("✅ [QuanLyTinChi] Auto-selected:", {
        nienKhoa: foundHocKy.tenNienKhoa,
        hocKyId: foundHocKy.id,
      });
    } else {
      console.warn("⚠️ [QuanLyTinChi] Không tìm thấy học kỳ trong flatHocKys");
    }
  }, [
    hocKyHienHanh,
    flatHocKys,
    loadingHocKy,
    loadingHocKyHienHanh,
    form.hocKyId,
  ]);

  // ========= Reset ngành khi đổi khoa hoặc học kỳ =========
  useEffect(() => {
    setForm((f) => ({ ...f, nganhId: "" }));
  }, [selectedKhoaId, form.hocKyId]);

  // ========= Submit Form =========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.hocKyId) {
      openNotify({
        message: "Vui lòng chọn 'Niên khóa' và 'Học kỳ áp dụng'",
        type: "warning",
      });
      return;
    }

    if (!form.phiMoiTinChi) {
      openNotify({
        message: "Vui lòng nhập 'Phí mỗi tín chỉ'",
        type: "warning",
      });
      return;
    }

    const confirmed = await openConfirm({
      message: "Bạn chắc chắn muốn lưu chính sách này?",
      confirmText: "Lưu",
      cancelText: "Hủy",
    });

    if (!confirmed) return;

    const success = await createChinhSach({
      hocKyId: form.hocKyId,
      khoaId: form.khoaId || null,
      nganhId: form.nganhId || null,
      phiMoiTinChi: Number(form.phiMoiTinChi),
    });

    if (success) {
      setForm({
        hocKyId: "",
        khoaId: "",
        nganhId: "",
        phiMoiTinChi: "",
      });
      setSelectedNienKhoa("");
      setSelectedKhoaId("");
    }
  };

  // ✅ Handle edit
  const handleStartEdit = (id: string, currentValue: number) => {
    setEditingId(id);
    setEditingValue(currentValue.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const handleSaveEdit = async (id: string) => {
    const phiMoiTinChi = Number(editingValue);

    if (isNaN(phiMoiTinChi) || phiMoiTinChi < 0) {
      openNotify({ message: "Vui lòng nhập số tiền hợp lệ", type: "warning" });
      return;
    }

    const confirmed = await openConfirm({
      message: `Bạn chắc chắn muốn cập nhật phí thành ${formatCurrency(
        phiMoiTinChi
      )}?`,
      confirmText: "Cập nhật",
      cancelText: "Hủy",
    });

    if (!confirmed) return;

    const success = await updateChinhSach(id, phiMoiTinChi);

    if (success) {
      setEditingId(null);
      setEditingValue("");
    }
  };

  // ✅ Handle tính học phí hàng loạt
  const handleTinhHocPhi = async () => {
    if (!form.hocKyId) {
      openNotify({
        message: "Vui lòng chọn học kỳ trước khi tính học phí",
        type: "warning",
      });
      return;
    }

    const confirmed = await openConfirm({
      message: `Bạn chắc chắn muốn tính học phí hàng loạt cho học kỳ này?\n\nHệ thống sẽ tính toán học phí cho tất cả sinh viên đã đăng ký trong học kỳ.`,
      confirmText: "Tính học phí",
      cancelText: "Hủy",
    });

    if (!confirmed) return;

    await tinhHocPhi(form.hocKyId);
  };

  const loading =
    loadingCS || loadingKhoa || loadingHocKy || loadingHocKyHienHanh;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Quản lý chính sách tín chỉ</h2>

      {/* ✅ Show loading state */}
      {loading && (
        <p style={{ textAlign: "center", padding: 20 }}>Đang tải dữ liệu...</p>
      )}

      {!loading && (
        <>
          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="df"
            style={{
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            {/* Niên khóa */}
            <select
              value={selectedNienKhoa}
              onChange={(e) => {
                setSelectedNienKhoa(e.target.value);
                setForm((f) => ({ ...f, hocKyId: "" }));
              }}
            >
              <option value="">-- Chọn niên khóa --</option>
              {nienKhoas.map((nk) => (
                <option key={nk} value={nk}>
                  {nk}
                </option>
              ))}
            </select>

            {/* Học kỳ */}
            <select
              value={form.hocKyId}
              onChange={(e) =>
                setForm((f) => ({ ...f, hocKyId: e.target.value }))
              }
              disabled={!selectedNienKhoa}
            >
              <option value="">-- Học kỳ áp dụng --</option>
              {hocKysBySelectedNK.map((hk) => (
                <option key={hk.id} value={hk.id}>
                  {hk.tenHocKy}
                </option>
              ))}
            </select>

            {/* Khoa */}
            <select
              value={form.khoaId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedKhoaId(val);
                setForm((f) => ({ ...f, khoaId: val, nganhId: "" }));
              }}
              disabled={!form.hocKyId} // ✅ Disable if no hocKyId
            >
              <option value="">-- Áp dụng cho khoa (tùy chọn) --</option>
              {khoas.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.tenKhoa}
                </option>
              ))}
            </select>

            {/* Ngành */}
            <select
              value={form.nganhId}
              onChange={(e) =>
                setForm((f) => ({ ...f, nganhId: e.target.value }))
              }
              disabled={!form.khoaId || !form.hocKyId} // ✅ Disable if no hocKyId or khoaId
            >
              <option value="">-- Áp dụng cho ngành (tùy chọn) --</option>
              {nganhs.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.tenNganh}
                </option>
              ))}
            </select>

            {/* Đơn giá */}
            <input
              type="number"
              min={0}
              step={1000}
              placeholder="Phí mỗi tín chỉ (VND)"
              value={form.phiMoiTinChi}
              onChange={(e) =>
                setForm((f) => ({ ...f, phiMoiTinChi: e.target.value }))
              }
            />

            <button type="submit" className="btn__chung" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu chính sách"}
            </button>
          </form>

          {/* ✅ HEADER - Nút tính học phí (Option B) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: "2px solid #e5e7eb",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
              Danh sách chính sách tín chỉ
            </h3>

            <button
              type="button"
              onClick={handleTinhHocPhi}
              disabled={calculatingFee || !form.hocKyId}
              className="btn__chung"
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              {calculatingFee ? "Đang tính..." : "⚡ Tính học phí hàng loạt"}
            </button>
          </div>

          {/* BẢNG DANH SÁCH */}
          <table className="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Học kỳ</th>
                <th>Khoa</th>
                <th>Ngành</th>
                <th>Phí / tín chỉ</th>
                <th>Hiệu lực</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {chinhSachs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 20 }}>
                    Chưa có chính sách
                  </td>
                </tr>
              ) : (
                chinhSachs.map((d, i) => (
                  <tr key={d.id}>
                    <td>{i + 1}</td>
                    <td>{d.hocKy?.tenHocKy || "-"}</td>
                    <td>{d.khoa?.tenKhoa || "-"}</td>
                    <td>{d.nganhHoc?.tenNganh || "-"}</td>

                    {/* ✅ Editable cell */}
                    <td>
                      {editingId === d.id ? (
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          style={{
                            width: "120px",
                            padding: "4px 8px",
                            border: "1px solid #0c4874",
                            borderRadius: "4px",
                          }}
                          autoFocus
                        />
                      ) : (
                        formatCurrency(d.phiMoiTinChi)
                      )}
                    </td>

                    <td>
                      {d.ngayHieuLuc
                        ? new Date(d.ngayHieuLuc).toLocaleDateString("vi-VN")
                        : "-"}
                      {" → "}
                      {d.ngayHetHieuLuc
                        ? new Date(d.ngayHetHieuLuc).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>

                    {/* ✅ Action buttons */}
                    <td>
                      {editingId === d.id ? (
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            className="btn__chung"
                            onClick={() => handleSaveEdit(d.id)}
                            style={{ padding: "4px 12px", fontSize: "13px" }}
                          >
                            💾 Lưu
                          </button>
                          <button
                            className="btn__cancel"
                            onClick={handleCancelEdit}
                            style={{ padding: "4px 12px", fontSize: "13px" }}
                          >
                            ✕ Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn__chung"
                          onClick={() => handleStartEdit(d.id, d.phiMoiTinChi)}
                          style={{ padding: "4px 12px", fontSize: "13px" }}
                        >
                          ✏️ Chỉnh sửa
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
