-- =========================================================
-- EXTENSIONS & UTILS
-- =========================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Trigger cập nhật updated_at
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END; $$;

-- =========================================================
-- 1) DANH MỤC CƠ BẢN & TÀI KHOẢN
-- =========================================================
CREATE TABLE IF NOT EXISTS khoa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ma_khoa VARCHAR(10) UNIQUE NOT NULL,
  ten_khoa VARCHAR(255) NOT NULL,
  ngay_thanh_lap DATE,
  trang_thai_hoat_dong BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_khoa_updated BEFORE UPDATE ON khoa
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

CREATE TABLE IF NOT EXISTS tai_khoan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ten_dang_nhap VARCHAR(50) UNIQUE NOT NULL,
  mat_khau VARCHAR(255) NOT NULL,
  loai_tai_khoan VARCHAR(20) NOT NULL CHECK (loai_tai_khoan IN
    ('phong_dao_tao','truong_khoa','tro_ly_khoa','sinh_vien','giang_vien')),
  trang_thai_hoat_dong BOOLEAN DEFAULT TRUE,
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_tk_updated BEFORE UPDATE ON tai_khoan
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ma_nhan_vien VARCHAR(20),
  ho_ten VARCHAR(255) NOT NULL,
  tai_khoan_id UUID REFERENCES tai_khoan(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

CREATE TABLE IF NOT EXISTS phong_dao_tao (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  chuc_vu VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS truong_khoa (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  khoa_id UUID NOT NULL REFERENCES khoa(id) ON DELETE CASCADE,
  UNIQUE(khoa_id)
);

CREATE TABLE IF NOT EXISTS tro_ly_khoa (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  khoa_id UUID NOT NULL REFERENCES khoa(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS nganh_hoc (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ma_nganh VARCHAR(20) UNIQUE NOT NULL,
  ten_nganh VARCHAR(255) NOT NULL,
  khoa_id UUID NOT NULL REFERENCES khoa(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_nganh_updated BEFORE UPDATE ON nganh_hoc
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

CREATE TABLE IF NOT EXISTS sinh_vien (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  ma_so_sinh_vien VARCHAR(20) UNIQUE NOT NULL,
  lop VARCHAR(50),
  khoa_id UUID NOT NULL REFERENCES khoa(id) ON DELETE CASCADE,
  khoa_hoc VARCHAR(10),
  ngay_nhap_hoc DATE,
  nganh_id UUID REFERENCES nganh_hoc(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS giang_vien (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  khoa_id UUID NOT NULL REFERENCES khoa(id) ON DELETE CASCADE,
  chuyen_mon TEXT,
  trinh_do VARCHAR(50),
  kinh_nghiem_giang_day INTEGER DEFAULT 0
);

-- =========================================================
-- 2) MÔN HỌC, HỌC KỲ, HỌC PHẦN
-- =========================================================
CREATE TABLE IF NOT EXISTS mon_hoc (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ma_mon VARCHAR(20) UNIQUE NOT NULL,
  ten_mon VARCHAR(255) NOT NULL,
  so_tin_chi INTEGER NOT NULL CHECK (so_tin_chi > 0),
  khoa_id UUID NOT NULL REFERENCES khoa(id) ON DELETE CASCADE,
  loai_mon VARCHAR(50) DEFAULT 'chuyen_nganh'
    CHECK (loai_mon IN ('chuyen_nganh','tu_chon','thuc_tap','do_an')),
  la_mon_chung BOOLEAN DEFAULT FALSE,
  thu_tu_hoc INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_monhoc_updated BEFORE UPDATE ON mon_hoc
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

CREATE TABLE IF NOT EXISTS mon_hoc_nganh (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mon_hoc_id UUID NOT NULL REFERENCES mon_hoc(id) ON DELETE CASCADE,
  nganh_id UUID NOT NULL REFERENCES nganh_hoc(id) ON DELETE CASCADE,
  UNIQUE(mon_hoc_id, nganh_id)
);

-- Hợp nhất tiên quyết / học trước
CREATE TABLE IF NOT EXISTS mon_dieu_kien (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mon_hoc_id UUID NOT NULL REFERENCES mon_hoc(id) ON DELETE CASCADE,
  mon_lien_quan_id UUID NOT NULL REFERENCES mon_hoc(id) ON DELETE CASCADE,
  loai VARCHAR(20) NOT NULL CHECK (loai IN ('tien_quyet','hoc_truoc')),
  bat_buoc BOOLEAN DEFAULT TRUE,
  UNIQUE(mon_hoc_id, mon_lien_quan_id, loai),
  CHECK (mon_hoc_id <> mon_lien_quan_id)
);

CREATE TABLE IF NOT EXISTS nien_khoa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ten_nien_khoa VARCHAR(20) UNIQUE NOT NULL,
  ngay_bat_dau DATE,
  ngay_ket_thuc DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_nienkhoa_updated BEFORE UPDATE ON nien_khoa
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

CREATE TABLE IF NOT EXISTS hoc_ky (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ten_hoc_ky VARCHAR(50) NOT NULL,
  ma_hoc_ky VARCHAR(10) NOT NULL,
  id_nien_khoa UUID NOT NULL REFERENCES nien_khoa(id) ON DELETE CASCADE,
  ngay_bat_dau DATE,
  ngay_ket_thuc DATE,
  trang_thai_hien_tai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ma_hoc_ky, id_nien_khoa),
  CHECK (ngay_ket_thuc IS NULL OR ngay_bat_dau IS NULL OR ngay_ket_thuc > ngay_bat_dau)
);
CREATE TRIGGER trg_hocky_updated BEFORE UPDATE ON hoc_ky
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- Phase theo học kỳ (PĐT bật/tắt)
CREATE TABLE IF NOT EXISTS ky_phase (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hoc_ky_id UUID NOT NULL REFERENCES hoc_ky(id) ON DELETE CASCADE,
  phase VARCHAR(30) NOT NULL CHECK (phase IN
    ('de_xuat_phe_duyet','ghi_danh','sap_xep_tkb','dang_ky_hoc_phan','binh_thuong')),
  start_at TIMESTAMP NOT NULL,
  end_at   TIMESTAMP NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  UNIQUE (hoc_ky_id, phase),
  CHECK (end_at > start_at)
);

-- Helper: phase đang mở?
CREATE OR REPLACE FUNCTION fn_phase_dang_mo(p_hoc_ky UUID, p_phase TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM ky_phase
    WHERE hoc_ky_id = p_hoc_ky
      AND phase = p_phase
      AND is_enabled
      AND now() BETWEEN start_at AND end_at
  );
$$;

-- Đợt (ghi danh/đăng ký)
CREATE TABLE IF NOT EXISTS dot_dang_ky (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hoc_ky_id UUID NOT NULL REFERENCES hoc_ky(id) ON DELETE CASCADE,
  loai_dot VARCHAR(20) NOT NULL DEFAULT 'dang_ky'  -- NEW: gộp tại CREATE
    CHECK (loai_dot IN ('ghi_danh','dang_ky')),
  doi_tuong_loai VARCHAR(20) NOT NULL
    CHECK (doi_tuong_loai IN ('toan_truong','khoa','nganh','khoa_hoc','lop')),
  doi_tuong_id UUID, -- nullable theo loại
  gioi_han_tin_chi INTEGER DEFAULT 9999 CHECK (gioi_han_tin_chi > 0),
  thoi_gian_bat_dau TIMESTAMP NOT NULL,
  thoi_gian_ket_thuc TIMESTAMP NOT NULL,
  han_huy_den TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (thoi_gian_ket_thuc > thoi_gian_bat_dau)
);
CREATE TRIGGER trg_dotdk_updated BEFORE UPDATE ON dot_dang_ky
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- Học phần (course offering)
CREATE TABLE IF NOT EXISTS hoc_phan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mon_hoc_id UUID NOT NULL REFERENCES mon_hoc(id) ON DELETE CASCADE,
  ten_hoc_phan VARCHAR(255) NOT NULL,
  so_lop INTEGER DEFAULT 1 CHECK (so_lop > 0),
  trang_thai_mo BOOLEAN DEFAULT FALSE,
  id_hoc_ky UUID NOT NULL REFERENCES hoc_ky(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_hocphan_updated BEFORE UPDATE ON hoc_phan
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- =========================================================
-- 3) CƠ SỞ VẬT CHẤT & LỚP HỌC PHẦN + LỊCH
-- =========================================================
CREATE TABLE IF NOT EXISTS co_so (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ten_co_so TEXT NOT NULL,
  dia_chi TEXT
);

CREATE TABLE IF NOT EXISTS phong (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ma_phong VARCHAR(20) NOT NULL,
  co_so_id UUID REFERENCES co_so(id) ON DELETE SET NULL,
  suc_chua INTEGER CHECK (suc_chua > 0),
  loai_phong VARCHAR(30),
  dia_diem TEXT,
  UNIQUE (ma_phong, co_so_id)
);

CREATE TABLE IF NOT EXISTS lop_hoc_phan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hoc_phan_id UUID NOT NULL REFERENCES hoc_phan(id) ON DELETE CASCADE,
  ma_lop VARCHAR(20) NOT NULL,
  giang_vien_id UUID REFERENCES giang_vien(id) ON DELETE SET NULL,
  so_luong_toi_da INTEGER DEFAULT 50 CHECK (so_luong_toi_da > 0),
  so_luong_hien_tai INTEGER DEFAULT 0 CHECK (so_luong_hien_tai >= 0),
  phong_mac_dinh_id UUID REFERENCES phong(id) ON DELETE SET NULL,
  trang_thai_lop VARCHAR(20) DEFAULT 'dang_mo' CHECK (trang_thai_lop IN ('dang_mo','dong','huy')),
  ngay_bat_dau DATE,
  ngay_ket_thuc DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(hoc_phan_id, ma_lop),
  CHECK (so_luong_hien_tai <= so_luong_toi_da)
);
CREATE TRIGGER trg_lhp_updated BEFORE UPDATE ON lop_hoc_phan
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

CREATE TABLE IF NOT EXISTS lich_hoc_dinh_ky (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lop_hoc_phan_id UUID NOT NULL REFERENCES lop_hoc_phan(id) ON DELETE CASCADE,
  thu INTEGER NOT NULL CHECK (thu BETWEEN 2 AND 8),
  tiet_bat_dau INTEGER NOT NULL CHECK (tiet_bat_dau BETWEEN 1 AND 15),
  tiet_ket_thuc INTEGER NOT NULL CHECK (tiet_ket_thuc BETWEEN 1 AND 15),
  phong_id UUID REFERENCES phong(id) ON DELETE SET NULL,
  tuan_bat_dau INTEGER,
  tuan_ket_thuc INTEGER,
  gio_bat_dau TIME,
  gio_ket_thuc TIME,
  tiet_range int4range GENERATED ALWAYS AS (int4range(tiet_bat_dau, tiet_ket_thuc, '[]')) STORED,
  UNIQUE (lop_hoc_phan_id, thu, tiet_bat_dau, tiet_ket_thuc),
  CHECK (gio_ket_thuc IS NULL OR gio_bat_dau IS NULL OR gio_ket_thuc > gio_bat_dau)
);

-- Tránh trùng phòng–tiết (cùng phòng, cùng thứ, khoảng tiết giao nhau)
ALTER TABLE lich_hoc_dinh_ky
  ADD CONSTRAINT ex_phong_trung_tiet
  EXCLUDE USING gist (
    phong_id WITH =,
    thu WITH =,
    tiet_range WITH &&
  )
  WHERE (phong_id IS NOT NULL);

CREATE TABLE IF NOT EXISTS lich_day_lop_hoc_phan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lop_hoc_phan_id UUID NOT NULL REFERENCES lop_hoc_phan(id) ON DELETE CASCADE,
  ngay_hoc DATE NOT NULL,
  thu INTEGER CHECK (thu BETWEEN 2 AND 8),
  tiet_bat_dau INTEGER CHECK (tiet_bat_dau BETWEEN 1 AND 15),
  tiet_ket_thuc INTEGER CHECK (tiet_ket_thuc BETWEEN 1 AND 15),
  phong_id UUID REFERENCES phong(id) ON DELETE SET NULL,
  UNIQUE(lop_hoc_phan_id, ngay_hoc)
);

-- =========================================================
-- 4) GHI DANH & ĐĂNG KÝ HỌC PHẦN (+ TRÙNG LỊCH)
-- =========================================================
CREATE TABLE IF NOT EXISTS ghi_danh_hoc_phan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sinh_vien_id UUID NOT NULL REFERENCES sinh_vien(id) ON DELETE CASCADE,
  hoc_phan_id  UUID NOT NULL REFERENCES hoc_phan(id)  ON DELETE CASCADE,
  ngay_ghi_danh TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  trang_thai VARCHAR(20) DEFAULT 'da_ghi_danh' CHECK (trang_thai IN ('da_ghi_danh','da_huy')),
  UNIQUE (sinh_vien_id, hoc_phan_id)
);

-- Kiểm tra ghi danh: đúng phase & đúng đợt
CREATE OR REPLACE FUNCTION trg_check_ghi_danh()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_hk UUID;
BEGIN
  SELECT id_hoc_ky INTO v_hk FROM hoc_phan WHERE id = NEW.hoc_phan_id;
  IF NOT fn_phase_dang_mo(v_hk, 'ghi_danh') THEN
    RAISE EXCEPTION 'Hiện không trong phase Ghi danh của học kỳ này';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM dot_dang_ky d
    WHERE d.hoc_ky_id = v_hk
      AND d.loai_dot = 'ghi_danh'
      AND now() BETWEEN d.thoi_gian_bat_dau AND d.thoi_gian_ket_thuc
  ) THEN
    RAISE EXCEPTION 'Hiện không trong đợt Ghi danh';
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS ghi_danh_before_ins ON ghi_danh_hoc_phan;
CREATE TRIGGER ghi_danh_before_ins
BEFORE INSERT ON ghi_danh_hoc_phan
FOR EACH ROW EXECUTE FUNCTION trg_check_ghi_danh();

CREATE OR REPLACE FUNCTION trg_check_huy_ghi_danh()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_hk UUID;
  v_han TIMESTAMP;
BEGIN
  IF NEW.trang_thai = 'da_huy' AND OLD.trang_thai <> 'da_huy' THEN
    SELECT id_hoc_ky INTO v_hk FROM hoc_phan WHERE id = NEW.hoc_phan_id;
    SELECT MAX(han_huy_den) INTO v_han
    FROM dot_dang_ky
    WHERE hoc_ky_id = v_hk AND loai_dot = 'ghi_danh';
    IF v_han IS NOT NULL AND now() > v_han THEN
      RAISE EXCEPTION 'Đã quá hạn hủy ghi danh';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS ghi_danh_before_upd ON ghi_danh_hoc_phan;
CREATE TRIGGER ghi_danh_before_upd
BEFORE UPDATE ON ghi_danh_hoc_phan
FOR EACH ROW EXECUTE FUNCTION trg_check_huy_ghi_danh();

-- Đăng ký lớp
CREATE TABLE IF NOT EXISTS dang_ky_hoc_phan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sinh_vien_id UUID NOT NULL REFERENCES sinh_vien(id) ON DELETE CASCADE,
  lop_hoc_phan_id UUID NOT NULL REFERENCES lop_hoc_phan(id) ON DELETE CASCADE,
  ngay_dang_ky TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  trang_thai VARCHAR(20) DEFAULT 'da_dang_ky' CHECK (trang_thai IN ('da_dang_ky','da_huy')),
  co_xung_dot BOOLEAN DEFAULT FALSE,
  UNIQUE(sinh_vien_id, lop_hoc_phan_id)
);

-- Bảng “bóng” áp EXCLUDE để chặn trùng tiết
CREATE TABLE IF NOT EXISTS dang_ky_tkb (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dang_ky_id UUID NOT NULL REFERENCES dang_ky_hoc_phan(id) ON DELETE CASCADE,
  sinh_vien_id UUID NOT NULL REFERENCES sinh_vien(id) ON DELETE CASCADE,
  lop_hoc_phan_id UUID NOT NULL REFERENCES lop_hoc_phan(id) ON DELETE CASCADE,
  thu INTEGER NOT NULL,
  tiet_range int4range NOT NULL,
  hieu_luc BOOLEAN DEFAULT TRUE
);

ALTER TABLE dang_ky_tkb
  ADD CONSTRAINT ex_dang_ky_trung_tiet
  EXCLUDE USING gist (
    sinh_vien_id WITH =,
    thu WITH =,
    tiet_range WITH &&
  )
  WHERE (hieu_luc);

-- Trigger kiểm tra nghiệp vụ trước khi INSERT đăng ký lớp
CREATE OR REPLACE FUNCTION trg_check_dang_ky_lhp()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_hp UUID;
  v_hk UUID;
  v_mon UUID;
  v_trang_thai_lop VARCHAR(20);
  v_limit INTEGER;
  v_tc_hien_tai INTEGER;
  v_tc_moi INTEGER;
BEGIN
  -- Lấy hoc_phan và học kỳ của lớp
  SELECT l.hoc_phan_id, h.id_hoc_ky, h.mon_hoc_id, l.trang_thai_lop
  INTO v_hp, v_hk, v_mon, v_trang_thai_lop
  FROM lop_hoc_phan l
  JOIN hoc_phan h ON h.id = l.hoc_phan_id
  WHERE l.id = NEW.lop_hoc_phan_id;

  IF v_hp IS NULL THEN
    RAISE EXCEPTION 'Lớp học phần không hợp lệ';
  END IF;

  -- Phase phải mở cho Đăng ký
  IF NOT fn_phase_dang_mo(v_hk, 'dang_ky_hoc_phan') THEN
    RAISE EXCEPTION 'Hiện không trong phase Đăng ký học phần của học kỳ này';
  END IF;

  -- Trong đợt đăng ký
  IF NOT EXISTS (
    SELECT 1 FROM dot_dang_ky d
    WHERE d.hoc_ky_id = v_hk
      AND d.loai_dot = 'dang_ky'
      AND now() BETWEEN d.thoi_gian_bat_dau AND d.thoi_gian_ket_thuc
  ) THEN
    RAISE EXCEPTION 'Hiện không trong đợt Đăng ký học phần';
  END IF;

  -- Phải đã ghi danh hoc_phan
  IF NOT EXISTS (
    SELECT 1 FROM ghi_danh_hoc_phan gd
    WHERE gd.sinh_vien_id = NEW.sinh_vien_id
      AND gd.hoc_phan_id = v_hp
      AND gd.trang_thai = 'da_ghi_danh'
  ) THEN
    RAISE EXCEPTION 'Bạn phải ghi danh học phần này trước khi đăng ký lớp';
  END IF;

  -- Lớp phải đang mở
  IF v_trang_thai_lop <> 'dang_mo' THEN
    RAISE EXCEPTION 'Lớp hiện không ở trạng thái mở để đăng ký';
  END IF;

  -- Lớp phải có lịch
  IF NOT EXISTS (
    SELECT 1 FROM lich_hoc_dinh_ky WHERE lop_hoc_phan_id = NEW.lop_hoc_phan_id
  ) THEN
    RAISE EXCEPTION 'Lớp chưa được sắp xếp thời khóa biểu';
  END IF;

  -- Không đăng ký trùng 1 môn trong cùng học kỳ (dù khác lớp)
  IF EXISTS (
    SELECT 1
    FROM dang_ky_hoc_phan dk
    JOIN lop_hoc_phan l ON l.id = dk.lop_hoc_phan_id
    JOIN hoc_phan h ON h.id = l.hoc_phan_id
    WHERE dk.sinh_vien_id = NEW.sinh_vien_id
      AND dk.trang_thai = 'da_dang_ky'
      AND h.id_hoc_ky = v_hk
      AND h.mon_hoc_id = v_mon
  ) THEN
    RAISE EXCEPTION 'Bạn đã đăng ký một lớp khác của cùng môn trong học kỳ này';
  END IF;

  -- Kiểm tra Tiên quyết (phải "đạt")
  IF EXISTS (
    SELECT 1
    FROM mon_dieu_kien md
    WHERE md.mon_hoc_id = v_mon AND md.loai = 'tien_quyet' AND md.bat_buoc
      AND NOT EXISTS (
        SELECT 1 FROM ket_qua_hoc_phan kq
        WHERE kq.sinh_vien_id = NEW.sinh_vien_id
          AND kq.mon_hoc_id = md.mon_lien_quan_id
          AND kq.trang_thai = 'dat'
      )
  ) THEN
    RAISE EXCEPTION 'Chưa thỏa điều kiện tiên quyết';
  END IF;

  -- Kiểm tra Học trước (đã đạt hoặc đang đồng học trong cùng học kỳ)
  IF EXISTS (
    SELECT 1
    FROM mon_dieu_kien md
    WHERE md.mon_hoc_id = v_mon AND md.loai = 'hoc_truoc' AND md.bat_buoc
      AND NOT (
        EXISTS ( -- đã đạt trước đó
          SELECT 1 FROM ket_qua_hoc_phan kq
          WHERE kq.sinh_vien_id = NEW.sinh_vien_id
            AND kq.mon_hoc_id = md.mon_lien_quan_id
            AND kq.trang_thai = 'dat'
        )
        OR
        EXISTS ( -- đang đồng học trong học kỳ này
          SELECT 1
          FROM dang_ky_hoc_phan dk2
          JOIN lop_hoc_phan l2 ON l2.id = dk2.lop_hoc_phan_id
          JOIN hoc_phan h2 ON h2.id = l2.hoc_phan_id
          WHERE dk2.sinh_vien_id = NEW.sinh_vien_id
            AND dk2.trang_thai = 'da_dang_ky'
            AND h2.id_hoc_ky = v_hk
            AND h2.mon_hoc_id = md.mon_lien_quan_id
        )
      )
  ) THEN
    RAISE EXCEPTION 'Chưa thỏa điều kiện học trước';
  END IF;

  -- Giới hạn tín chỉ theo đợt (nếu cấu hình)
  SELECT COALESCE(MAX(gioi_han_tin_chi), 0) INTO v_limit
  FROM dot_dang_ky d
  WHERE d.hoc_ky_id = v_hk
    AND d.loai_dot = 'dang_ky'
    AND now() BETWEEN d.thoi_gian_bat_dau AND d.thoi_gian_ket_thuc;

  IF v_limit > 0 THEN
    SELECT COALESCE(SUM(mh.so_tin_chi), 0) INTO v_tc_hien_tai
    FROM dang_ky_hoc_phan dk
    JOIN lop_hoc_phan l ON l.id = dk.lop_hoc_phan_id
    JOIN hoc_phan h ON h.id = l.hoc_phan_id
    JOIN mon_hoc mh ON mh.id = h.mon_hoc_id
    WHERE dk.sinh_vien_id = NEW.sinh_vien_id
      AND dk.trang_thai = 'da_dang_ky'
      AND h.id_hoc_ky = v_hk;

    SELECT mh.so_tin_chi INTO v_tc_moi
    FROM lop_hoc_phan l
    JOIN hoc_phan h ON h.id = l.hoc_phan_id
    JOIN mon_hoc mh ON mh.id = h.mon_hoc_id
    WHERE l.id = NEW.lop_hoc_phan_id;

    IF (v_tc_hien_tai + v_tc_moi) > v_limit THEN
      RAISE EXCEPTION 'Vượt giới hạn tín chỉ cho phép trong đợt đăng ký';
    END IF;
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS dkhp_before_ins ON dang_ky_hoc_phan;
CREATE TRIGGER dkhp_before_ins
BEFORE INSERT ON dang_ky_hoc_phan
FOR EACH ROW EXECUTE FUNCTION trg_check_dang_ky_lhp();

-- Hạn hủy đăng ký lớp
CREATE OR REPLACE FUNCTION trg_check_huy_dang_ky_lhp()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_hp UUID; v_hk UUID; v_han TIMESTAMP;
BEGIN
  IF NEW.trang_thai = 'da_huy' AND OLD.trang_thai <> 'da_huy' THEN
    SELECT hoc_phan_id INTO v_hp FROM lop_hoc_phan WHERE id = NEW.lop_hoc_phan_id;
    SELECT id_hoc_ky INTO v_hk FROM hoc_phan WHERE id = v_hp;

    SELECT MAX(han_huy_den) INTO v_han
    FROM dot_dang_ky
    WHERE hoc_ky_id = v_hk AND loai_dot = 'dang_ky';

    IF v_han IS NOT NULL AND now() > v_han THEN
      RAISE EXCEPTION 'Đã quá hạn hủy đăng ký lớp';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS dkhp_before_upd ON dang_ky_hoc_phan;
CREATE TRIGGER dkhp_before_upd
BEFORE UPDATE ON dang_ky_hoc_phan
FOR EACH ROW EXECUTE FUNCTION trg_check_huy_dang_ky_lhp();

-- Bung/thu lịch vào bảng bóng, đồng thời khóa sĩ số (atomically)
CREATE OR REPLACE FUNCTION trg_after_insert_dkhp()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO dang_ky_tkb (dang_ky_id, sinh_vien_id, lop_hoc_phan_id, thu, tiet_range)
  SELECT NEW.id, NEW.sinh_vien_id, NEW.lop_hoc_phan_id, lhdk.thu, lhdk.tiet_range
  FROM lich_hoc_dinh_ky lhdk
  WHERE lhdk.lop_hoc_phan_id = NEW.lop_hoc_phan_id;

  UPDATE lop_hoc_phan
  SET so_luong_hien_tai = so_luong_hien_tai + 1
  WHERE id = NEW.lop_hoc_phan_id
    AND so_luong_hien_tai < so_luong_toi_da;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lớp đã đầy hoặc không tồn tại';
  END IF;

  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION trg_after_delete_dkhp()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM dang_ky_tkb WHERE dang_ky_id = OLD.id;
  UPDATE lop_hoc_phan
  SET so_luong_hien_tai = GREATEST(0, so_luong_hien_tai - 1)
  WHERE id = OLD.lop_hoc_phan_id;
  RETURN OLD;
END; $$;

CREATE TRIGGER dkhp_after_insert
AFTER INSERT ON dang_ky_hoc_phan
FOR EACH ROW EXECUTE FUNCTION trg_after_insert_dkhp();

CREATE TRIGGER dkhp_after_delete
AFTER DELETE ON dang_ky_hoc_phan
FOR EACH ROW EXECUTE FUNCTION trg_after_delete_dkhp();

-- Lịch sử đăng ký
CREATE TABLE IF NOT EXISTS lich_su_dang_ky (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sinh_vien_id UUID NOT NULL REFERENCES sinh_vien(id) ON DELETE CASCADE,
  hoc_ky_id UUID REFERENCES hoc_ky(id),
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sinh_vien_id, hoc_ky_id)
);

