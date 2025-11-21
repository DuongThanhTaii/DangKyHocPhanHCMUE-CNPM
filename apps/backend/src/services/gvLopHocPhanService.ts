import { UnitOfWork } from "../repositories/unitOfWork";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";
import { StudentOfLHPDTO } from "../dtos/gvLopHocPhanDTO";
import { S3Service } from "./external/s3Service";

export class GvLopHocPhanService {
  private uow = UnitOfWork.getInstance();
  private s3Service = new S3Service();

  /**
   * Lấy danh sách lớp học phần của giảng viên
   */
  async getMyLopHocPhan(gvUserId: string, hocKyId?: string): Promise<ServiceResult<any[]>> {
    try {
      const lopHocPhans = await this.uow.lopHocPhanRepository.findByGiangVienAndHocKy(
        gvUserId,
        hocKyId
      );

      // ✅ Fix: Map ten_hoc_phan từ mon_hoc
      const data = lopHocPhans.map((lop: any) => ({
        ...lop,
        hoc_phan: {
          ...lop.hoc_phan,
          ten_hoc_phan: lop.hoc_phan.mon_hoc.ten_mon, // ✅ Override với tên thực
        },
      }));

      return ServiceResultBuilder.success(
        "Lấy danh sách lớp học phần thành công",
        data
      );
    } catch (error) {
      console.error("Error getting lop hoc phan:", error);
      return ServiceResultBuilder.failure(
        "Lỗi khi lấy danh sách lớp học phần",
        "INTERNAL_ERROR"
      );
    }
  }

  /**
   * Lấy chi tiết lớp học phần
   */
  async getLopHocPhanDetail(lhpId: string, gvUserId: string): Promise<ServiceResult<any>> {
    try {
      const lhp = await this.uow.lopHocPhanRepository.findById(lhpId);

      if (!lhp) {
        return ServiceResultBuilder.failure("Lớp học phần không tồn tại", "LHP_NOT_FOUND");
      }

      if (lhp.giang_vien_id !== gvUserId) {
        return ServiceResultBuilder.failure(
          "Bạn không có quyền truy cập lớp học phần này",
          "FORBIDDEN"
        );
      }

      const detail = await this.uow.lopHocPhanRepository.detail(lhpId);

      return ServiceResultBuilder.success("Lấy chi tiết lớp học phần thành công", detail);
    } catch (error) {
      console.error("Error getting lop hoc phan detail:", error);
      return ServiceResultBuilder.failure(
        "Lỗi khi lấy chi tiết lớp học phần",
        "INTERNAL_ERROR"
      );
    }
  }

  /**
   * Lấy danh sách sinh viên đăng ký lớp
   */
  async getStudentsOfLHP(lhpId: string, gvUserId: string): Promise<ServiceResult<StudentOfLHPDTO[]>> {
    try {
      const lhp = await this.uow.lopHocPhanRepository.findById(lhpId);

      if (!lhp) {
        return ServiceResultBuilder.failure("Lớp học phần không tồn tại", "LHP_NOT_FOUND");
      }

      if (lhp.giang_vien_id !== gvUserId) {
        return ServiceResultBuilder.failure(
          "Bạn không có quyền truy cập lớp học phần này",
          "FORBIDDEN"
        );
      }

      const students = await this.uow.lopHocPhanRepository.studentsOfLHP(lhpId);

      return ServiceResultBuilder.success(
        "Lấy danh sách sinh viên thành công",
        students
      );
    } catch (error) {
      console.error("Error getting students:", error);
      return ServiceResultBuilder.failure(
        "Lỗi khi lấy danh sách sinh viên",
        "INTERNAL_ERROR"
      );
    }
  }

  /**
   * Lấy danh sách tài liệu
   */
  async getDocuments(lhpId: string, gvUserId: string): Promise<ServiceResult<any[]>> {
    try {
      const lhp = await this.uow.lopHocPhanRepository.findById(lhpId);

      if (!lhp) {
        return ServiceResultBuilder.failure("Lớp học phần không tồn tại", "LHP_NOT_FOUND");
      }

      if (lhp.giang_vien_id !== gvUserId) {
        return ServiceResultBuilder.failure("Không có quyền truy cập", "FORBIDDEN");
      }

      const documents = await this.uow.taiLieuRepository.findByLopHocPhanId(lhpId);

      return ServiceResultBuilder.success("Lấy danh sách tài liệu thành công", documents);
    } catch (error) {
      console.error("Error getting documents:", error);
      return ServiceResultBuilder.failure(
        "Lỗi khi lấy danh sách tài liệu",
        "INTERNAL_ERROR"
      );
    }
  }

