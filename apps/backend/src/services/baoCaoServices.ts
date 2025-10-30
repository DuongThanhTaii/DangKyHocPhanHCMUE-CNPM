import { prisma } from "../db/prisma";
import { BaoCaoRepository } from "../repositories/baoCaoRepository";

const repo = new BaoCaoRepository(prisma);

type Filter = { hoc_ky_id: string; khoa_id?: string; nganh_id?: string };

export const BaoCaoServices = {
  async overview(filter: Filter) {
    const [svUnique, soDK, soLHP, taiChinh] = await Promise.all([
      repo.soSinhVienDaDangKy(
        filter.hoc_ky_id,
        filter.khoa_id,
        filter.nganh_id
      ),
      repo.soBanGhiDangKy(filter.hoc_ky_id, filter.khoa_id, filter.nganh_id),
      repo.soLopHocPhanMo(filter.hoc_ky_id, filter.khoa_id, filter.nganh_id),
      repo.taiChinh(filter.hoc_ky_id, filter.khoa_id, filter.nganh_id),
    ]);

    const ketLuan = [
      svUnique === 0
        ? "Chưa có sinh viên đăng ký."
        : `Có ${svUnique} sinh viên đã đăng ký.`,
      soLHP === 0 ? "Chưa mở lớp học phần." : `Đã mở ${soLHP} lớp học phần.`,
      taiChinh.thuc_thu === 0
        ? "Chưa phát sinh khoản thu trong kỳ."
        : `Tổng thực thu: ${taiChinh.thuc_thu.toLocaleString("vi-VN")} VND.`,
    ].join(" ");

    return { svUnique, soDK, soLHP, taiChinh, ketLuan };
  },

  async dkTheoKhoa(hoc_ky_id: string) {
    const data = await repo.dangKyTheoKhoa(hoc_ky_id);
    const top = data[0];
    const ketLuan = top
      ? `Khoa có lượng đăng ký cao nhất: ${top.ten_khoa} (${top.so_dang_ky}).`
      : "Chưa có dữ liệu.";
    return { data, ketLuan };
  },

  async dkTheoNganh(hoc_ky_id: string, khoa_id?: string) {
    const data = await repo.dangKyTheoNganh(hoc_ky_id, khoa_id);
    const top = data[0];
    const ketLuan = top
      ? `Ngành nổi bật: ${top.ten_nganh} (${top.so_dang_ky} đăng ký).`
      : "Chưa có dữ liệu.";
    return { data, ketLuan };
  },

  async taiGiangVien(hoc_ky_id: string, khoa_id?: string) {
    const data = await repo.taiGiangVien(hoc_ky_id, khoa_id);
    const top = data[0];
    const ketLuan = top
      ? `Giảng viên có tải lớn nhất: ${top.ho_ten} (${top.so_lop} lớp).`
      : "Chưa có dữ liệu.";
    return { data, ketLuan };
  },
};
