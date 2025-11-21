import fitz
import json
import re
import sys

# ======================================================
# 1) THANG ĐIỂM 10 – TRANG 18 (3 BẢNG)
# ======================================================

def parse_thang_diem_block(text):
    """
    Parse 1 block thang điểm 10 từ đoạn text đã cắt sẵn.
    Dạng dữ liệu (theo raw text):
        Loại
        Thang điểm 10
        Thang điểm chữ
        Đạt
        8,5 – 10
        A
        7,8 – 8,4
        B+
        ...
        Không
        đạt
        3,0 – 3,9
        F+
        0,0 – 2,9
        F
    """
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    data = []

    current_loai = None
    last_score = None

    score_re = re.compile(r"^[\d,\. –\-]+$")   # ví dụ: "8,5 – 10"
    grade_re = re.compile(r"^[A-Z]\+?$")       # A, B+, F...

    for line in lines:
        # Loại
        if line == "Đạt":
            current_loai = "Đạt"
            last_score = None
            continue

        # Trường hợp "Không" / "Không đạt" / "Không \nđạt"
        if line.startswith("Không"):
            current_loai = "Không đạt"
            last_score = None
            # nếu chỉ là "Không" thì bỏ, đợi dòng "đạt"
            if line == "Không":
                continue
        if line == "đạt" and current_loai == "Không đạt":
            continue

        # Khoảng điểm
        if score_re.match(line):
            last_score = line
            continue

        # Điểm chữ
        if grade_re.match(line):
            if current_loai is not None and last_score is not None:
                data.append({
                    "Loại": current_loai,
                    "Thang điểm 10": last_score,
                    "Thang điểm chữ": line
                })
                last_score = None

    return data


def parse_thang_diem_trang18(raw):
    """
    Cắt trang 18 thành 3 đoạn:
    - k51 gốc (a)
    - đại cương (Đối với các học phần giáo dục đại cương...)
    - còn lại (Đối với các học phần còn lại)
    rồi gọi parse_thang_diem_block cho từng đoạn.
    """

    # Đoạn 1: a)4 Hệ thống ... đến trước "4 Điểm này đã được sửa đổi"
    m1 = re.search(
        r"a\)4 Hệ thống.*?như sau:\s+(.*?)\s+4 Điểm này đã được sửa đổi",
        raw,
        re.DOTALL
    )

    # Đoạn 2: từ "Đối với các học phần giáo dục đại cương..." đến trước "Đối với các học phần còn lại"
    m2 = re.search(
        r"Đối với các học phần giáo dục đại cương.*?Loại\s+Thang điểm 10\s+Thang điểm chữ\s+(.*?)\s+Đối với các học phần còn lại",
        raw,
        re.DOTALL
    )

    # Đoạn 3: từ "Đối với các học phần còn lại" đến hết trang
    m3 = re.search(
        r"Đối với các học phần còn lại\s+(.*)$",
        raw,
        re.DOTALL
    )

    k51_text = m1.group(1) if m1 else ""
    dc_text = m2.group(1) if m2 else ""
    cl_text = m3.group(1) if m3 else ""

    return {
        "k51": parse_thang_diem_block(k51_text) if k51_text else [],
        "dai_cuong": parse_thang_diem_block(dc_text) if dc_text else [],
        "con_lai": parse_thang_diem_block(cl_text) if cl_text else []
    }

# ======================================================
# 2) THANG ĐIỂM 4 – TRANG 20
# ======================================================

def parse_thang_diem_4(raw):
    """
    Dùng anchor từ câu:
    'điểm số như dưới đây:' tới ngay trước '4.'
    Đảm bảo không dính 'KHÓA 51'
    """
    m = re.search(
        r"điểm số như dưới đây:\s+(.*?)\s+4\.",
        raw,
        re.DOTALL | re.IGNORECASE
    )
    if not m:
        return []

    block = m.group(1)
    # Dạng:
    # Thang điểm chữ
    # Thang điểm 4
    # A
    # 4,0
    # B+
    # 3,5
    # ...

    lines = [l.strip() for l in block.split("\n") if l.strip()]
    data = []

    grade_re = re.compile(r"^[A-Z]\+?|F$")
    score_re = re.compile(r"^[\d,\.]+$")

    current_grade = None
    for line in lines:
        if grade_re.match(line):
            current_grade = line
            continue
        if current_grade and score_re.match(line):
            data.append({
                "Thang điểm chữ": current_grade,
                "Thang điểm 4": line
            })
            current_grade = None

    return data