  /**
   * Upload tài liệu lên S3 và save metadata vào DB
   */
  async uploadDocument(
    lhpId: string,
    gvUserId: string,
    file: Express.Multer.File,
    tenTaiLieu: string
  ): Promise<ServiceResult<any>> {
    try {
      // Validation
      if (!file) {
        return ServiceResultBuilder.failure("Không có file được upload", "FILE_REQUIRED");
      }

      // Check file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        return ServiceResultBuilder.failure(
          "File vượt quá giới hạn 100MB",
          "FILE_TOO_LARGE"
        );
      }

      // Check lớp học phần
      const lhp = await this.uow.lopHocPhanRepository.findById(lhpId);
      if (!lhp) {
        return ServiceResultBuilder.failure("Lớp học phần không tồn tại", "LHP_NOT_FOUND");
      }

      if (lhp.giang_vien_id !== gvUserId) {
        return ServiceResultBuilder.failure("Không có quyền truy cập", "FORBIDDEN");
      }

      // Lấy thông tin học phần để tạo folder trên S3
      const detail = await this.uow.lopHocPhanRepository.detail(lhpId);
      const maHocPhan = detail?.hoc_phan?.mon_hoc?.ma_mon || "UNKNOWN";
      const maLop = lhp.ma_lop;

      // Upload lên S3
      const { s3Key, fileUrl } = await this.s3Service.uploadFile({
        maHocPhan,
        maLop,
        file,
      });

      // Save metadata vào DB using repository
      const document = await this.uow.taiLieuRepository.createDocument({
        lop_hoc_phan_id: lhpId,
        ten_tai_lieu: tenTaiLieu || file.originalname,
        file_path: s3Key,
        file_type: file.mimetype,
        uploaded_by: gvUserId,
      });

      return ServiceResultBuilder.success("Upload tài liệu thành công", {
        id: document.id,
        tenTaiLieu: document.ten_tai_lieu,
        fileType: document.file_type,
        fileUrl,
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      return ServiceResultBuilder.failure("Lỗi khi upload tài liệu", "INTERNAL_ERROR");
    }
  }

  /**
   * Xóa tài liệu (xóa file trên S3 + record trong DB)
   */
  async deleteDocument(lhpId: string, docId: string, gvUserId: string): Promise<ServiceResult<null>> {
    try {
      const lhp = await this.uow.lopHocPhanRepository.findById(lhpId);

      if (!lhp) {
        return ServiceResultBuilder.failure("Lớp học phần không tồn tại", "LHP_NOT_FOUND");
      }

      if (lhp.giang_vien_id !== gvUserId) {
        return ServiceResultBuilder.failure("Không có quyền truy cập", "FORBIDDEN");
      }

      // Lấy thông tin tài liệu using repository
      const doc = await this.uow.taiLieuRepository.findById(docId);

      if (!doc) {
        return ServiceResultBuilder.failure("Tài liệu không tồn tại", "DOCUMENT_NOT_FOUND");
      }

      // Xóa file trên S3
      await this.s3Service.deleteFile(doc.file_path);

      // Xóa record trong DB using repository
      await this.uow.taiLieuRepository.deleteById(docId);

      return ServiceResultBuilder.success("Xóa tài liệu thành công", null);
    } catch (error) {
      console.error("Error deleting document:", error);
      return ServiceResultBuilder.failure("Lỗi khi xóa tài liệu", "INTERNAL_ERROR");
    }
  }

  /**
   * Download tài liệu (stream file từ S3)
   */
  async streamDocument(lhpId: string, docId: string, gvUserId: string): Promise<ServiceResult<{
    stream: any;
    contentType: string;
    contentLength?: number;
    filename: string;
  }>> {
    try {
      const lhp = await this.uow.lopHocPhanRepository.findById(lhpId);

      if (!lhp) {
        return ServiceResultBuilder.failure("Lớp học phần không tồn tại", "LHP_NOT_FOUND");
      }

      if (lhp.giang_vien_id !== gvUserId) {
        return ServiceResultBuilder.failure("Không có quyền truy cập", "FORBIDDEN");
      }

      // Get document using repository
      const doc = await this.uow.taiLieuRepository.findById(docId);

      if (!doc) {
        return ServiceResultBuilder.failure("Tài liệu không tồn tại", "DOCUMENT_NOT_FOUND");
      }

      // Get file stream from S3
      const { stream, contentType, contentLength } = await this.s3Service.getFileStream(doc.file_path);
      const filename = this.s3Service.getFilenameFromKey(doc.file_path);

      return ServiceResultBuilder.success("Lấy file thành công", {
        stream,
        contentType,
        contentLength,
        filename,
      });
    } catch (error) {
      console.error("Error streaming document:", error);
      return ServiceResultBuilder.failure("Lỗi khi lấy file", "INTERNAL_ERROR");
    }
  }

