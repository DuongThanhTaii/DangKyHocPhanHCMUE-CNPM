import { injectable, inject } from "inversify";
import { PrismaClient } from "@prisma/client";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";
import { ITuitionRepository } from "../../ports/tuition/ITuitionRepository";
import { IPolicyService } from "../../ports/tuition/IPolicyService";
import { IStudentCourseService } from "../../ports/tuition/IStudentCourseService";
import { IStudentService } from "../../ports/tuition/IStudentService";
import { CalculationResultDTO } from "../../dtos/tuition/CalculationResultDTO";

@injectable()
export class CalculateTuitionForSemesterUseCase {
    constructor(
        @inject(PrismaClient) private prisma: PrismaClient,
        @inject(ITuitionRepository) private tuitionRepo: ITuitionRepository,
        @inject(IPolicyService) private policyService: IPolicyService,
        @inject(IStudentCourseService) private courseService: IStudentCourseService,
        @inject(IStudentService) private studentService: IStudentService
    ) { }

    async execute(hocKyId: string, triggeredBy: string): Promise<ServiceResult<CalculationResultDTO>> {
        try {
            console.log(`[TUITION] Starting calculation for hoc_ky_id: ${hocKyId}`);
            console.log(`[TUITION] Triggered by: ${triggeredBy}`);

            // Validate học kỳ
            const hocKy = await this.prisma.hoc_ky.findUnique({ where: { id: hocKyId } });
            if (!hocKy) {
                return ServiceResultBuilder.failure("Học kỳ không tồn tại", "HOC_KY_NOT_FOUND");
            }

            // ✅ Lấy tất cả sinh viên qua interface
            const allStudents = await this.studentService.getAllStudents();

            console.log(`[TUITION] Found ${allStudents.length} students to process`);

            const result: CalculationResultDTO = {
                totalProcessed: allStudents.length,
                successCount: 0,
                failedCount: 0,
                errors: [],
            };

            // Process từng sinh viên
            for (const student of allStudents) {
                try {
                    await this.calculateForStudent(student.id, hocKyId);
                    result.successCount++;
                } catch (error: any) {
                    result.failedCount++;
                    result.errors.push({
                        sinhVienId: student.id,
                        mssv: student.ma_so_sinh_vien,
                        error: error.message || "Unknown error",
                    });
                    console.error(`[TUITION] Failed for student ${student.ma_so_sinh_vien}:`, error.message);
                }
            }

            console.log(`[TUITION] Calculation completed:`);
            console.log(`  - Total: ${result.totalProcessed}`);
            console.log(`  - Success: ${result.successCount}`);
            console.log(`  - Failed: ${result.failedCount}`);

            return ServiceResultBuilder.success("Tính học phí hàng loạt thành công", result);
        } catch (error) {
            console.error("[TUITION] Error in execute:", error);
            return ServiceResultBuilder.failure("Lỗi khi tính học phí hàng loạt", "INTERNAL_ERROR");
        }
    }

    private async calculateForStudent(sinhVienId: string, hocKyId: string): Promise<void> {
        // Get policy
        const policy = await this.policyService.getPolicyForStudent(sinhVienId, hocKyId);
        if (!policy) {
            throw new Error("Không tìm thấy chính sách tín chỉ cho sinh viên");
        }

        // Get registered courses
        const courses = await this.courseService.getRegisteredCourses(sinhVienId, hocKyId);

        // Calculate tuition
        let tongHocPhi = 0;
        const details = courses.map((course: { lop_hoc_phan_id: string; so_tin_chi: number }) => {
            const thanhTien = course.so_tin_chi * policy.phi_moi_tin_chi;
            tongHocPhi += thanhTien;
            return {
                lop_hoc_phan_id: course.lop_hoc_phan_id,
                so_tin_chi: course.so_tin_chi,
                phi_tin_chi: policy.phi_moi_tin_chi,
                thanh_tien: thanhTien,
            };
        });

        // Check if tuition already exists
        const existing = await this.tuitionRepo.findBySinhVienAndHocKy(sinhVienId, hocKyId);

        if (existing) {
            // Recalculate
            await this.tuitionRepo.updateTuition({
                sinh_vien_id: sinhVienId,
                hoc_ky_id: hocKyId,
                tong_hoc_phi: tongHocPhi,
                chinh_sach_id: policy.id,
                details,
            });
        } else {
            // Create new
            await this.tuitionRepo.saveTuition({
                sinh_vien_id: sinhVienId,
                hoc_ky_id: hocKyId,
                tong_hoc_phi: tongHocPhi,
                chinh_sach_id: policy.id,
                details,
            });
        }
    }
}
