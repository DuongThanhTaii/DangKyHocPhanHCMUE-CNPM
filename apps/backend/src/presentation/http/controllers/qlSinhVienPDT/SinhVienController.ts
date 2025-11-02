import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { CreateSinhVienUseCase } from "../../../../application/use-cases/qlSinhVienPDT/crud/CreateSinhVien.usecase";
import { ListSinhVienUseCase } from "../../../../application/use-cases/qlSinhVienPDT/crud/ListSinhVien.usecase";
import { GetSinhVienDetailUseCase } from "../../../../application/use-cases/qlSinhVienPDT/crud/GetSinhVienDetail.usecase";
import { UpdateSinhVienUseCase } from "../../../../application/use-cases/qlSinhVienPDT/crud/UpdateSinhVien.usecase";
import { DeleteSinhVienUseCase } from "../../../../application/use-cases/qlSinhVienPDT/crud/DeleteSinhVien.usecase";
import { CreateSinhVienSchema } from "../../../../application/dtos/qlSinhVienPDT/crud/CreateSinhVien.dto";
import { UpdateSinhVienSchema } from "../../../../application/dtos/qlSinhVienPDT/crud/UpdateSinhVien.dto";

@injectable()
export class SinhVienController {
    constructor(
        @inject(CreateSinhVienUseCase) private createUseCase: CreateSinhVienUseCase,
        @inject(ListSinhVienUseCase) private listUseCase: ListSinhVienUseCase,
        @inject(GetSinhVienDetailUseCase) private detailUseCase: GetSinhVienDetailUseCase,
        @inject(UpdateSinhVienUseCase) private updateUseCase: UpdateSinhVienUseCase,
        @inject(DeleteSinhVienUseCase) private deleteUseCase: DeleteSinhVienUseCase
    ) { }

    async list(req: Request, res: Response) {
        try {
            const page = parseInt(String(req.query.page || "1"), 10);
            const pageSize = parseInt(String(req.query.pageSize || "20"), 10);
            const search = req.query.search ? String(req.query.search) : undefined;

            const result = await this.listUseCase.execute({ page, pageSize, search });

            return res.status(result.isSuccess ? 200 : 400).json(result);
        } catch (error: any) {
            console.error("[SinhVienController.list] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }

    async getDetail(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await this.detailUseCase.execute(id);

            return res.status(result.isSuccess ? 200 : 404).json(result);
        } catch (error: any) {
            console.error("[SinhVienController.getDetail] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const parsed = CreateSinhVienSchema.safeParse(req.body);

            if (!parsed.success) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Dữ liệu không hợp lệ",
                    errors: parsed.error.flatten(),
                });
            }

            const result = await this.createUseCase.execute(parsed.data);

            return res.status(result.isSuccess ? 201 : 400).json(result);
        } catch (error: any) {
            console.error("[SinhVienController.create] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const parsed = UpdateSinhVienSchema.safeParse(req.body);

            if (!parsed.success) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Dữ liệu không hợp lệ",
                    errors: parsed.error.flatten(),
                });
            }

            const result = await this.updateUseCase.execute(id, parsed.data);

            return res.status(result.isSuccess ? 200 : 400).json(result);
        } catch (error: any) {
            console.error("[SinhVienController.update] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await this.deleteUseCase.execute(id);

            return res.status(result.isSuccess ? 200 : 404).json(result);
        } catch (error: any) {
            console.error("[SinhVienController.delete] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }
}
