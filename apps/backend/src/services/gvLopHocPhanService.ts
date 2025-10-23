import { prisma } from "../db/prisma";
import { lopHocPhanRepository as repo } from "../repositories/lopHocPhanRepository";

const assertOwnsLHP = async (lhpId: string, gvUserId: string) => {
  const lhp = await prisma.lop_hoc_phan.findUnique({
    where: { id: lhpId },
    select: { giang_vien_id: true },
  });
  if (!lhp) throw new Error("LHP không tồn tại");
  if (lhp.giang_vien_id !== gvUserId) throw new Error("Không có quyền");
};

export const gvLopHocPhanService = {
  listMine: (gvUserId: string) => repo.byGiangVien(gvUserId),
  detail: async (lhpId: string, gvUserId: string) => {
    await assertOwnsLHP(lhpId, gvUserId);
    return repo.detail(lhpId);
  },
  students: async (lhpId: string, gvUserId: string) => {
    await assertOwnsLHP(lhpId, gvUserId);
    return repo.studentsOfLHP(lhpId);
  },
  documents: async (lhpId: string, gvUserId: string) => {
    await assertOwnsLHP(lhpId, gvUserId);
    return repo.documentsOfLHP(lhpId);
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
    return repo.createDocument({
      lop_hoc_phan_id: lhpId,
      ten_tai_lieu: payload.ten_tai_lieu,
      file_path: payload.file_path,
      file_type: payload.file_type ?? null,
      uploaded_by: gvUserId,
    });
  },
  deleteDocument: async (lhpId: string, docId: string, gvUserId: string) => {
    await assertOwnsLHP(lhpId, gvUserId);
    return repo.deleteDocument(docId, lhpId);
  },
  getGrades: async (lhpId: string, gvUserId: string) => {
    await assertOwnsLHP(lhpId, gvUserId);
    return repo.gradesOfLHP(lhpId);
  },
  upsertGrades: async (
    lhpId: string,
    gvUserId: string,
    items: { sinh_vien_id: string; diem_so: number }[]
  ) => {
    await assertOwnsLHP(lhpId, gvUserId);
    return repo.upsertGrades(lhpId, items);
  },
};
