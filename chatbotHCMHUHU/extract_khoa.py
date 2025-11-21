import re
import json
import unicodedata

INPUT = "debug_extracted_text.txt"
OUTPUT = "khoa_to_bomon.json"


# ==========================
# 0. Chuẩn hoá Unicode
# ==========================
def normalize(text):
    return unicodedata.normalize("NFC", text).strip()


# ==========================
# 1. Trích liên hệ + văn phòng + nhiệm vụ
# ==========================
def extract_detail(text):
    text = normalize(text)

    sections = {
        "dien_thoai": "",
        "noi_bo": "",
        "email": "",
        "website": "",
        "van_phong_lam_viec": "",
        "nhiem_vu": []
    }

    # --- Điện thoại ---
    tel = re.search(r"Điện thoại[\s\w]*:\s*([\(\)0-9\- \/]+)", text)

    # --- Nội bộ ---
    noi_bo = re.search(r"(số nội bộ|nội bộ|số máy nội bộ):\s*([0-9, ]+)", text)

    # --- Email ---
    emails = re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)

    # --- Website ---
    website = re.search(r"(https?://[^\s]+|[A-Za-z0-9\-]+\.[A-Za-z]{2,})", text)

    # --- Văn phòng làm việc ---
    vp = re.search(r"Văn phòng làm việc\s*:?\s*(.+)", text)
    if vp:
        vp_content = [vp.group(1).strip()]
        after = text.split(vp.group(0))[1].split("\n")
        for ln in after:
            l = ln.strip()
            if l == "":
                continue
            # Nếu gặp sang mục khác thì dừng
            if re.match(r"(Điện thoại|Email|Website|Những công việc|Nhiệm vụ|Chức năng)", l):
                break
            # Nếu là bullet nhiệm vụ thì dừng
            if l.startswith(("–", "-", "•")):
                break
            vp_content.append(l)
        sections["van_phong_lam_viec"] = " ".join(vp_content).replace("  ", " ")

    # --- Nhiệm vụ ---
    nv_header = re.search(r"(Những công việc của đơn vị.+?|Chức năng:?|Nhiệm vụ:?)", text)
    if nv_header:
        nv_block = text.split(nv_header.group(0), 1)[1]
        lines = nv_block.split("\n")

        current = ""

        for ln in lines:
            l = ln.strip()
            if l == "":
                continue

            # sang mục khác → dừng
            if re.match(r"\d+\.", l):
                break
            if re.match(r"(Phòng |Khoa |Trung tâm|Viện )", l):
                break

            # nếu là dòng bullet mới
            if l.startswith(("–", "-", "•")):
                if current:
                    sections["nhiem_vu"].append(current.strip())
                current = l[1:].strip()  # bỏ dấu bullet
            else:
                # dòng tiếp theo thuộc nhiệm vụ trước đó
                current += " " + l

        if current:
            sections["nhiem_vu"].append(current.strip())

    # --- Gán các trường ---
    if tel:
        sections["dien_thoai"] = tel.group(1).strip()

    if noi_bo:
        sections["noi_bo"] = noi_bo.group(2).strip()

    if emails:
        sections["email"] = emails[0]

    if website:
        sections["website"] = website.group(1)

    return sections


# ==========================
# 2. Tách danh sách KHOA
# ==========================
def extract_khoa(text):
    text = normalize(text)

    # tìm tiêu đề mục
    start_pattern = (
        r"CÁC KHOA VÀ TỔ TRỰC THUỘC"
        r"[\s\S]{0,400}"
        r"CƠ SỞ CHÍNH"
    )

    start = re.search(start_pattern, text)
    if not start:
        print("Không tìm thấy mục CÁC KHOA VÀ TỔ TRỰC THUỘC TẠI CƠ SỞ CHÍNH.")
        return {}

    # cắt phần sau
    cut = text[start.end():]

    # mỗi khoa có dạng "1. Khoa ..."
    entries = re.split(r"\n\s*\d+\.\s*", cut)
    entries = entries[1:]  # bỏ prefix rác

    result = {}

    for e in entries:
        lines = e.strip().split("\n")
        if not lines:
            continue

        ten_khoa = lines[0].strip()

        if len(ten_khoa) < 3:
            continue

        content = "\n".join(lines[1:]).strip()

        result[ten_khoa] = {
            "loai": "khoa",
            **extract_detail(content)
        }

        # dừng khi sang phần khác
        if "CƠ SỞ 2" in ten_khoa.upper():
            break

    return result


# ==========================
# MAIN
# ==========================
def main():
    text = open(INPUT, "r", encoding="utf-8").read()
    data = extract_khoa(text)

    print("Số khoa tách được:", len(data))

    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("Đã xuất file JSON:", OUTPUT)


if __name__ == "__main__":
    main()
