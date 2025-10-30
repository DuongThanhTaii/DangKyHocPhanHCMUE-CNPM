import { Router } from "express";
import authRouter from "./modules/auth/auth.router";
import pdtRouter from "./modules/pdt/pdt.router";
import svRouter from "./modules/sv/sv.router";
import tkRouter from "./modules/tk/tk.router";
import tlkRouter from "./modules/tlk/tlk.router";
import gvRouter from "./modules/gv/gv.router";
import dmRouter from "./modules/dm/dm.router";
import configRouter from "./modules/common/config_service";
import importRouter from "./modules/import/import.router";
import hocPhiRoutes from "./modules/hocphi/hocPhi.routes";
import chinhSachTinChiRoutes from "./modules/hocphi/chinhSachTinChi.routes";
import mienGiamRoutes from "./modules/hocphi/mienGiam.routes";
import baoCaoRoutes from "./modules/baocao/baoCao.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/pdt", pdtRouter); // => /api/pdt/me (chỉ PĐT truy cập)
router.use("/sv", svRouter);
router.use("/tk", tkRouter);
router.use("/tlk", tlkRouter);
router.use("/gv", gvRouter);
router.use("/config", configRouter);
router.use("/dm", dmRouter);

router.use("/import", importRouter);

router.use("/hoc-phi", hocPhiRoutes);
router.use("/chinh-sach-tin-chi", chinhSachTinChiRoutes);
router.use("/mien-giam", mienGiamRoutes);

router.use("/bao-cao", baoCaoRoutes);
export default router;