CREATE TABLE IF NOT EXISTS chi_tiet_lich_su_dang_ky (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lich_su_dang_ky_id UUID NOT NULL REFERENCES lich_su_dang_ky(id) ON DELETE CASCADE,
  dang_ky_hoc_phan_id UUID NOT NULL REFERENCES dang_ky_hoc_phan(id) ON DELETE CASCADE,
  hanh_dong VARCHAR(20) NOT NULL CHECK (hanh_dong IN ('dang_ky','huy_dang_ky')),
  thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kết quả học phần (phục vụ tiên quyết)
CREATE TABLE IF NOT EXISTS ket_qua_hoc_phan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sinh_vien_id UUID NOT NULL REFERENCES sinh_vien(id) ON DELETE CASCADE,
  mon_hoc_id UUID NOT NULL REFERENCES mon_hoc(id) ON DELETE CASCADE,
  hoc_ky_id UUID REFERENCES hoc_ky(id),
  lop_hoc_phan_id UUID REFERENCES lop_hoc_phan(id),
  diem_so NUMERIC(4,2),
  trang_thai VARCHAR(20) CHECK (trang_thai IN ('dat','khong_dat')),
  UNIQUE (sinh_vien_id, mon_hoc_id, hoc_ky_id)
);

-- =========================================================
-- 5) HỌC PHÍ & THANH TOÁN
-- =========================================================
CREATE TABLE IF NOT EXISTS chinh_sach_tin_chi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hoc_ky_id UUID REFERENCES hoc_ky(id) ON DELETE CASCADE,
  khoa_id UUID REFERENCES khoa(id) ON DELETE SET NULL,
  nganh_id UUID REFERENCES nganh_hoc(id) ON DELETE SET NULL,
  phi_moi_tin_chi NUMERIC(12,2) NOT NULL,
  ngay_hieu_luc DATE NOT NULL DEFAULT CURRENT_DATE,
  ngay_het_hieu_luc DATE,
  CHECK (ngay_het_hieu_luc IS NULL OR ngay_het_hieu_luc > ngay_hieu_luc)
);

