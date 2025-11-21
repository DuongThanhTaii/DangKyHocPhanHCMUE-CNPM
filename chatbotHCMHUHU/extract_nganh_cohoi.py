import re
import json

INPUT_FILE = "debug_extracted_text.txt"        # file text mày có rồi
OUTPUT_FILE = "majors_and_jobs.json"


def load_text(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def extract_sections(text):
    """
    Tách các ngành đào tạo dựa vào pattern tên ngành + mô tả + cơ hội việc làm.
    """

    # Regex tìm ngành (Ví dụ: "1. Ngành Sư phạm Toán", "Ngành Công nghệ Thông tin")
    major_pattern = r"(Ngành [A-ZÀ-Ỹa-z0-9 \-\(\)]+)"

    sections = re.split(major_pattern, text)

    majors = {}

    for i in range(1, len(sections), 2):
        major_name = sections[i].strip()
        content = sections[i+1].strip()

        # Tìm cơ hội nghề nghiệp
        career_pattern = r"(Cơ hội nghề nghiệp|Cơ hội việc làm|Vị trí việc làm)(:?)"
        career_split = re.split(career_pattern, content, maxsplit=1)

        if len(career_split) >= 4:
            description = career_split[0].strip()
            jobs = career_split[3].strip()
        else:
            description = content
            jobs = ""

        majors[major_name] = {
            "co_hoi_nghe_nghiep": jobs
        }

    return majors


def main():
    print("Đang load văn bản...")
    text = load_text(INPUT_FILE)

    print("Đang tách các ngành...")
    majors = extract_sections(text)

    print(f"Tìm được {len(majors)} ngành đào tạo.")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(majors, f, ensure_ascii=False, indent=2)

    print(f"Đã lưu file JSON: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
