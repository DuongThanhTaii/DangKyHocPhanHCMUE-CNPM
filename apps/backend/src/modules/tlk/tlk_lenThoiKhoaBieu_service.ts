import { Request, Response } from "express";
import { PhongHocService } from "../../services/phongHocService";
import { ThoiKhoaBieuService } from "../../services/thoiKhoaBieuService";
import { ServiceResultBuilder } from "../../types/serviceResult";

const phongHocService = new PhongHocService();
const thoiKhoaBieuService = new ThoiKhoaBieuService();

// Lấy danh sách phòng học của khoa (theo userId từ token)
export const getPhongHocByTLKHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.auth!.sub;

        const result = await phongHocService.getPhongHocByTLKUserId(userId);

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

// Xếp thời khóa biểu
export const xepThoiKhoaBieuHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.auth!.sub;
        const request = req.body;

        const result = await thoiKhoaBieuService.xepThoiKhoaBieu(userId, request);

        if (result.isSuccess) {
            return res.status(201).json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

// Lấy TKB theo mã học phần
export const getTKBByMaHocPhanHandler = async (req: Request, res: Response) => {
    try {
        const { maHocPhan, hocKyId } = req.query;

        if (!maHocPhan || !hocKyId) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu mã học phần hoặc học kỳ ID")
            );
        }

        const result = await thoiKhoaBieuService.getTKBByMaHocPhan(
            maHocPhan as string,
            hocKyId as string
        );

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(404).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

// Lấy tất cả TKB của học kỳ
export const getTKBByHocKyHandler = async (req: Request, res: Response) => {
    try {
        const { hocKyId } = req.params;

        const result = await thoiKhoaBieuService.getTKBByHocKy(hocKyId);

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

// Lấy nhiều TKB theo list mã học phần
export const getTKBByMaHocPhansHandler = async (req: Request, res: Response) => {
    try {
        const { maHocPhans, hocKyId } = req.body;

        if (!maHocPhans || !Array.isArray(maHocPhans) || !hocKyId) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu danh sách mã học phần hoặc học kỳ ID")
            );
        }

        const result = await thoiKhoaBieuService.getTKBByMaHocPhans(maHocPhans, hocKyId);

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};