# ======================================================
# 3) XẾP LOẠI HỌC LỰC – TRANG 21
# ======================================================

def parse_xep_loai_hoc_luc(raw):
    """
    Dò tới chỗ:
      'Xếp loại'
      'Thang điểm 4'
    Sau đó lấy 12 dòng tiếp theo: cặp (xếp loại, khoảng điểm)
    """
    lines = [l.strip() for l in raw.split("\n") if l.strip()]

    # Tìm vị trí header "Xếp loại"
    try:
        idx = lines.index("Xếp loại")
    except ValueError:
        return []

    # Sau "Xếp loại" là "Thang điểm 4", rồi tới:
    # Xuất sắc
    # Từ 3,6 đến 4,0
    # Giỏi
    # Từ 3,2 đến dưới 3,6
    # ...
    table_lines = lines[idx + 2 : idx + 2 + 12]  # 6 xếp loại * 2 dòng

    data = []
    for i in range(0, len(table_lines), 2):
        rank = table_lines[i]
        cond = table_lines[i + 1] if i + 1 < len(table_lines) else ""
        data.append({
            "Xếp loại": rank,
            "Thang điểm 4": cond
        })
    return data

# ======================================================
# 4) TRÌNH ĐỘ NĂM HỌC – TRANG 21
# ======================================================

def parse_trinh_do_nam_hoc(raw):
    """
    Dùng line-based, dựa trên các dòng:
    a) Sinh viên năm thứ nhất:
    N < M1;
    ...
    """
    lines = [l.rstrip() for l in raw.split("\n")]

    result = []
    current_title = None
    current_cond = None

    for i, line in enumerate(lines):
        line_strip = line.strip()
        if line_strip.startswith("a) Sinh viên năm thứ nhất"):
            current_title = "Sinh viên năm thứ nhất"
            current_cond = lines[i + 1].strip()
            result.append({"Phân loại": current_title, "Điều kiện": current_cond})
        elif line_strip.startswith("b) Sinh viên năm thứ hai"):
            current_title = "Sinh viên năm thứ hai"
            current_cond = lines[i + 1].strip()
            result.append({"Phân loại": current_title, "Điều kiện": current_cond})
        elif line_strip.startswith("c) Sinh viên năm thứ ba"):
            current_title = "Sinh viên năm thứ ba"
            current_cond = lines[i + 1].strip()
            result.append({"Phân loại": current_title, "Điều kiện": current_cond})
        elif "Sinh viên năm thứ tư" in line_strip:
            current_title = "Sinh viên năm thứ tư"
            current_cond = lines[i + 1].strip().rstrip(".")
            result.append({"Phân loại": current_title, "Điều kiện": current_cond})

    return result

# ======================================================
# 5) PHÂN BỔ TIẾT HỌC – TRANG 37 (đang đúng)
# ======================================================

def parse_phan_bo_tiet_hoc(raw):
    lines = [l.strip() for l in raw.split("\n") if l.strip()]

    buoi = ["Sáng"] * 5 + ["Chiều"] * 5

    idx_tiet = lines.index("Tiết")
    idx_tu = lines.index("Từ")
    idx_den = lines.index("Đến")

    tiet = lines[idx_tiet + 1 : idx_tiet + 11]
    tu = lines[idx_tu + 1 : idx_tu + 11]
    den = lines[idx_den + 1 : idx_den + 11]

    data = []
    for i in range(10):
        data.append({
            "Buổi": buoi[i],
            "Tiết": tiet[i],
            "Từ": tu[i],
            "Đến": den[i]
        })

    return data

