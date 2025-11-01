import { Router } from "express";
import authRouter from "./modules/auth/auth.router";
import forgotRouter from "./modules/auth/forgotPassword.router";
import changePassRouter from "./modules/auth/changePassword.router";
import pdtRouter from "./modules/pdt/pdt.router";
import svRouter from "./modules/sv/sv.router";
import tkRouter from "./modules/tk/tk.router";
import tlkRouter from "./modules/tlk/tlk.router";
import gvRouter from "./modules/gv/gv.router";
import dmRouter from "./modules/dm/dm.router";
import configRouter from "./modules/common/config_service";
import chinhSachTinChiRoutes from "./modules/hocphi/chinhSachTinChi.routes";
import mienGiamRoutes from "./modules/hocphi/mienGiam.routes";
import baoCaoRoutes from "./modules/baocao/baoCao.routes";
import tuitionRoutes from "./presentation/http/routes/tuition.routes";
import paymentRoutes from "./presentation/http/routes/payment.routes";

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
router.use("/dm", dmRouter);
router.use("/config", configRouter);

// ✅ Học phí routes
router.use("/chinh-sach-tin-chi", chinhSachTinChiRoutes);
router.use("/mien-giam", mienGiamRoutes);
router.use("/sv/hoc-phi", tuitionRoutes);

// ✅ Payment routes (Clean Architecture)
router.use("/payment", paymentRoutes);

// ✅ Báo cáo routes
router.use("/bao-cao", baoCaoRoutes);

export default router;
