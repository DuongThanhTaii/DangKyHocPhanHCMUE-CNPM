import { UnitOfWork } from "../repositories/unitOfWork";

const uow = UnitOfWork.getInstance();

const assertOwnsLHP = async (lhpId: string, gvUserId: string) => {
  const lhp = await uow.lopHocPhanRepository.findById(lhpId);
  if (!lhp) throw new Error("LHP không tồn tại");
  if (lhp.giang_vien_id !== gvUserId) throw new Error("Không có quyền");
};

export const gvLopHocPhanService = {
  listMine: (gvUserId: string) => uow.lopHocPhanRepository.byGiangVien(gvUserId),
  detail: async (lhpId: string, gvUserId: string) => {
    await assertOwnsLHP(lhpId, gvUserId);
    return uow.lopHocPhanRepository.detail(lhpId);
  },
  students: async (lhpId: string, gvUserId: string) => {
    await assertOwnsLHP(lhpId, gvUserId);
    return uow.lopHocPhanRepository.studentsOfLHP(lhpId);
  },
  documents: async (lhpId: string, gvUserId: string) => {
    await assertOwnsLHP(lhpId, gvUserId);
    return uow.lopHocPhanRepository.documentsOfLHP(lhpId);
  },
  createDocument: async (
    lhpId: string,
    gvUserId: string,
    payload: {
      ten_tai_lieu: string;
      file_path: string;
      file_type?: string | null;
    }
  ) => {
    await assertOwnsLHP(lhpId, gvUserId);
    return uow.lopHocPhanRepository.createDocument({
      lop_hoc_phan_id: lhpId,
      ten_tai_lieu: payload.ten_tai_lieu,
      file_path: payload.file_path,
      file_type: payload.file_type ?? null,
      uploaded_by: gvUserId,
    });
  },
  deleteDocument: async (lhpId: string, docId: string, gvUserId: string) => {
    await assertOwnsLHP(lhpId, gvUserId);
    return uow.lopHocPhanRepository.deleteDocument(docId, lhpId);
  },
  getGrades: async (lhpId: string, gvUserId: string) => {
    await assertOwnsLHP(lhpId, gvUserId);
    return uow.lopHocPhanRepository.gradesOfLHP(lhpId);
  },
  upsertGrades: async (
    lhpId: string,
    gvUserId: string,
    items: { sinh_vien_id: string; diem_so: number }[]
  ) => {
    await assertOwnsLHP(lhpId, gvUserId);
    return uow.lopHocPhanRepository.upsertGrades(lhpId, items);
  },
};