def parse_thoi_gian_trang10(raw):
    """
    Bảng:
    Chương trình đào tạo | Thời gian học tập chuẩn | Thời gian học tập tối đa
    -> KHÔNG ăn vào chú thích và bảng 'Hình thức đào tạo'
    """
    lines = [l.strip() for l in raw.split("\n") if l.strip()]

    # tìm dòng chứa header 'Chương trình đào tạo'
    idx = None
    for i, l in enumerate(lines):
        if "Chương trình đào tạo" in l:
            idx = i
            break
    if idx is None:
        return []

    res = []
    i = idx + 1
    time_re = re.compile(r"^[\d,\.]+ năm học$")

    while i < len(lines):
        # gặp chú thích hoặc sang bảng khác thì dừng
        if lines[i].startswith("1 Khoản này") or "Hình thức đào tạo" in lines[i]:
            break

        desc_lines = []
        # gom mô tả chương trình (có thể vài dòng)
        while i < len(lines) and not time_re.match(lines[i]):
            if lines[i].startswith("1 Khoản này") or "Hình thức đào tạo" in lines[i]:
                break
            desc_lines.append(lines[i])
            i += 1

        if not desc_lines:
            break

        if i >= len(lines) or not time_re.match(lines[i]):
            break
        tg_chuan = lines[i]
        i += 1

        if i >= len(lines) or not time_re.match(lines[i]):
            break
        tg_toi_da = lines[i]
        i += 1

        desc = " ".join(desc_lines)
        # nếu lỡ dính header thì xóa
        desc = desc.replace("Thời gian học tập chuẩn", "") \
                   .replace("Thời gian học tập tối đa", "") \
                   .strip()

        # bỏ trường hợp chú thích
        if not desc or desc.startswith("1 Khoản này"):
            continue

        res.append({
            "Chương trình đào tạo": desc,
            "Thời gian học tập chuẩn": tg_chuan,
            "Thời gian học tập tối đa": tg_toi_da
        })

    return res


def parse_hinh_thuc_dao_tao_trang10(raw):
    """
    Chỉ parse bảng nhỏ, bỏ hoàn toàn bảng lớn.
    Bắt đầu từ dòng chứa 'Hình thức đào tạo'.
    Kết thúc khi dòng không còn 'năm học'.
    """

    lines = [l.strip() for l in raw.split("\n") if l.strip()]
    n = len(lines)

    # Tìm header thật
    start = None
    for i, l in enumerate(lines):
        if l == "Hình thức đào tạo":
            start = i
            break

    if start is None:
        return []

    # Sau header có 2 dòng tiêu đề:
    # Thời gian học tập chuẩn
    # Thời gian học tập tối đa
    i = start + 3
    result = []

    time_re = re.compile(r"^[\d\.,]+ năm học$", re.IGNORECASE)

    while i + 2 < n:
        ht = lines[i]
        t1 = lines[i + 1]
        t2 = lines[i + 2]

        # Thoát nếu không còn đúng mẫu time
        if not (time_re.match(t1) and time_re.match(t2)):
            break

        result.append({
            "Hình thức đào tạo": ht,
            "Thời gian học tập chuẩn": t1,
            "Thời gian học tập tối đa": t2
        })

        i += 3

    return result



# ======================================================
# 6) PHÂN LOẠI RÈN LUYỆN – TRANG 91 (đang đúng)
# ======================================================

def parse_ren_luyen(raw):
    pattern = r"(\d)\s+(Từ .*? điểm|Dưới .*? điểm)\s+(Xuất sắc|Tốt|Khá|Trung bình|Yếu|Kém)"
    matches = re.findall(pattern, raw)

    return [{"TT": tt, "Khung điểm": k.strip(), "Xếp loại": xl} for tt, k, xl in matches]

