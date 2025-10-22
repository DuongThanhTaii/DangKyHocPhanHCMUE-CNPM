import { Router, RequestHandler } from "express";
import { TIET_HOC_CONFIG } from "../../constants/thoiKhoaBieu";

const router = Router();

/**
 * GET /api/config/tiet-hoc
 * Lấy config tiết học của trường
 */
export const getTietHocConfigHandler: RequestHandler = async (req, res) => {
    res.json({
        isSuccess: true,
        message: "Lấy config tiết học thành công",
        data: TIET_HOC_CONFIG,
    });
};

router.get("/tiet-hoc", getTietHocConfigHandler);

export default router;