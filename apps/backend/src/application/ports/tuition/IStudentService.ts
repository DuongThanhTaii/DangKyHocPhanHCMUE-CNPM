 export interface StudentBasicData {
    id: string;
    ma_so_sinh_vien: string;
    email: string;
    ho_ten: string;
}

export interface IStudentService {
    getAllStudents(): Promise<StudentBasicData[]>;
    getStudentById(student_id: string): Promise<StudentBasicData | null>;
}

export const IStudentService = Symbol.for("IStudentService");
