import { useState } from "react";
import { usePhanBoPhongHoc } from "../../features/pdt/hooks";
import KhoaList from "./components/phan-bo-phong/KhoaList";
import PhongHocList from "./components/phan-bo-phong/PhongHocList";
import ThemPhongModal from "./components/phan-bo-phong/ThemPhongModal";
import "./components/phan-bo-phong/phan-bo-phong.css";

export default function PhanBoPhongHoc() {
  const {
    khoas,
    selectedKhoaId,
    setSelectedKhoaId,
    phongHocOfKhoa,
    availablePhong,
    loadingKhoas,
    loadingPhong,
    loadingAvailable,
    submitting,
    fetchAvailablePhong,
    addPhongToKhoa,
    removePhongFromKhoa,
  } = usePhanBoPhongHoc();

  const [showThemPhongModal, setShowThemPhongModal] = useState(false);

  const handleOpenThemPhong = () => {
    fetchAvailablePhong();
    setShowThemPhongModal(true);
  };

  const handleAddPhong = async (phongIds: string[]) => {
    if (selectedKhoaId) {
      await addPhongToKhoa(selectedKhoaId, phongIds);
      setShowThemPhongModal(false);
    }
  };

  const selectedKhoa = khoas.find((k) => k.id === selectedKhoaId);

  return (
    <div className="phan-bo-phong-container">
      <div className="body__title">
        <p className="body__title-text">CHUYỂN HỌC KỲ HIỆN HÀNH</p>
      </div>

      <div className="phan-bo-phong-body">
        {/* Sidebar - Danh sách khoa */}
        <KhoaList
          khoas={khoas}
          selectedKhoaId={selectedKhoaId}
          onSelectKhoa={setSelectedKhoaId}
          loading={loadingKhoas}
        />

        {/* Main Content - Phòng học của khoa */}
        <PhongHocList
          khoa={selectedKhoa}
          phongHocs={phongHocOfKhoa}
          loading={loadingPhong}
          submitting={submitting}
          onOpenThemPhong={handleOpenThemPhong}
          onRemovePhong={(phongId) =>
            selectedKhoaId && removePhongFromKhoa(selectedKhoaId, phongId)
          }
        />
      </div>

      {/* Modal thêm phòng */}
      {showThemPhongModal && (
        <ThemPhongModal
          availablePhong={availablePhong}
          loading={loadingAvailable}
          submitting={submitting}
          onClose={() => setShowThemPhongModal(false)}
          onSubmit={handleAddPhong}
        />
      )}
    </div>
  );
}