  /**
   * Lấy điểm sinh viên
   */
  async getGrades(lhpId: string, gvUserId: string): Promise<ServiceResult<any>> {
    try {
      const lhp = await this.uow.lopHocPhanRepository.findById(lhpId);

      if (!lhp) {
        return ServiceResultBuilder.failure("Lớp học phần không tồn tại", "LHP_NOT_FOUND");
      }

      if (lhp.giang_vien_id !== gvUserId) {
        return ServiceResultBuilder.failure("Không có quyền truy cập", "FORBIDDEN");
      }

      const { lhp: lopInfo, rows } = await this.uow.lopHocPhanRepository.gradesOfLHP(lhpId);

      return ServiceResultBuilder.success("Lấy danh sách điểm thành công", {
        lhp: lopInfo,
        rows,
      });
    } catch (error) {
      console.error("Error getting grades:", error);
      return ServiceResultBuilder.failure("Lỗi khi lấy danh sách điểm", "INTERNAL_ERROR");
    }
  }

  /**
   * Cập nhật điểm sinh viên
   */
  async upsertGrades(
    lhpId: string,
    gvUserId: string,
    items: { sinh_vien_id: string; diem_so: number }[]
  ): Promise<ServiceResult<null>> {
    try {
      const lhp = await this.uow.lopHocPhanRepository.findById(lhpId);

      if (!lhp) {
        return ServiceResultBuilder.failure("Lớp học phần không tồn tại", "LHP_NOT_FOUND");
      }

      if (lhp.giang_vien_id !== gvUserId) {
        return ServiceResultBuilder.failure("Không có quyền truy cập", "FORBIDDEN");
      }

      await this.uow.lopHocPhanRepository.upsertGrades(lhpId, items);

      return ServiceResultBuilder.success("Cập nhật điểm thành công", null);
    } catch (error) {
      console.error("Error upserting grades:", error);
      return ServiceResultBuilder.failure("Lỗi khi cập nhật điểm", "INTERNAL_ERROR");
    }
  }

  /**
   * Cập nhật tên tài liệu (không đổi file trên S3)
   */
  async updateDocument(
    lhpId: string,
    docId: string,
    gvUserId: string,
    tenTaiLieu: string
  ): Promise<ServiceResult<any>> {
    try {
      const lhp = await this.uow.lopHocPhanRepository.findById(lhpId);

      if (!lhp) {
        return ServiceResultBuilder.failure("Lớp học phần không tồn tại", "LHP_NOT_FOUND");
      }

      if (lhp.giang_vien_id !== gvUserId) {
        return ServiceResultBuilder.failure("Không có quyền truy cập", "FORBIDDEN");
      }

      // Check tài liệu tồn tại
      const doc = await this.uow.taiLieuRepository.findById(docId);

      if (!doc) {
        return ServiceResultBuilder.failure("Tài liệu không tồn tại", "DOCUMENT_NOT_FOUND");
      }

      if (doc.lop_hoc_phan_id !== lhpId) {
        return ServiceResultBuilder.failure(
          "Tài liệu không thuộc lớp học phần này",
          "DOCUMENT_MISMATCH"
        );
      }

      // Validate tên tài liệu
      if (!tenTaiLieu || tenTaiLieu.trim().length === 0) {
        return ServiceResultBuilder.failure("Tên tài liệu không được rỗng", "INVALID_NAME");
      }

      // Update tên tài liệu (file trên S3 giữ nguyên)
      const updated = await this.uow.taiLieuRepository.updateTenTaiLieu(docId, tenTaiLieu.trim());

      return ServiceResultBuilder.success("Cập nhật tên tài liệu thành công", {
        id: updated.id,
        tenTaiLieu: updated.ten_tai_lieu,
        filePath: updated.file_path,
      });
    } catch (error) {
      console.error("Error updating document:", error);
      return ServiceResultBuilder.failure("Lỗi khi cập nhật tài liệu", "INTERNAL_ERROR");
    }
  }
}