CREATE TABLE IF NOT EXISTS hoc_phi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sinh_vien_id UUID NOT NULL REFERENCES sinh_vien(id) ON DELETE CASCADE,
  hoc_ky_id UUID NOT NULL REFERENCES hoc_ky(id) ON DELETE CASCADE,
  tong_hoc_phi NUMERIC(15,2) DEFAULT 0,
  trang_thai_thanh_toan VARCHAR(20) DEFAULT 'chua_thanh_toan'
    CHECK (trang_thai_thanh_toan IN ('chua_thanh_toan','da_thanh_toan')),
  ngay_tinh_toan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ngay_thanh_toan TIMESTAMP,
  chinh_sach_id UUID REFERENCES chinh_sach_tin_chi(id) ON DELETE SET NULL,
  ghi_chu TEXT,
  UNIQUE (sinh_vien_id, hoc_ky_id)
);

CREATE TABLE IF NOT EXISTS chi_tiet_hoc_phi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hoc_phi_id UUID NOT NULL REFERENCES hoc_phi(id) ON DELETE CASCADE,
  lop_hoc_phan_id UUID NOT NULL REFERENCES lop_hoc_phan(id) ON DELETE CASCADE,
  so_tin_chi INTEGER NOT NULL,
  phi_tin_chi NUMERIC(10,2) NOT NULL,
  thanh_tien NUMERIC(12,2) NOT NULL,
  UNIQUE(hoc_phi_id, lop_hoc_phan_id)
);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR(20) DEFAULT 'momo',  -- có thể thêm 'vnpay'
  order_id TEXT UNIQUE NOT NULL,
  sinh_vien_id UUID NOT NULL REFERENCES sinh_vien(id) ON DELETE CASCADE,
  hoc_ky_id UUID NOT NULL REFERENCES hoc_ky(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'VND',
  status VARCHAR(20) NOT NULL DEFAULT 'created', -- created|paid|failed|canceled
  payment_method VARCHAR(30), -- atm_qr, napas, visa...
  pay_url TEXT,
  result_code TEXT,
  message TEXT,
  callback_raw JSONB,
  signature_valid BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_ipn_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES payment_transactions(id) ON DELETE CASCADE,
  received_at TIMESTAMP DEFAULT NOW(),
  payload JSONB
);