def ren_luyen_full():
    """
    Trả về JSON cố định của toàn bộ hệ thống đánh giá rèn luyện (trang 99–103).
    Dữ liệu lấy đúng theo cấu trúc đã xây sẵn.
    """
    return {
        "Phu_luc_1": {
            "I": {
                "Ten": "ĐÁNH GIÁ VỀ Ý THỨC THAM GIA HỌC TẬP",
                "Khung_diem": "0 đến 20 điểm",
                "a": {
                    "Ten": "Tinh thần và thái độ trong học tập",
                    "Khung_diem": "0 đến 3 điểm",
                    "Tieu_chi": [
                        {"Noi_dung": "Vào lớp học đúng giờ, tham gia các giờ học đầy đủ", "Diem": "1,5 điểm"},
                        {"Noi_dung": "Chuẩn bị bài tốt, ý thức trong giờ học nghiêm túc", "Diem": "1,5 điểm"}
                    ]
                },
                "b": {
                    "Ten": "Tham gia các hoạt động học thuật, hoạt động NCKH",
                    "Tieu_chi": [
                        {"Noi_dung": "Tham gia các hoạt động học thuật", "Diem": "3 điểm/hoạt động"},
                        {"Noi_dung": "Tham gia hoạt động NCKH", "Diem": "5 điểm/nghiên cứu"}
                    ]
                },
                "c": {
                    "Ten": "Tham gia các kỳ thi, cuộc thi",
                    "Tieu_chi": [
                        {"Noi_dung": "Cổ vũ các kỳ thi", "Diem": "1 điểm/hoạt động"},
                        {"Noi_dung": "Thi cấp khoa", "Diem": "3 điểm/hoạt động"},
                        {"Noi_dung": "Thi cấp Trường", "Diem": "4 điểm/hoạt động"},
                        {"Noi_dung": "Thi cấp tỉnh/thành trở lên", "Diem": "5 điểm/hoạt động"}
                    ]
                },
                "d": {
                    "Ten": "Kết quả học tập",
                    "Khung_diem": "0 đến 10 điểm",
                    "Xep_loai": [
                        {"Loai": "Xuất sắc", "Diem": "10 điểm"},
                        {"Loai": "Giỏi", "Diem": "8 điểm"},
                        {"Loai": "Khá", "Diem": "6 điểm"},
                        {"Loai": "Trung bình", "Diem": "5 điểm"},
                        {"Loai": "Yếu", "Diem": "3 điểm"},
                        {"Loai": "Kém", "Diem": "0 điểm"}
                    ]
                },
                "e": {"Ten": "Tinh thần vượt khó", "Khung_diem": "0 đến 3 điểm"},
                "f": {
                    "Ten": "Khen thưởng – kỷ luật",
                    "Khen_thuong": [
                        {"Cap": "Cấp khoa/phân hiệu", "Diem": "3 điểm/thành tích"},
                        {"Cap": "Cấp Trường", "Diem": "4 điểm/thành tích"},
                        {"Cap": "Cấp tỉnh/thành", "Diem": "5 điểm/thành tích"},
                        {"Cap": "Cấp Trung ương", "Diem": "6 điểm/thành tích"}
                    ],
                    "Ky_luat": [
                        {"Loai": "Không thực hiện khảo sát", "Diem": "-3 điểm/lần"},
                        {"Loai": "Vi phạm quy định kỳ thi", "Diem": None}
                    ]
                }
            },

            "II": {
                "Ten": "ĐÁNH GIÁ VỀ Ý THỨC CHẤP HÀNH NỘI QUY, QUY CHẾ",
                "Khung_diem": "0 đến 25 điểm",
                "a": {
                    "Ten": "Ý thức chấp hành nội quy",
                    "Tieu_chi": [
                        {"Noi_dung": "Không vi phạm quy chế", "Diem": "2 điểm"},
                        {"Noi_dung": "Vi phạm nội quy học đường", "Diem": "-3 điểm"},
                        {"Noi_dung": "ĐK mà không tham gia (khoa)", "Diem": "-3 điểm/lần"},
                        {"Noi_dung": "ĐK mà không tham gia (Trường)", "Diem": "-4 điểm/lần"},
                        {"Noi_dung": "Không nộp hồ sơ đúng hạn", "Diem": "-3 điểm/lần"},
                        {"Noi_dung": "Chấp hành tốt nội quy KTX", "Diem": "3 điểm"},
                        {"Noi_dung": "Chấp hành tốt ngoại trú", "Diem": "3 điểm"},
                        {"Noi_dung": "Tham gia BHYT đúng hạn", "Diem": "2 điểm"},
                        {"Noi_dung": "Không tham gia BHYT", "Diem": "-5 điểm"},
                        {"Noi_dung": "Khiển trách", "Diem": "-5 điểm"},
                        {"Noi_dung": "Cảnh cáo", "Diem": "-10 điểm"},
                        {"Noi_dung": "Đình chỉ học tập", "Ket_qua": "Rèn luyện Kém"},
                        {"Noi_dung": "Đóng lệ phí đúng hạn", "Diem": "3 điểm"}
                    ]
                },
                "b": {
                    "Ten": "Tuần sinh hoạt công dân",
                    "Xep_loai": [
                        {"Loai": "Đạt", "Diem": "10 điểm"},
                        {"Loai": "Không đạt", "Diem": "0 điểm"}
                    ]
                },
                "c": {
                    "Ten": "Đánh giá kết quả rèn luyện",
                    "Tieu_chi": [
                        {"Noi_dung": "Đánh giá đúng tiến độ", "Diem": "2 điểm"},
                        {"Noi_dung": "Sai quy định, không trung thực", "Diem": "-3 điểm"},
                        {"Noi_dung": "Không đánh giá", "Ket_qua": "Rèn luyện Kém"}
                    ]
                },
                "d": {"Ten": "Sinh hoạt lớp định kỳ", "Khung_diem": "0 đến 5 điểm"}
            },

            "III": {
                "Ten": "ĐÁNH GIÁ Ý THỨC THAM GIA HOẠT ĐỘNG CHÍNH TRỊ – XH",
                "Khung_diem": "0 đến 20 điểm",
                "a": {
                    "Ten": "Hoạt động chính trị – xã hội – VH – TDTT",
                    "Tieu_chi": [
                        {"Noi_dung": "Thành viên CLB", "Diem": "3 điểm/CLB"},
                        {"Noi_dung": "Cổ vũ hoạt động", "Diem": "1 điểm/hoạt động"},
                        {"Noi_dung": "Hội nghị/Đại hội/triệu tập", "Diem": "4 điểm/hoạt động"},
                        {"Noi_dung": "Không tham gia khi triệu tập", "Diem": "-4 điểm/hoạt động"},
                        {"Noi_dung": "Hoạt động cấp lớp", "Diem": "1 điểm/hoạt động"},
                        {"Noi_dung": "Hoạt động cấp khoa", "Diem": "2 điểm/hoạt động"},
                        {"Noi_dung": "Hoạt động cấp Trường", "Diem": "3 điểm/hoạt động"},
                        {"Noi_dung": "Cấp tỉnh/thành", "Diem": "4 điểm/hoạt động"}
                    ]
                },
                "b": {"Ten": "Hiến máu – công ích", "Diem": "3 điểm/hoạt động"},
                "c": {"Ten": "Tuyên truyền – phòng chống tội phạm", "Diem": "3 điểm/hoạt động"},
                "d": {"Ten": "Kết nạp Đoàn", "Diem": "2 điểm"},
                "e": {"Ten": "Kết nạp Đảng", "Diem": "3 điểm"},
                "f": {
                    "Ten": "Khen thưởng",
                    "Cap": [
                        {"Cap": "Cấp khoa", "Diem": "3 điểm/thành tích"},
                        {"Cap": "Cấp Trường", "Diem": "4 điểm/thành tích"},
                        {"Cap": "Cấp tỉnh/thành", "Diem": "5 điểm/thành tích"},
                        {"Cap": "Cấp Trung ương", "Diem": "6 điểm/thành tích"}
                    ]
                }
            },

            "IV": {
                "Ten": "ĐÁNH GIÁ Ý THỨC CÔNG DÂN TRONG CỘNG ĐỒNG",
                "Khung_diem": "0 đến 25 điểm",
                "a": {
                    "Ten": "Ý thức chấp hành pháp luật",
                    "Khung_diem": "0 đến 5 điểm",
                    "Tieu_chi": [
                        {"Noi_dung": "Chấp hành chủ trương Đảng", "Diem": "2,5 điểm"},
                        {"Noi_dung": "Tham gia tuyên truyền", "Diem": "2,5 điểm"}
                    ]
                },
                "b": {"Ten": "Tình nguyện vì cộng đồng", "Diem": "3 điểm"},
                "c": {
                    "Ten": "Khen thưởng vì cộng đồng",
                    "Cap": [
                        {"Loai": "Cấp lớp", "Diem": "2 điểm/hoạt động"},
                        {"Loai": "Cấp khoa", "Diem": "3 điểm/hoạt động"},
                        {"Loai": "Cấp Trường trở lên", "Diem": "4 điểm/hoạt động"},
                        {"Loai": "Thành tích cấp khoa", "Diem": "3 điểm/thành tích"},
                        {"Loai": "Thành tích cấp Trường", "Diem": "4 điểm/thành tích"},
                        {"Loai": "Thành tích cấp tỉnh/thành", "Diem": "5 điểm/thành tích"},
                        {"Loai": "Thành tích cấp Trung ương", "Diem": "6 điểm/thành tích"}
                    ]
                }
            },

            "V": {
                "Ten": "ĐÁNH GIÁ CÔNG TÁC LỚP – ĐOÀN – HỘI",
                "Khung_diem": "0 đến 10 điểm",
                "a": {"Ten": "Hỗ trợ hoạt động chung", "Diem": "3 điểm"},
                "b": {
                    "Ten": "Hoàn thành nhiệm vụ",
                    "Cap_1": [
                        {"Loai": "Xuất sắc", "Diem": "3 điểm"},
                        {"Loai": "Tốt", "Diem": "2 điểm"},
                        {"Loai": "Hoàn thành", "Diem": "1 điểm"},
                        {"Loai": "Không hoàn thành", "Diem": "-3 điểm"}
                    ],
                    "Cap_2": [
                        {"Loai": "Xuất sắc", "Diem": "4 điểm"},
                        {"Loai": "Tốt", "Diem": "3 điểm"},
                        {"Loai": "Hoàn thành", "Diem": "2 điểm"},
                        {"Loai": "Không hoàn thành", "Diem": "-5 điểm"}
                    ],
                    "Cap_3": [
                        {"Loai": "Xuất sắc", "Diem": "4 điểm"},
                        {"Loai": "Tốt", "Diem": "3 điểm"},
                        {"Loai": "Hoàn thành", "Diem": "2 điểm"},
                        {"Loai": "Không hoàn thành", "Diem": "-5 điểm"}
                    ]
                },
                "c": {
                    "Ten": "Thành tích đặc biệt",
                    "Danh_hieu": [
                        {"Loai": "Sinh viên 5 tốt", "Diem": "4 điểm"},
                        {"Loai": "Thanh niên tiên tiến", "Diem": "4 điểm"},
                        {"Loai": "Cán bộ Đoàn – Hội xuất sắc", "Diem": "4 điểm"},
                        {"Loai": "Sinh viên 5 tốt (tỉnh)", "Diem": "5 điểm"},
                        {"Loai": "NCKH cấp Thành", "Diem": "5 điểm"},
                        {"Loai": "Giấy khen Thành Đoàn", "Diem": "5 điểm"},
                        {"Loai": "Sinh viên 5 tốt (TW)", "Diem": "7 điểm"},
                        {"Loai": "Sao Tháng Giêng", "Diem": "7 điểm"},
                        {"Loai": "NCKH cấp Bộ (I–III)", "Diem": "7 điểm"},
                        {"Loai": "KK NCKH Bộ", "Diem": "6 điểm"},
                        {"Loai": "Bằng khen TW Đoàn", "Diem": "6 điểm"},
                        {"Loai": "Hoạt động xã hội nổi bật", "Diem": "6 điểm"}
                    ]
                }
            }
        }
    }


