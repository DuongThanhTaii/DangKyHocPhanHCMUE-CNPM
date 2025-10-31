import { injectable, inject } from "inversify";
import { PrismaClient } from "@prisma/client";
import { IPolicyService, PolicyData } from "../../../application/ports/tuition/IPolicyService";

@injectable()
export class PolicyService implements IPolicyService {
    constructor(@inject(PrismaClient) private prisma: PrismaClient) { }

    async getPolicyForStudent(sinh_vien_id: string, hoc_ky_id: string): Promise<PolicyData | null> {
        // Get student info
        const sv = await this.prisma.sinh_vien.findUnique({
            where: { id: sinh_vien_id },
            select: { nganh_id: true },
        });

        if (!sv || !sv.nganh_id) {
            return null;
        }

        // Find policy by nganh_id + hoc_ky_id
        const policy = await this.prisma.chinh_sach_tin_chi.findFirst({
            where: {
                nganh_id: sv.nganh_id,
                hoc_ky_id,
            },
        });

        if (!policy) {
            return null;
        }

        return {
            id: policy.id,
            phi_moi_tin_chi: parseFloat(policy.phi_moi_tin_chi.toString()),
        };
    }
}