-- =========================================================
-- 6) THÔNG BÁO, TÀI LIỆU, LỊCH SỬ XOÁ
-- =========================================================
CREATE TABLE IF NOT EXISTS thong_bao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tieu_de TEXT NOT NULL,
  noi_dung TEXT NOT NULL,
  nguoi_gui_id UUID REFERENCES users(id) ON DELETE SET NULL,
  lop_hoc_phan_id UUID REFERENCES lop_hoc_phan(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS thong_bao_nguoi_nhan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thong_bao_id UUID NOT NULL REFERENCES thong_bao(id) ON DELETE CASCADE,
  sinh_vien_id UUID REFERENCES sinh_vien(id) ON DELETE CASCADE,
  da_doc BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS tai_lieu (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lop_hoc_phan_id UUID NOT NULL REFERENCES lop_hoc_phan(id) ON DELETE CASCADE,
  ten_tai_lieu TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lich_su_xoa_lop_hoc_phan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lop_hoc_phan_id UUID NOT NULL,
  ma_lop VARCHAR(50),
  ten_hoc_phan TEXT,
  ten_giang_vien TEXT,
  so_luong_toi_da INT,
  so_luong_hien_tai INT,
  phong_hoc TEXT,
  ngay_hoc TEXT[],
  gio_hoc TEXT,
  ngay_bat_dau DATE,
  ngay_ket_thuc DATE,
  tong_so_tiet INT,
  dia_diem TEXT,
  nguoi_xoa UUID,
  thoi_gian_xoa TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- 7) WORKFLOW ĐỀ XUẤT/PHÊ DUYỆT
-- =========================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='de_xuat_hoc_phan') THEN
    BEGIN
      ALTER TABLE de_xuat_hoc_phan
        ADD COLUMN IF NOT EXISTS cap_duyet_hien_tai VARCHAR(20)
          CHECK (cap_duyet_hien_tai IN ('tro_ly_khoa','truong_khoa','pdt'));
      ALTER TABLE de_xuat_hoc_phan
        ALTER COLUMN trang_thai TYPE VARCHAR(30),
        ALTER COLUMN trang_thai SET DEFAULT 'cho_duyet';
    EXCEPTION WHEN duplicate_column THEN
      -- bỏ qua nếu cột đã tồn tại
      NULL;
    END;

    CREATE TABLE IF NOT EXISTS de_xuat_hoc_phan_log (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      de_xuat_id UUID NOT NULL REFERENCES de_xuat_hoc_phan(id) ON DELETE CASCADE,
      thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      hanh_dong VARCHAR(30) NOT NULL,   -- gui, duyet_tk, duyet_pdt, tra_ve_tk, tra_ve_tlk, tu_choi, chinh_sua
      nguoi_thuc_hien UUID REFERENCES users(id) ON DELETE SET NULL,
      ghi_chu TEXT
    );

    CREATE TABLE IF NOT EXISTS de_xuat_hoc_phan_gv (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      de_xuat_id UUID NOT NULL REFERENCES de_xuat_hoc_phan(id) ON DELETE CASCADE,
      giang_vien_id UUID REFERENCES giang_vien(id) ON DELETE SET NULL,
      so_lop_du_kien INTEGER CHECK (so_lop_du_kien > 0)
    );
  END IF;