# ======================================================
# MAIN
# ======================================================

def main():
    pdf = "SO TAY SINH VIEN K51.pdf"

    try:
        doc = fitz.open(pdf)
    except Exception as e:
        print("Không mở được file PDF:", e)
        sys.exit(1)

    result = {}

    # lấy text các trang cần
    page18 = doc[17].get_text()
    page20 = doc[19].get_text()
    page21 = doc[20].get_text()
    page37 = doc[36].get_text()
    page91 = doc[90].get_text()
    page10 = doc[9].get_text()
    # --- Trang 10: thời gian đào tạo và hình thức đào tạo---
    result["thoi_gian_dai_hoc_k51_goc"] = parse_thoi_gian_trang10(page10)
    result["hinh_thuc_dao_tao"] = parse_hinh_thuc_dao_tao_trang10(page10)

    # --- Trang 18: 3 bảng thang điểm 10 ---
    td18 = parse_thang_diem_trang18(page18)
    result["thang_diem_10_k51"] = td18["k51"]
    result["thang_diem_10_dai_cuong"] = td18["dai_cuong"]
    result["thang_diem_10_con_lai"] = td18["con_lai"]

    # --- Trang 20: thang điểm 4 ---
    result["thang_diem_4"] = parse_thang_diem_4(page20)

    # --- Trang 21: xếp loại học lực  ---
    result["xep_loai_hoc_luc"] = parse_xep_loai_hoc_luc(page21)

    # --- Trang 37: phân bổ tiết học ---
    result["phan_bo_tiet_hoc"] = parse_phan_bo_tiet_hoc(page37)

    # --- Trang 91: phân loại rèn luyện ---
    result["phan_loai_ren_luyen"] = parse_ren_luyen(page91)
    
    # --- Trang 99-103: hệ thống đánh giá rèn luyện ---
    result["he_thong_danh_gia_ren_luyen"] = ren_luyen_full()

    doc.close()

    with open("bang.json", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=4)

    print("Xong. Kết quả lưu ở: bang.json")

if __name__ == "__main__":
    
    main()
