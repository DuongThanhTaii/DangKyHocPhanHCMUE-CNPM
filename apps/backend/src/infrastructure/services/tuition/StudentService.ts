import { injectable, inject } from "inversify";
import { PrismaClient } from "@prisma/client";
import { IStudentService, StudentBasicData } from "../../../application/ports/tuition/IStudentService";

@injectable()
export class StudentService implements IStudentService {
    constructor(@inject(PrismaClient) private prisma: PrismaClient) { }

    async getAllStudents(): Promise<StudentBasicData[]> {
        const students = await this.prisma.sinh_vien.findMany({
            include: {
                users: {
                    select: {
                        ho_ten: true,
                        email: true,
                    },
                },
            },
        });

        return students.map((sv: any) => ({
            id: sv.id,
            ma_so_sinh_vien: sv.ma_so_sinh_vien,
            email: sv.users.email,
            ho_ten: sv.users.ho_ten,
        }));
    }

    async getStudentById(student_id: string): Promise<StudentBasicData | null> {
        const sv = await this.prisma.sinh_vien.findUnique({
            where: { id: student_id },
            include: {
                users: {
                    select: {
                        ho_ten: true,
                        email: true,
                    },
                },
            },
        });

        if (!sv) return null;

        return {
            id: sv.id,
            ma_so_sinh_vien: sv.ma_so_sinh_vien,
            email: sv.users.email,
            ho_ten: sv.users.ho_ten,
        };
    }
}
