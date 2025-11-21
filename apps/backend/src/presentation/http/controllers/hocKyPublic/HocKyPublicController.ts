import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { GetHocKyNienKhoaUseCase } from "../../../../application/use-cases/hocKyPublic/GetHocKyNienKhoa.usecase";
import { GetHocKyHienHanhUseCase } from "../../../../application/use-cases/hocKyPublic/GetHocKyHienHanh.usecase";
import { UpdateHocKyDatesUseCase } from "../../../../application/use-cases/hocKyPublic/UpdateHocKyDates.usecase";
import { UpdateHocKyDatesInputDTOSchema } from "../../../../application/dtos/hocKyPublic/UpdateHocKyDates.dto";

@injectable()
export class HocKyPublicController {
  constructor(
    @inject(GetHocKyNienKhoaUseCase) private getHocKyNienKhoaUseCase: GetHocKyNienKhoaUseCase,
    @inject(GetHocKyHienHanhUseCase) private getHocKyHienHanhUseCase: GetHocKyHienHanhUseCase,
    @inject(UpdateHocKyDatesUseCase) private updateHocKyDatesUseCase: UpdateHocKyDatesUseCase
  ) { }

  async getHocKyNienKhoa(req: Request, res: Response) {
    try {
      const result = await this.getHocKyNienKhoaUseCase.execute();
      return res.status(result.isSuccess ? 200 : 400).json(result);
    } catch (error: any) {
      console.error("[HocKyPublicController.getHocKyNienKhoa] Error:", error);
      return res.status(500).json({ isSuccess: false, message: "Internal server error" });
    }
  }

  async getHocKyHienHanh(req: Request, res: Response) {
    try {
      const result = await this.getHocKyHienHanhUseCase.execute();
      return res.status(result.isSuccess ? 200 : 404).json(result);
    } catch (error: any) {
      console.error("[HocKyPublicController.getHocKyHienHanh] Error:", error);
      return res.status(500).json({ isSuccess: false, message: "Internal server error" });
    }
  }

  async updateHocKyDates(req: Request, res: Response) {
    try {
      // ✅ Direct validation
      const parsed = UpdateHocKyDatesInputDTOSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          isSuccess: false,
          message: "Dữ liệu không hợp lệ",
          errors: parsed.error.flatten(),
        });
      }

      const result = await this.updateHocKyDatesUseCase.execute(parsed.data);

      return res.status(result.isSuccess ? 200 : 400).json(result);
    } catch (error: any) {
      console.error("[HocKyPublicController.updateHocKyDates] Error:", error);
      return res.status(500).json({ isSuccess: false, message: "Internal server error" });
    }
  }
}
