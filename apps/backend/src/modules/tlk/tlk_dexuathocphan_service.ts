import { RequestHandler } from "express";
import { ServiceFactory } from "../../services/serviceFactory";

const serviceFactory = ServiceFactory.getInstance();

export const createDeXuatHocPhanHandler: RequestHandler = async (req, res, next) => {
    try {
        const request = req.body;
        const userId = req.auth!.sub;
        const loaiTaiKhoan = req.auth!.role;

        console.log(`User ${userId} với loại TK: ${loaiTaiKhoan}`);

        const result = await serviceFactory.deXuatHocPhanService.createDeXuatHocPhan(
            request,
            userId,
            loaiTaiKhoan
        );

        const statusCode = result.isSuccess ? 201 : 400;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};