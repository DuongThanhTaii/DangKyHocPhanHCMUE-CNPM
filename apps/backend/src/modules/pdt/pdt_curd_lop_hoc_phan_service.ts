import { RequestHandler } from "express";
import { ServiceFactory } from "../../services/serviceFactory";


const serviceFactory = ServiceFactory.getInstance();
export const getHocPhansForCreateLopHandler: RequestHandler = async (req, res, next) => {
  try {
    const { hocKyId } = req.params;

    if (!hocKyId || typeof hocKyId !== "string") {
      return res.status(400).json({
        isSuccess: false,
        message: "Thiếu hoặc sai hocKyId",
        errorCode: "INVALID_INPUT",
      });
    }

    const result = await serviceFactory.hocphanService.getHocPhansForCreateLop(hocKyId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};