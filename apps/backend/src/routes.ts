import { Router } from "express";
import authRouter from "./modules/auth/auth.router";
import forgotRouter from "./modules/auth/forgotPassword.router";
import changePassRouter from "./modules/auth/changePassword.router";
import pdtRouter from "./modules/pdt/pdt.router";
import svRouter from "./modules/sv/sv.router";
import tkRouter from "./modules/tk/tk.router";
import tlkRouter from "./modules/tlk/tlk.router";
import gvRouter from "./modules/gv/gv.router";
import configRouter from "./modules/common/config_service";
import chinhSachTinChiRoutes from "./modules/hocphi/chinhSachTinChi.routes";
import mienGiamRoutes from "./modules/hocphi/mienGiam.routes";
import tuitionRoutes from "./presentation/http/routes/tuition.routes";
import paymentRoutes from "./presentation/http/routes/payment.routes";
import sinhVienRoutes from "./presentation/http/routes/qlSinhVienPDT/sinh-vien.routes";
import importSinhVienRoutes from "./presentation/http/routes/qlSinhVienPDT/import-sinh-vien.routes";
import hocKyPublicRoutes from "./presentation/http/routes/hocKyPublic/hoc-ky-public.routes";
// ✅ Import PDT Quan Ly Hoc Ky routes
import quanLyHocKyRoutes from "./presentation/http/routes/pdtQuanLyHocKy/quan-ly-hoc-ky.routes";
// ✅ Import BaoCao routes (Clean Architecture)
import baoCaoThongKeRoutes from "./presentation/http/routes/baoCaoThongKe/bao-cao.routes";
import danhMucRoutes from "./presentation/http/routes/dm/danh-muc.routes";
import kyPhaseRoutes from "./presentation/http/routes/pdtQuanLyPhase/ky-phase.routes";

const router = Router();

// ✅ Auth routes
router.use("/auth", authRouter);
router.use("/auth", forgotRouter);
router.use("/auth", changePassRouter);

// ✅ Module routes
router.use("/pdt", pdtRouter);
router.use("/sv", svRouter);
router.use("/tk", tkRouter);
router.use("/tlk", tlkRouter);
router.use("/gv", gvRouter);

router.use("/dm", danhMucRoutes);
router.use("/config", configRouter);

// ✅ Học phí routes
router.use("/chinh-sach-tin-chi", chinhSachTinChiRoutes);
router.use("/mien-giam", mienGiamRoutes);
router.use("/sv/hoc-phi", tuitionRoutes);

// ✅ Payment routes (Clean Architecture)
router.use("/payment", paymentRoutes);

// ⚠️ DEPRECATED - Use Clean Architecture routes instead
// router.use("/bao-cao", baoCaoRoutes);

// ✅ NEW - Mount BaoCao Thong Ke routes (Clean Architecture)
router.use("/bao-cao", baoCaoThongKeRoutes);

// ✅ NEW - Mount QL sinh viên routes
router.use("/pdt/sinh-vien", sinhVienRoutes);
router.use("/pdt/sinh-vien/import", importSinhVienRoutes);

// ✅ Mount HocKy Public routes (TRƯỚC các routes khác)
router.use("/", hocKyPublicRoutes);
// ✅ Mount PDT Quan Ly Hoc Ky routes
router.use("/pdt/quan-ly-hoc-ky", quanLyHocKyRoutes);
// ✅ Mount Ky Phase routes
router.use("/pdt/ky-phase", kyPhaseRoutes);

export default router;