END $$;

-- =========================================================
-- 8) INDEX GỢI Ý
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_sv_khoa ON sinh_vien(khoa_id);
CREATE INDEX IF NOT EXISTS idx_gv_khoa ON giang_vien(khoa_id);
CREATE INDEX IF NOT EXISTS idx_mon_khoa ON mon_hoc(khoa_id);
CREATE INDEX IF NOT EXISTS idx_lhp_hocphan ON lop_hoc_phan(hoc_phan_id);
CREATE INDEX IF NOT EXISTS idx_lhp_gv ON lop_hoc_phan(giang_vien_id);
CREATE INDEX IF NOT EXISTS idx_lhdk_lhp ON lich_hoc_dinh_ky(lop_hoc_phan_id);
CREATE INDEX IF NOT EXISTS idx_dkhp_sv ON dang_ky_hoc_phan(sinh_vien_id);
CREATE INDEX IF NOT EXISTS idx_dkhp_lhp ON dang_ky_hoc_phan(lop_hoc_phan_id);
CREATE INDEX IF NOT EXISTS idx_hocphi_sv ON hoc_phi(sinh_vien_id);
CREATE INDEX IF NOT EXISTS idx_payment_sv ON payment_transactions(sinh_vien_id);
CREATE INDEX IF NOT EXISTS idx_kyphase_hk_phase ON ky_phase(hoc_ky_id, phase) WHERE is_enabled;
CREATE INDEX IF NOT EXISTS idx_gd_hp_sv ON ghi_danh_hoc_phan(sinh_vien_id, hoc_phan_id);
