export interface CourseRegistrationData {
    lop_hoc_phan_id: string;
    so_tin_chi: number;
}

export interface IStudentCourseService {
    getRegisteredCourses(sinh_vien_id: string, hoc_ky_id: string): Promise<CourseRegistrationData[]>;
}

export const IStudentCourseService = Symbol.for("IStudentCourseService");
