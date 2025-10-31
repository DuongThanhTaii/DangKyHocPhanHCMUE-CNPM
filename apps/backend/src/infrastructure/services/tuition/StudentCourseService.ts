import { injectable, inject } from "inversify";
import { PrismaClient } from "@prisma/client";
import {
    IStudentCourseService,
    CourseRegistrationData,
} from "../../../application/ports/tuition/IStudentCourseService";

@injectable()
export class StudentCourseService implements IStudentCourseService {
    constructor(@inject(PrismaClient) private prisma: PrismaClient) { }

    async getRegisteredCourses(sinh_vien_id: string, hoc_ky_id: string): Promise<CourseRegistrationData[]> {
        const registrations = await this.prisma.dang_ky_hoc_phan.findMany({
            where: {
                sinh_vien_id,
                lop_hoc_phan: {
                    hoc_phan: {
                        id_hoc_ky: hoc_ky_id,
                    },
                },
                trang_thai: "da_dang_ky",
            },
            include: {
                lop_hoc_phan: {
                    include: {
                        hoc_phan: {
                            include: {
                                mon_hoc: true,
                            },
                        },
                    },
                },
            },
        });

        return registrations.map((reg: any) => ({
            lop_hoc_phan_id: reg.lop_hoc_phan_id,
            so_tin_chi: reg.lop_hoc_phan.hoc_phan.mon_hoc.so_tin_chi,
        }));
    }
}
