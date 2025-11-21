import { injectable, inject } from "inversify";
import { PrismaClient } from "@prisma/client";
import { IPaymentValidationService } from "../../../application/ports/payment/IPaymentValidationService";

@injectable()
export class PaymentValidationService implements IPaymentValidationService {
    constructor(@inject(PrismaClient) private prisma: PrismaClient) { }

    async checkAlreadyPaid(sinh_vien_id: string, hoc_ky_id: string): Promise<boolean> {
        const hocPhi = await this.prisma.hoc_phi.findUnique({
            where: {
                sinh_vien_id_hoc_ky_id: { sinh_vien_id, hoc_ky_id },
            },
        });

        return hocPhi?.trang_thai_thanh_toan === "da_thanh_toan";
    }

    async validateAmount(sinh_vien_id: string, hoc_ky_id: string, amount: number): Promise<boolean> {
        const hocPhi = await this.prisma.hoc_phi.findUnique({
            where: {
                sinh_vien_id_hoc_ky_id: { sinh_vien_id, hoc_ky_id },
            },
        });

        if (!hocPhi) return false;

        const expectedAmount = parseFloat(hocPhi.tong_hoc_phi?.toString() || "0");
        return Math.abs(expectedAmount - amount) < 0.01; // Tolerance for floating point
    }

    async getTuitionAmount(sinhVienId: string, hocKyId: string): Promise<{ tong_hoc_phi: number; trang_thai_thanh_toan: string } | null> {
        const hocPhi = await this.prisma.hoc_phi.findUnique({
            where: {
                sinh_vien_id_hoc_ky_id: {
                    sinh_vien_id: sinhVienId,
                    hoc_ky_id: hocKyId,
                },
            },
        });

        if (!hocPhi) return null;

        return {
            tong_hoc_phi: parseFloat(hocPhi.tong_hoc_phi?.toString() || "0"),
            trang_thai_thanh_toan: hocPhi.trang_thai_thanh_toan || "chua_thanh_toan",
        };
    }
}
