import { Router } from "express";
import authRouter from "./modules/auth/auth.router";
import pdtRouter from "./modules/pdt/pdt.router";
import svRouter from "./modules/sv/sv.router";
import tkRouter from "./modules/tk/tk.router";
import tlkRouter from "./modules/tlk/tlk.router";
import gvRouter from "./modules/gv/gv.router";
import dmRouter from "./modules/dm/dm.router";

import importRouter from "./modules/import/import.router";

const router = Router();

router.use("/auth", authRouter);
router.use("/pdt", pdtRouter); // => /api/pdt/me (chỉ PĐT truy cập)
router.use("/sv", svRouter);
router.use("/tk", tkRouter);
router.use("/tlk", tlkRouter);
router.use("/gv", gvRouter);

router.use("/dm", dmRouter);
router.use("/import", importRouter);

export default router;
