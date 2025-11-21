import re
import json
import unicodedata

INPUT = "debug_extracted_text.txt"
OUTPUT = "phong_trungtam1.json"


# ==========================
# 0. Chuẩn hoá Unicode
# ==========================
def normalize(text):
    return unicodedata.normalize("NFC", text).strip()


# ==========================
# 1. Nhận diện loại đơn vị
# ==========================
def detect_type(name):
    n = normalize(name).lower()

    if n.startswith("phòng ") or "phòng " in n:
        return "phòng"
    if "trung tâm" in n:
        return "trung tâm"
    if n.startswith("viện ") or " viện " in n:
        return "viện"
    if "ký túc" in n or "kí túc" in n:
        return "ký túc xá"
    if "trạm y tế" in n:
        return "trạm y tế"
    if "thư viện" in n:
        return "thư viện"

    return "khác"


# ==========================
# 2. Trích thông tin liên hệ + văn phòng + công việc liên quan SV
# ==========================
def extract_detail(text):
    text = normalize(text)

    sections = {
        "dien_thoai": "",
        "noi_bo": "",
        "email": "",
        "website": "",
        "van_phong_lam_viec": "",
        "cong_viec_lien_quan_sinh_vien": []
    }

    # --- Điện thoại ---
    tel = re.search(r"Điện thoại[\s\w]*:\s*([\(\)0-9\- \/]+)", text)

    # --- Số nội bộ ---
    noi_bo = re.search(r"(số máy nội bộ|nội bộ):\s*([0-9, ]+)", text)

    # --- Email ---
    email = re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)

    # --- Website ---
    website = re.search(r"(https?://[^\s]+|[A-Za-z0-9\-]+\.[A-Za-z]{2,})", text)

    # --- Văn phòng làm việc ---
    vp = re.search(r"Văn phòng làm việc\s*:?\s*(.+)", text)
    if vp:
        vp_lines = [vp.group(1).strip()]
        after = text.split(vp.group(0))[1].split("\n")

        for ln in after:
            l = ln.strip()
            if l == "":
                continue
            if re.match(r"(Điện thoại|Email|Website|Những công việc|Nhiệm vụ|Chức năng)", l):
                break
            if l.startswith(("–", "-", "•")):
                break
            vp_lines.append(l)

        sections["van_phong_lam_viec"] = " ".join(vp_lines).replace("  ", " ")

    # --- Công việc liên quan sinh viên ---
    header = re.search(r"Những công việc của đơn vị liên quan đến sinh viên:", text)
    if header:
        block = text.split(header.group(0), 1)[1]
        lines = block.split("\n")

        current = ""

        for ln in lines:
            l = ln.strip()
            if l == "":
                continue

            # Nếu gặp sang mục khác
            if re.match(r"\d+\.", l):
                break
            if re.match(r"(Phòng |Khoa |Trung tâm|Viện )", l):
                break

            # Bullet mới
            if l.startswith(("–", "-", "•")):
                if current:
                    sections["cong_viec_lien_quan_sinh_vien"].append(current.strip())
                current = l[1:].strip()
            else:
                # dòng nối tiếp
                current += " " + l

        if current:
            sections["cong_viec_lien_quan_sinh_vien"].append(current.strip())

    # --- Gán liên hệ ---
    if tel:
        sections["dien_thoai"] = tel.group(1).strip()
    if noi_bo:
        sections["noi_bo"] = noi_bo.group(2).strip()
    if email:
        sections["email"] = email[0]
    if website:
        sections["website"] = website.group(1)

    return sections


# ==========================
# 3. Tách từng đơn vị
# ==========================
def extract_units(text):
    text = normalize(text)

    # xác định mục
    start_pattern = (
        r"CÁC PHÒNG, TRUNG TÂM VÀ TƯƠNG ĐƯƠNG"
        r"[\s\S]{0,400}"
        r"CƠ SỞ CHÍNH"
    )

    start = re.search(start_pattern, text)
    if not start:
        print("❌ Không tìm thấy mục.")
        return {}

    cut = text[start.end():]

    entries = re.split(r"\n\s*\d+\.\s", cut)
    entries = entries[1:]

    units = {}

    for e in entries:
        lines = e.split("\n")
        if not lines:
            continue

        name = lines[0].strip()
        detail = "\n".join(lines[1:]).strip()

        # Nếu là sang mục khác thì dừng
        check = (name + " " + detail).upper()
        if "CÁC KHOA VÀ TỔ TRỰC THUỘC" in check:
            break

        units[name] = {
            "loai": detect_type(name),
            **extract_detail(detail)
        }

    return units


# ==========================
# MAIN
# ==========================
def main():
    text = open(INPUT, "r", encoding="utf-8").read()
    units = extract_units(text)

    print("✔ Số đơn vị trích được:", len(units))

    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(units, f, ensure_ascii=False, indent=2)

    print("✔ Đã xuất JSON:", OUTPUT)


if __name__ == "__main__":
    main()
