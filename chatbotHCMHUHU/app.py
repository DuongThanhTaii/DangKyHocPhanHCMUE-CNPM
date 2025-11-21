from fastapi import FastAPI, HTTPException # ⬅️ THÊM import FastAPI
from pydantic import BaseModel # ⬅️ THÊM import BaseModel
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
from fuzzywuzzy import fuzz
from unidecode import unidecode
import pandas as pd
import json, os, re, sys


# ========================================
# 1️⃣ KHỞI TẠO & BIẾN TOÀN CỤC
# ========================================
app = FastAPI(title="Chatbot HCMUE RAG API", version="2.2") 
SYSTEM_STATUS = "OK" # ⬅️ KHAI BÁO BIẾN TRẠNG THÁI HỆ THỐNG

# ========================================
# 2️⃣ HÀM HỖ TRỢ (GIỮ NGUYÊN)
def remove_vietnamese_diacritics(text: str) -> str:
    """Loại bỏ dấu tiếng Việt và chuyển sang chữ thường."""
    return unidecode(text).lower()

def pretty(text: str) -> str:
    """Định dạng văn bản dễ đọc hơn."""
    text = re.sub(r"([;:.\)\]\}])\s*(?=[\+\-•–])", r"\1\n", text)
    text = re.sub(r"\s*([+\-•–])\s+", r"\n\1 ", text)
    text = re.sub(r"\s*(Điều\s+\d+\.)", r"\n\1", text, flags=re.IGNORECASE)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

def classify_query_intent(query: str) -> str:
    """Phân loại truy vấn là về Môn học hay Sổ tay."""
    normalized_query = remove_vietnamese_diacritics(query)
    course_phrases = [
        "lap trinh co ban", "co so toan", "toan roi rac", "thiet ke web",
        "duong loi quoc phong", "phap luat dai cuong", "triet hoc mac lenin",
        "tam ly hoc", "giao duc the chat", "lap trinh nang cao",
        "lap trinh huong doi tuong", "cong tac quoc phong", "kinh te chinh tri",
        "chu nghia xa hoi", "phuong phap nghien cuu khoa hoc", "giao duc doi song",
        "phuong phap hoc tap", "ky nang thich ung", "ky nang lam viec nhom",
        "cau truc du lieu", "co so du lieu", "lap trinh tren windows",
        "xac suat thong ke", "ly thuyet do thi", "quan su chung",
        "tu tuong ho chi minh", "kien truc may tinh", "nhap mon mang may tinh",
        "he dieu hanh", "phan tich va thiet ke giai thuat", "quy hoach tuyen tinh",
        "ky thuat chien dau", "lich su dang cong san", "nhap mon cong nghe phan mem",
        "phan tich thiet ke huong doi tuong", "tri tue nhan tao", "cac he co so du lieu",
        "thiet ke va quan ly mang lan", "phan tich va thiet ke he thong thong tin",
        "co so du lieu nang cao", "he thong ma nguon mo", "xu ly anh so",
        "quan tri co ban voi windows server", "nghi thuc giao tiep mang",
        "phat trien ung dung tren thiet bi di dong", "quan ly du an cong nghe thong tin",
        "kiem thu phan mem", "phat trien ung dung tro cho choi",
        "quy trinh phat trien phan mem agile", "he thong nhung", "hoc may",
        "lap trinh python", "lap trinh php", "thuc hanh nghe nghiep",
        "mang may tinh nang cao", "cong nghe web", "cong nghe java",
        "cac he co so tri thuc", "do hoa may tinh", "bao mat va an ninh mang",
        "logic mo", "cong nghe net", "chuyen de oracle", "truyen thong ky thuat so",
        "chuan doan va quan ly su co mang", "dinh tuyen mang nang cao",
        "quan tri mang voi linux", "quan tri dich vu mang",
        "he thong quan tri doanh nghiep", "xay dung du an cong nghe thong tin",
        "he tu van thong tin", "bao mat co so du lieu", "khai thac du lieu va ung dung",
        "lap trinh tien hoa", "cac phuong phap hoc thong ke",
        "lap rap cai dat va bao tri may tinh", "internet van vat", "nhap mon devops",
        "cong nghe chuoi khoi", "cac giai thuat tinh toan dai so",
        "khai thac du lieu van ban", "xu ly ngon ngu tu nhien", "ly thuyet ma hoa va mat ma",
        "thuc tap nghe nghiep", "khoi nghiep", "cong nghe phan mem nang cao",
        "cong nghe mang khong day", "thuong mai dien tu", "kiem thu phan mem nang cao",
        "dien toan dam may", "do hoa may tinh nang cao", "phan tich du lieu",
        "may hoc nang cao", "thi giac may tinh", "phan tich anh y khoa",
        "phat trien ung dung tren thiet bi di dong nang cao", "khoa luan tot nghiep",
        "ho so tot nghiep", "san pham nghien cuu",
        # Thêm các từ khóa mô tả ý định
        "mo ta mon", "thong tin mon", "hoc phan", "mon hoc", "hoc gi"
    ]

    strong_single_keywords = [
        "mon", "hoc phan", "lap trinh", "toan", "python", "java", "web",
        "du lieu", "ai", "linux", "windows", "thong ke", "do hoa", "bao mat",
        "mang", "phap luat", "triet hoc", "tam ly", "lich su", "kinh te",
        "phat trien", "thiet ke", "quantri", "server", "oracle", "devops",
        "agile", "khoi nghiep", "vat ly", "hoa hoc", "su pham", "tin hoc",
        "huong doi tuong"
    ]

    if any(phrase in normalized_query for phrase in course_phrases):
        return "COURSE"

    if len(normalized_query.split()) <= 4 and any(k in normalized_query for k in strong_single_keywords):
        return "COURSE"

    return "GENERAL"


# ========================================
# 3️⃣ CẤU HÌNH & TẢI MÔ HÌNH
# ========================================
DB_DIR = "./vector_store"
COLLECTION = "so_tay_hcmue"
TABLE_JSON = "./so_tay_all_tables_clean.json"
COURSE_JSON = "./mon_hoc_mo_ta.json"
MODEL_NAME = "BAAI/bge-m3"

try:
    print("🚀 Đang tải mô hình...")
    model = SentenceTransformer(MODEL_NAME)
    import torch
    torch.cuda.empty_cache()
    
    chromadb.api.client.SharedSystemClient._instance = None
    client = chromadb.PersistentClient(path=DB_DIR, settings=Settings())
    col = None
    
    if COLLECTION in [c.name for c in client.list_collections()]:
        col = client.get_collection(COLLECTION)
    else:
        col = client.create_collection(COLLECTION)

    # ⬇️⬇️ LOGIC TỰ ĐỘNG INDEXING (NẾU DB TRỐNG) ⬇️⬇️
    if col.count() == 0:
        print("⚠️ Collection trống. Đang kiểm tra dữ liệu và Indexing...")
        CHUNKS_PATH = "./chunks.txt" 
        if os.path.exists(CHUNKS_PATH):
            with open(CHUNKS_PATH, 'r', encoding='utf-8') as f:
                data = f.read().split('\n\n')
            
            documents = [chunk.strip() for chunk in data if chunk.strip()]
            
            if documents:
                metadatas = [{"source": "So_Tay_Chinh", "chunk_id": i} for i in range(len(documents))]
                ids = [f"doc_{i}" for i in range(len(documents))]
                
                print(f"Bắt đầu Indexing {len(documents)} tài liệu...")
                embeddings = model.encode(documents, normalize_embeddings=True).tolist() 
                
                col.add(
                    embeddings=embeddings,
                    documents=documents,
                    metadatas=metadatas,
                    ids=ids
                )
                print("✅ Indexing hoàn tất. Vector Database đã sẵn sàng.")
                torch.cuda.empty_cache()
            else:
                SYSTEM_STATUS = "CHUNK_FILE_EMPTY"
                print("❌ Tệp chunks.txt rỗng. Không thể tạo Vector DB.")
        else:
            SYSTEM_STATUS = "CHUNK_FILE_MISSING"
            print(f"❌ KHÔNG TÌM THẤY TỆP CHUNKS {CHUNKS_PATH}. Không thể tạo Vector DB.")
    # ⬆️⬆️ HẾT LOGIC TỰ ĐỘNG INDEXING ⬆️⬆️

except Exception as e:
    SYSTEM_STATUS = "INIT_ERROR"
    print(f"❌ Lỗi khởi tạo hệ thống: {e}")
    # Đặt các biến quan trọng thành None để tránh lỗi sau này
    col = None
    model = None


# 🌟 4️⃣ TẢI PHOGPT – MODEL SINH CÂU TỰ NHIÊN
# ========================================
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

try:
    print("🤖 Loading Gemma model for natural responses...")
    PHO_MODEL_ID = "google/gemma-2b-it"
    tok = AutoTokenizer.from_pretrained(PHO_MODEL_ID)
    mod = AutoModelForCausalLM.from_pretrained(PHO_MODEL_ID)
    llm = pipeline(
        "text-generation",
        model=mod,
        tokenizer=tok,
        device_map="auto",
        torch_dtype="auto",      # ✅ thêm dòng này
        do_sample=False,
        max_new_tokens=180,      # ✅ GIẢM XUỐNG
        temperature=0.3,
        top_p=0.9
    )
    print("✅ Gemma ready.")
except Exception as e:
    SYSTEM_STATUS = "LLM_LOAD_ERROR"
    llm = None
    print(f"❌ Error loading Gemma: {e}")

# ========================================
# 5️⃣ TẢI DỮ LIỆU JSON
# ========================================

def load_json(path):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

tables = load_json(TABLE_JSON)
courses = load_json(COURSE_JSON)
COURSE_DATA = {
    remove_vietnamese_diacritics(c["ten_mon"]): {
        "ten_mon": c["ten_mon"],
        "Description": c["Description"]
    }
    for c in courses
}

COURSE_STOPWORDS = {
    "mon", "monhoc", "hoc", "hocphan", "phan", "mo", "ta", "mota",
    "noi", "dung", "noidung", "la", "gi"
}

COURSE_ALIASES = {
    remove_vietnamese_diacritics("Giáo dục thể chất 1"): remove_vietnamese_diacritics("Giáo dục thể chất 1 (Thể dục - Điền kinh)"),
    remove_vietnamese_diacritics("Kỹ năng làm việc nhóm"): remove_vietnamese_diacritics("Kỹ năng làm việc nhóm và tư duy sáng tạo"),
    remove_vietnamese_diacritics("Lập trình trên thiết bị di động"): remove_vietnamese_diacritics("Phát triển ứng dụng trên thiết bị di động"),
    remove_vietnamese_diacritics("Lập trình trên thiết bị di động nâng cao"): remove_vietnamese_diacritics("Phát triển ứng dụng trên thiết bị di động nâng cao"),
    remove_vietnamese_diacritics("Kiến trúc máy tính"): remove_vietnamese_diacritics("Kiến trúc máy tính và hợp ngữ"),
    remove_vietnamese_diacritics("Kiến trúc máy tính và hợp ngữ"): remove_vietnamese_diacritics("Kiến trúc máy tính và hợp ngữ"),
    remove_vietnamese_diacritics("Lập trình windows"): remove_vietnamese_diacritics("Lập trình trên Windows"),
    remove_vietnamese_diacritics("Lập trình window"): remove_vietnamese_diacritics("Lập trình trên Windows"),
    remove_vietnamese_diacritics("Lập trình trên window"): remove_vietnamese_diacritics("Lập trình trên Windows"),
}

for alias_key, canonical_key in COURSE_ALIASES.items():
    canonical_course = COURSE_DATA.get(canonical_key)
    if canonical_course:
        COURSE_DATA.setdefault(alias_key, canonical_course)


def tokenize_course_key(text: str):
    raw_tokens = re.findall(r"[a-z0-9]+", text)
    seen = set()
    tokens = []
    for tok in raw_tokens:
        if not tok or tok in COURSE_STOPWORDS or tok in seen:
            continue
        tokens.append(tok)
        seen.add(tok)
    return tokens


COURSE_TOKENS = {k: tokenize_course_key(k) for k in COURSE_DATA}


def build_grade_lookup(table_data):
    out = {}
    for t in table_data:
        t_type = t.get("type")
        if t_type == "thang_diem_4":
            for row in t.get("data", []):
                key = str(row.get("Thang điểm chữ", "")).strip().upper()
                if not key:
                    continue
                out.setdefault(key, {})["thang_4"] = row.get("Thang điểm 4")
        elif t_type == "thang_diem_10_chu":
            for row in t.get("data", []):
                key = str(row.get("Thang điểm chữ", "")).strip().upper()
                if not key:
                    continue
                out.setdefault(key, {})["thang_10"] = row.get("Thang điểm 10")
    return out


GRADE_LOOKUP = build_grade_lookup(tables)


def parse_score_range(range_text: str):
    if not range_text:
        return None, None
    cleaned = unidecode(range_text).replace(",", ".")
    numbers = [
        float(num)
        for num in re.findall(r"\d+(?:\.\d+)?", cleaned)
    ]
    if not numbers:
        return None, None
    if len(numbers) == 1:
        return numbers[0], numbers[0]
    return min(numbers), max(numbers)


def build_grade_scale_lookups(table_data):
    ranges_10 = {}
    values_4 = {}
    for t in table_data:
        t_type = t.get("type")
        if t_type == "thang_diem_10_chu":
            for row in t.get("data", []):
                letter = str(row.get("Thang điểm chữ", "")).strip().upper()
                low, high = parse_score_range(row.get("Thang điểm 10"))
                if letter and low is not None:
                    ranges_10[letter] = (low, high if high is not None else low)
        elif t_type == "thang_diem_4":
            for row in t.get("data", []):
                letter = str(row.get("Thang điểm chữ", "")).strip().upper()
                val_text = str(row.get("Thang điểm 4", "")).strip()
                if not letter or not val_text:
                    continue
                try:
                    value = float(val_text.replace(",", "."))
                except ValueError:
                    continue
                values_4[letter] = value
    return ranges_10, values_4


GRADE_10_RANGES, GRADE_4_VALUES = build_grade_scale_lookups(tables)

PASS_THRESHOLD_10 = 4.0
PASS_THRESHOLD_4 = 1.0


def build_academic_class_lookup(table_data):
    lookup = {}
    for t in table_data:
        if t.get("type") == "xep_loai_hoc_luc":
            for row in t.get("data", []):
                label = str(row.get("Xếp loại", "")).strip()
                if not label:
                    continue
                key = remove_vietnamese_diacritics(label)
                lookup[key] = row
    return lookup


ACADEMIC_CLASS_LOOKUP = build_academic_class_lookup(tables)

PASSING_GRADES = {"A", "B+", "B", "C+", "C", "D+", "D"}
FAILING_GRADES = {"F+", "F"}
PASSING_GRADE_ORDER = ["A", "B+", "B", "C+", "C", "D+", "D"]
FAILING_GRADE_ORDER = ["F+", "F"]
PASSING_GRADE_ASC_ORDER = ["D", "D+", "C", "C+", "B", "B+", "A"]


def grade_letter_from_score(score: float, scale: int = 10):
    if score is None:
        return None
    if scale == 10:
        for letter, (low, high) in GRADE_10_RANGES.items():
            if low is None:
                continue
            upper = high if high is not None else low
            if low - 1e-6 <= score <= upper + 1e-6:
                return letter
    elif scale == 4:
        best_letter, best_diff = None, float("inf")
        for letter, value in GRADE_4_VALUES.items():
            diff = abs(value - score)
            if diff < best_diff:
                best_diff = diff
                best_letter = letter
        if best_letter is not None and best_diff <= 0.51:  # tolerate rounding on scale 4
            return best_letter
    return None


def is_passing_letter(letter: str):
    if not letter:
        return False
    return letter in PASSING_GRADES


def is_passing_score(score: float, scale: int = 10):
    if score is None:
        return False
    if scale == 10:
        return score >= PASS_THRESHOLD_10 - 1e-6
    if scale == 4:
        return score >= PASS_THRESHOLD_4 - 1e-6
    return False


def extract_numeric_scores(normalized_q: str):
    if not normalized_q:
        return []
    normalized = normalized_q.replace(",", ".")
    values = []
    for match in re.finditer(r"\d+(?:\.\d+)?", normalized):
        start = match.start()
        snippet_start = max(0, start - 15)
        prefix = normalized[snippet_start:start].strip()
        if prefix.endswith("thang") or prefix.endswith("thang diem"):
            # skip the scale value (ví dụ: thang 10)
            continue
        try:
            values.append(float(match.group()))
        except ValueError:
            continue
    return values


PASS_QUERY_BLOCKERS = ["xep loai", "gioi", "kha", "trung binh", "xuat sac", "yeu", "kem"]
PASS_QUERY_KEYWORDS = [
    "qua mon", "dat mon", "dat hoc phan", "dat tin chi", "dat khong", "dat duoc", "du dieu kien", "qua duoc mon"
]


def is_general_pass_requirement_query(normalized_q: str):
    if not normalized_q:
        return False
    if any(word in normalized_q for word in PASS_QUERY_BLOCKERS):
        return False
    if "xep loai" in normalized_q:
        return False
    if "diem" not in normalized_q:
        return False
    if any(keyword in normalized_q for keyword in PASS_QUERY_KEYWORDS):
        return True
    if "bao nhieu diem" in normalized_q and "dat" in normalized_q:
        return True
    if re.search(r"diem\s+\d", normalized_q) and "qua" in normalized_q:
        return True
    return False


def format_score_text(value: float):
    if value is None:
        return ""
    return f"{value:.1f}".replace(".", ",")


def handle_pass_requirement_query(question: str, normalized_q: str):
    numeric_scores = extract_numeric_scores(normalized_q)
    if not numeric_scores:
        return {
            "type": "natural_table",
            "natural_answer": (
                "Theo sổ tay: Để qua môn, sinh viên cần đạt tối thiểu 4,0 điểm thang 10 (tương đương điểm chữ D) "
                "– tương ứng 1,0 điểm thang 4 trở lên."
            ),
        }

    score = numeric_scores[0]
    prefers_thang10 = ("thang diem 10" in normalized_q) or ("thang 10" in normalized_q) or score > 4
    prefers_thang4 = ("thang diem 4" in normalized_q) or ("thang 4" in normalized_q) or (score <= 4 and not prefers_thang10)

    if prefers_thang10:
        letter = grade_letter_from_score(score, 10)
        passing = is_passing_score(score, 10) or is_passing_letter(letter)
        letter_text = f" tương đương điểm chữ {letter}" if letter else ""
        status_text = "được xem là đạt vì đạt mức tối thiểu 4,0" if passing else "chưa đủ điều kiện vì dưới mức 4,0"
        return {
            "type": "natural_table",
            "natural_answer": (
                f"Theo sổ tay: {format_score_text(score)} điểm thang 10{letter_text}, {status_text}."
            ),
        }

    if prefers_thang4:
        letter = grade_letter_from_score(score, 4)
        passing = is_passing_score(score, 4) or is_passing_letter(letter)
        letter_text = f" tương đương điểm chữ {letter}" if letter else ""
        status_text = "được xem là đạt vì đạt mức tối thiểu 1,0" if passing else "chưa đủ điều kiện vì dưới mức 1,0"
        return {
            "type": "natural_table",
            "natural_answer": (
                f"Theo sổ tay: {format_score_text(score)} điểm thang 4{letter_text}, {status_text}."
            ),
        }

    # fallback chung nếu không xác định được thang
    passing = is_passing_score(score, 10) or is_passing_score(score, 4)
    status_text = "được xem là đạt" if passing else "chưa đủ điều kiện để qua môn"
    return {
        "type": "natural_table",
        "natural_answer": (
            f"Theo sổ tay: Điểm {format_score_text(score)} {status_text}. Mức tối thiểu là 4,0 thang 10 hoặc 1,0 thang 4."
        ),
    }


def build_scholarship_lookup(table_data):
    lookup = {}
    current_key = None
    current_label = None
    for t in table_data:
        if t.get("type") != "yeu_cau_hoc_bong":
            continue
        for row in t.get("data", []):
            raw_label = str(row.get("Loại học bổng", "")).strip()
            if raw_label:
                current_label = raw_label
                current_key = remove_vietnamese_diacritics(raw_label)
                lookup.setdefault(current_key, {"label": raw_label, "combos": []})
            if not current_key:
                continue
            academic = str(row.get("Yêu cầu", "")).strip()
            conduct = str(row.get("", "")).strip()
            if not academic and not conduct:
                continue
            # Bỏ qua dòng tiêu đề phụ
            if academic.lower().startswith("kết quả"):
                continue
            lookup[current_key]["combos"].append({"academic": academic, "conduct": conduct})
    return lookup


def parse_training_range(range_text: str):
    if not range_text:
        return None, None, True
    normalized_text = unidecode(range_text).lower()
    cleaned_numbers = range_text.replace(",", ".")
    numbers = [float(num.replace(",", ".")) for num in re.findall(r"\d+(?:[.,]\d+)?", cleaned_numbers)]
    min_score, max_score = None, None
    max_inclusive = True
    if "tu" in normalized_text:
        if numbers:
            min_score = numbers[0]
        if "den duoi" in normalized_text:
            if len(numbers) >= 2:
                max_score = numbers[1]
                max_inclusive = False
        elif "den" in normalized_text:
            if len(numbers) >= 2:
                max_score = numbers[1]
                max_inclusive = True
    elif normalized_text.strip().startswith("duoi"):
        if numbers:
            max_score = numbers[0]
            max_inclusive = False
            min_score = 0.0
    elif normalized_text.strip().startswith("tren"):
        if numbers:
            min_score = numbers[0]
            max_score = None
            max_inclusive = True
    return min_score, max_score, max_inclusive


def build_training_rank_lookup(table_data):
    ranks = {}
    for t in table_data:
        if t.get("type") != "xep_loai_hoc_bong":
            continue
        for row in t.get("data", []):
            label = str(row.get("Xếp loại", "")).strip()
            range_text = str(row.get("Khung điểm", "")).strip()
            if not label or not range_text:
                continue
            key = remove_vietnamese_diacritics(label)
            min_score, max_score, max_inclusive = parse_training_range(range_text)
            ranks[key] = {
                "label": label,
                "range": range_text,
                "min_score": min_score,
                "max_score": max_score,
                "max_inclusive": max_inclusive,
            }
    return ranks


SCHOLARSHIP_LOOKUP = build_scholarship_lookup(tables)
TRAINING_RANK_LOOKUP = build_training_rank_lookup(tables)


def determine_training_rank(score: float):
    if score is None:
        return None
    for info in TRAINING_RANK_LOOKUP.values():
        min_score = info.get("min_score")
        max_score = info.get("max_score")
        max_inclusive = info.get("max_inclusive", True)
        if min_score is not None and score + 1e-9 < min_score:
            continue
        if max_score is None:
            return info
        if max_inclusive:
            if score <= max_score + 1e-9:
                return info
        else:
            if score + 1e-9 < max_score:
                return info
    return None

GENERAL_SCHOLARSHIP_CONDITIONS = (
    "Theo sổ tay: Điều kiện để được xét học bổng khuyến khích học tập gồm:\n"
    "- Là sinh viên hệ chính quy đúng tiến độ khoá học (không xét cho sinh viên quá thời gian học tập chuẩn).\n"
    "- Kết quả học tập và rèn luyện của học kỳ đạt từ loại Khá trở lên, không bị kỷ luật từ mức khiển trách trở lên.\n"
    "- Tích lũy tối thiểu 15 tín chỉ trong học kỳ xét học bổng (không tính tín chỉ trả nợ, cải thiện hoặc tương đương).\n"
    "- Tất cả tín chỉ đăng ký trong học kỳ phải đạt (không nợ môn).\n"
    "- Học kỳ cuối: khoá 2022 trở đi tích lũy từ 11 tín chỉ; khoá 2021 trở về trước tích lũy từ 6 tín chỉ."
)


def parse_min_bound(range_text: str):
    if not range_text:
        return None
    cleaned = range_text.replace(",", ".")
    numbers = re.findall(r"\d+(?:\.\d+)?", cleaned)
    if numbers:
        try:
            return float(numbers[0])
        except ValueError:
            return None
    if "dưới" in range_text.lower():
        return 0.0
    return None


ACADEMIC_MIN_POINTS = {
    key: parse_min_bound(row.get("Thang điểm 4"))
    for key, row in ACADEMIC_CLASS_LOOKUP.items()
}

TRAINING_MIN_POINTS = {
    key: parse_min_bound(info.get("range"))
    for key, info in TRAINING_RANK_LOOKUP.items()
}


def format_decimal(value: float):
    if value is None:
        return None
    if abs(value - int(value)) < 1e-6:
        return str(int(value))
    return f"{value:.1f}".replace(".", ",")


def normalize_label_key(label: str):
    return remove_vietnamese_diacritics(label or "").strip()


def base_label_key(label: str):
    key = normalize_label_key(label)
    if key.endswith(" tro len"):
        key = key.replace(" tro len", "").strip()
    return key


def describe_academic_requirement(label: str):
    if not label:
        return None
    key = normalize_label_key(label)
    min_point = ACADEMIC_MIN_POINTS.get(key)
    min_txt = format_decimal(min_point)
    if min_txt:
        return f"Điểm học tập {label.lower()} (GPA thang 4 từ {min_txt} trở lên)"
    return f"Điểm học tập {label.lower()}"


def describe_conduct_requirement(label: str):
    if not label:
        return None
    key = base_label_key(label)
    min_point = TRAINING_MIN_POINTS.get(key)
    min_txt = format_decimal(min_point)
    if min_txt:
        return f"Điểm rèn luyện {label.lower()} (từ {min_txt} điểm trở lên)"
    return f"Điểm rèn luyện {label.lower()}"


def get_scholarship_level_details(level_key: str):
    entry = SCHOLARSHIP_LOOKUP.get(level_key)
    if not entry:
        return None, []
    combos = []
    for combo in entry.get("combos", []):
        academic_label = combo.get("academic")
        conduct_label = combo.get("conduct")
        academic_key = normalize_label_key(academic_label)
        conduct_key = base_label_key(conduct_label)
        academic_min = ACADEMIC_MIN_POINTS.get(academic_key)
        conduct_min = TRAINING_MIN_POINTS.get(conduct_key)
        combos.append({
            "academic_label": academic_label,
            "academic_min": academic_min,
            "academic_desc": describe_academic_requirement(academic_label),
            "conduct_label": conduct_label,
            "conduct_min": conduct_min,
            "conduct_desc": describe_conduct_requirement(conduct_label),
        })
    return entry.get("label"), combos


SCHOLARSHIP_LEVEL_PATTERNS = {
    "xuat sac": r"xuat\s*sac",
    "gioi": r"\bgioi\b",
    "kha": r"\bkha\b",
    "trung binh": r"trung\s*binh",
}

SCHOLARSHIP_LEVEL_LABELS = {
    "xuat sac": "Xuất sắc",
    "gioi": "Giỏi",
    "kha": "Khá",
    "trung binh": "Trung bình",
}


def detect_scholarship_level(normalized_q: str):
    for key, pattern in SCHOLARSHIP_LEVEL_PATTERNS.items():
        if re.search(pattern, normalized_q):
            return key
    return None


def is_scholarship_no_debt_query(normalized_q: str):
    return "hoc bong" in normalized_q and any(kw in normalized_q for kw in ["no mon", "no hoc phan", "no tin chi"])


def is_poor_conduct_query(normalized_q: str):
    return "hoc bong" in normalized_q and "ren luyen" in normalized_q and "trung binh" in normalized_q


def detect_academic_class_key(normalized_q: str):
    if not normalized_q:
        return None
    for key in ACADEMIC_CLASS_LOOKUP.keys():
        if re.search(rf"xep\s+loai\s+{key}\b", normalized_q):
            return key
    if "xep" in normalized_q:
        for key in ACADEMIC_CLASS_LOOKUP.keys():
            if re.search(rf"\bloai\s+{key}\b", normalized_q):
                return key
    return None


def is_minimum_credit_query(normalized_q: str):
    if not normalized_q:
        return False
    if "tin chi" not in normalized_q and "tin" not in normalized_q:
        return False
    return any(phrase in normalized_q for phrase in ["toi thieu bao nhieu", "toi thieu bao nhieu tin", "toi thieu bao nhieu tin chi", "hoc toi thieu", "dang ky toi thieu"]) or (
        "toi thieu" in normalized_q and "tin" in normalized_q
    )

# ========================================
# 6️⃣ TRA CỨU BẢNG / MÔN / VECTOR
# ========================================

def find_table_by_keyword(query: str):
    normalized_query = remove_vietnamese_diacritics(query)

    # 🚫 Nếu người dùng hỏi "điều kiện xét học bổng" → KHÔNG tra bảng
    if "hoc bong" in normalized_query and any(kw in normalized_query for kw in ["dieu kien", "tieu chi", "xet", "tieu chuan", "nhan"]):
        return None

    # 3️⃣ Nếu không hỏi cụ thể → tra bảng như cũ
    mapping = {
        "4 sang chu": ["thang_diem_4"],
        "hoc bong": ["xep_loai_hoc_bong"],
        "chu sang 10": ["thang_diem_10_chu"],
        "xep loai hoc luc": ["xep_loai_hoc_luc"],
        "yeu cau hoc bong": ["yeu_cau_hoc_bong"],
        "diem ren luyen": [
            "diem_ren_luyen1", "diem_ren_luyen2",
            "diem_ren_luyen3", "diem_ren_luyen4", "diem_ren_luyen5"
        ]
    }

    best_key, best_score = None, 0
    BEST_MATCH_THRESHOLD = 85

    for k in mapping.keys():
        score = max(
            fuzz.WRatio(normalized_query, k),
            fuzz.partial_ratio(normalized_query, k),
            fuzz.token_set_ratio(normalized_query, k)
        )
        if score > best_score and score >= BEST_MATCH_THRESHOLD:
            best_score = score
            best_key = k

    if not best_key:
        return None

    out = [f"### 📊 Kết quả tra cứu Bảng (Độ khớp: {best_score}%)"]
    for type_name in mapping[best_key]:
        for t in tables:
            if t.get("type") == type_name:
                df = pd.DataFrame(t["data"])
                title = t.get("title", type_name.replace("_", " ").title())
                out.append(f"#### {title}\n{df.to_html(index=False)}")
    return "\n".join(out) if len(out) > 1 else None



def find_course_by_fuzzy_match(query: str):
    qn = remove_vietnamese_diacritics(query)
    token_set = set(tokenize_course_key(qn))

    if token_set:
        token_matches = []
        for key, tokens in COURSE_TOKENS.items():
            token_len = len(tokens)
            if token_len < 2:
                continue
            if all(tok in token_set for tok in tokens):
                token_matches.append((len(tokens), COURSE_DATA[key]))
        if token_matches:
            token_matches.sort(reverse=True, key=lambda item: item[0])
            best_course = token_matches[0][1]
            return {
                "ten_mon": best_course["ten_mon"],
                "description": best_course["Description"],
                "match_score": 100,
            }

        partial_best_course = None
        partial_best_metrics = (-1.0, -1, -1)
        for key, tokens in COURSE_TOKENS.items():
            token_len = len(tokens)
            if token_len < 2:
                continue
            overlap = token_set.intersection(tokens)
            if not overlap:
                continue
            token_count = token_len
            overlap_size = len(overlap)
            coverage = overlap_size / token_count if token_count else 0
            required_overlap = 3 if token_count >= 5 else 2
            if token_count >= 8:
                coverage_threshold = 0.45
            elif token_count >= 5:
                coverage_threshold = 0.5
            else:
                coverage_threshold = 0.6
            if overlap_size < required_overlap or coverage < coverage_threshold:
                continue
            metrics = (coverage, overlap_size, -token_count)
            if metrics > partial_best_metrics:
                partial_best_metrics = metrics
                partial_best_course = COURSE_DATA[key]
        if partial_best_course:
            coverage = partial_best_metrics[0]
            best_course = partial_best_course
            return {
                "ten_mon": best_course["ten_mon"],
                "description": best_course["Description"],
                "match_score": int(coverage * 100),
            }

    direct_matches = []
    for key, course in COURSE_DATA.items():
        if key and (key in qn or qn in key):
            direct_matches.append((len(key), course))
    if direct_matches:
        direct_matches.sort(reverse=True, key=lambda item: item[0])
        best_course = direct_matches[0][1]
        return {
            "ten_mon": best_course["ten_mon"],
            "description": best_course["Description"],
            "match_score": 100,
        }

    best_score, best_course = 0, None
    for key, course in COURSE_DATA.items():
        score = max(
            fuzz.token_set_ratio(qn, key),
            fuzz.WRatio(qn, key),
            fuzz.partial_ratio(qn, key)
        )
        if score > best_score:
            best_score, best_course = score, course
    if best_course and best_score >= 80:
        return {
            "ten_mon": best_course["ten_mon"],
            "description": best_course["Description"],
            "match_score": best_score,
        }
    return None

def enrich_query_with_keywords(query: str) -> str:
    q_lower = query.lower()
    if "học bổng" in q_lower or "hoc bong" in q_lower:
        query += " điều kiện học bổng, quy định học bổng, tiêu chí học bổng"
    elif "tốt nghiệp" in q_lower or "tot nghiep" in q_lower:
        query += (
            " công nhận tốt nghiệp, xét tốt nghiệp, điều kiện xét tốt nghiệp, quy định công nhận tốt nghiệp, "
            "hoàn thành chương trình đào tạo, đủ tín chỉ, điểm rèn luyện, chuẩn đầu ra, học phần bắt buộc, học phần tự chọn"
        )
    elif "rèn luyện" in q_lower or "ren luyen" in q_lower:
        query += " tiêu chí điểm rèn luyện, điều kiện điểm rèn luyện, xếp loại điểm rèn luyện"
    return query



def vector_search(query: str, top_k=1):
    if col is None or model is None:
        raise Exception("Vector DB hoặc Model chưa khởi tạo.")
    
    q_emb = model.encode(enrich_query_with_keywords(query), normalize_embeddings=True).tolist()
    res = col.query(
        query_embeddings=[q_emb],
        include=["documents", "metadatas", "distances"],  # thêm distances
        where={"source": {"$eq": "So_Tay_Chinh"}},
        n_results=top_k,
    )

    docs = (res.get("documents") or [[]])[0]
    metas = (res.get("metadatas") or [[]])[0]
    dists = (res.get("distances") or [[]])[0]

    out = []
    for i, d in enumerate(docs):
        if d and d.strip():
            out.append({
                "chunk": pretty(d),
                "source": (metas[i] or {}).get("source", "So_Tay"),
                "distance": dists[i] if i < len(dists) else None
            })
    return out


# ===== Helper bắt buộc: đặt gần generate_natural_answer =====
import re

TIME_PAT = r"(\d{1,2})g(\d{2})"
PERIOD_LINE_PAT = re.compile(
    rf"Tiết\s*(\d+)\s*:\s*từ\s*{TIME_PAT}\s*đến\s*{TIME_PAT}",
    flags=re.IGNORECASE
)

def extract_period_times(ctx: str):
    """
    Quét context để gom giờ của từng 'Tiết X'.
    Trả về: { int: {'start':'10g40','end':'11g30'} }
    """
    out = {}
    for m in PERIOD_LINE_PAT.finditer(ctx or ""):
        period = int(m.group(1))
        start = f"{m.group(2)}g{m.group(3)}"
        end   = f"{m.group(4)}g{m.group(5)}"
        out[period] = {"start": start, "end": end}
    return out

# ===== MINI-CACHE cho giờ học =====
_period_cache = {}


def parse_time_label(label: str):
    match = re.match(r"^(\d{1,2})g(\d{2})$", label or "")
    if not match:
        return None
    hour = int(match.group(1))
    minute = int(match.group(2))
    return hour * 60 + minute


def format_duration(minutes: int):
    if minutes is None or minutes < 0:
        return None
    hours = minutes // 60
    mins = minutes % 60
    parts = []
    if hours:
        parts.append(f"{hours} giờ")
    if mins:
        parts.append(f"{mins} phút")
    return " ".join(parts) if parts else "0 phút"

def get_period_times():
    """
    Lấy giờ từng tiết từ cache; nếu chưa có thì đọc từ chunks hoặc query vector 1 lần.
    """
    global _period_cache
    if _period_cache:
        return _period_cache
    try:
        # Ưu tiên lấy từ file chunks.txt (nếu có)
        if os.path.exists("./chunks.txt"):
            with open("./chunks.txt", "r", encoding="utf-8") as f:
                raw = f.read()
            _period_cache = extract_period_times(raw)
        else:
            # fallback: query vector
            res = vector_search("thời khóa biểu", top_k=3)
            ctx = "\n".join([r["chunk"] for r in res]) if res else ""
            _period_cache = extract_period_times(ctx)
    except Exception:
        _period_cache = {}
    return _period_cache


def compute_break_duration(period_a: int, period_b: int):
    periods = get_period_times()
    if not periods:
        return None
    data_a = periods.get(period_a)
    data_b = periods.get(period_b)
    if not data_a or not data_b:
        return None
    end_minutes = parse_time_label(data_a.get("end"))
    start_minutes = parse_time_label(data_b.get("start"))
    if end_minutes is None or start_minutes is None:
        return None
    return start_minutes - end_minutes

def question_targets_period(question: str):
    m = re.search(r"tiết\s*(\d+)", (question or "").lower())
    return int(m.group(1)) if m else None

def extract_bullets(ctx: str):
    """
    Trích tất cả dòng bullet có dạng -, +, •, a), 1., 1) ...
    Trả về list đã loại trùng.
    """
    lines = []
    for line in (ctx or "").splitlines():
        l = line.strip()
        if not l: 
            continue
        if l.startswith(("-", "+", "•")):
            lines.append(l.lstrip("-+•").strip())
        elif re.match(r"^\(?[a-zA-Z]\)\s+", l):        # a) b) c)
            lines.append(l)
        elif re.match(r"^\d+[\.\)]\s+", l):            # 1. 2) 3.
            lines.append(l)
    # unique (case-insensitive)
    seen, uniq = set(), []
    for l in lines:
        k = l.lower()
        if k not in seen:
            uniq.append(l)
            seen.add(k)
    return uniq

def is_scholarship_condition_query(q: str):
    qn = (q or "").lower()
    # các cụm phổ biến khi hỏi điều kiện xét học bổng
    return ("học bổng" in qn or "hoc bong" in qn) and any(k in qn for k in [
        "điều kiện", "dieu kien", "tiêu chuẩn", "tieu chuan", "xét", "xet"
    ])

def has_bullet(text: str):
    return bool(re.search(r"(^\s*[-+•*]\s)|(^\s*\(?[a-zA-Z0-9]+\)|^\s*\d+[\.\)])", text, flags=re.MULTILINE))

def too_short(text: str, min_words: int = 35):
    return len((text or "").split()) < min_words


GRADE_TOKEN_PATTERN = re.compile(r"(?<![A-Z])([A-F](?:\+|-)?) (?=$|[^A-Z0-9])", re.VERBOSE)


def extract_grade_token(text: str):
    if not text:
        return None
    upper_text = unidecode(text).upper()
    for token in ["F+", "D+", "C+", "B+", "A+"]:
        if token in upper_text:
            return token
    tokens = GRADE_TOKEN_PATTERN.findall(upper_text)
    for token in tokens:
        if token in GRADE_LOOKUP or token in PASSING_GRADES or token in FAILING_GRADES:
            return token
    return None
# ===== End helper =====


# 7️⃣ HÀM SINH CÂU TRẢ LỜI TỰ NHIÊN (v5 – guardrail Học bổng + Giờ/tiết)
# ======================================================================
def generate_natural_answer(question: str, context: str) -> str:
    """
    Mục tiêu:
    - Hỏi 'Tiết X' -> trả giờ chính xác từ context (regex), tránh sai số liệu.
    - Hỏi 'điều kiện học bổng' -> liệt kê ĐỦ ý từ context, không thiếu bullet.
    - Còn lại -> LLM sinh tự nhiên, có hậu kiểm & fallback nếu thiếu.
    """
    if llm is None:
        return pretty(context) if context else "Xin lỗi, sổ tay chưa sẵn sàng."

    # Gọn context để tránh loãng
    ctx = (context or "").strip()
    if len(ctx) > 3000:
        ctx = ctx[:3000]

    # ===== 1) Guardrail GIỜ/TIẾT: tách rõ tiết cụ thể và ca học
    periods = extract_period_times(ctx)
    asked_period = question_targets_period(question)
    q_lower = question.lower()
    normalized_q = remove_vietnamese_diacritics(question)

    # Nếu hỏi về "buổi sáng"/"buổi chiều" mà KHÔNG có số tiết
    if asked_period is None and any(k in q_lower for k in ["vào học", "bắt đầu", "giờ học"]):
        if "sáng" in q_lower:
            return "Theo sổ tay: Buổi sáng bắt đầu từ 07g00 nhé "
        elif "chiều" in q_lower:
            return "Theo sổ tay: Buổi chiều bắt đầu từ 13g30 nhé "
        else:
            return "Theo sổ tay: Giờ vào học buổi sáng là 07g00 và buổi chiều là 13g30 "

    # Nếu hỏi về tiết cụ thể
    if asked_period is not None and asked_period in periods:
        st, ed = periods[asked_period]["start"], periods[asked_period]["end"]

        if any(k in q_lower for k in ["vào học", "bắt đầu", "mấy giờ", "giờ học"]):
            return f"Theo sổ tay: Tiết {asked_period} bắt đầu lúc {st} và kết thúc lúc {ed}."
        elif "kết thúc" in q_lower or "hết" in q_lower:
            return f"Theo sổ tay: Tiết {asked_period} kết thúc lúc {ed} ."
        else:
            return f"Theo sổ tay: Tiết {asked_period} học từ {st} đến {ed}."


    # ===== 2) Guardrail HỌC BỔNG: ép đủ bullet nếu là query điều kiện học bổng
    if is_scholarship_condition_query(question):
        bullets = extract_bullets(ctx)
        if bullets:
            # Cho phép Gemma "nói lại" cho mượt nhưng vẫn đủ ý:
            prompt_b = f"""
Bạn là chatbot học vụ HCMUE. Dựa vào "Thông tin chính thức" bên dưới, hãy trình bày lại
**đầy đủ từng điều kiện** dưới dạng gạch đầu dòng, ngắn gọn, dễ hiểu, KHÔNG được bỏ sót.

Thông tin chính thức:
---
{ctx}
---

Câu hỏi:
{question}

Yêu cầu:
- Chỉ dựa vào văn bản nguồn, không thêm dữ kiện.
- Giữ đầy đủ TẤT CẢ điều kiện/bullet xuất hiện trong nguồn, mỗi ý một dòng.
- Nếu không liên quan, trả lời: "Sổ tay chưa ghi rõ phần này."

Câu trả lời bằng gạch đầu dòng:
""".strip()

            try:
                ans = llm(
                    prompt_b,
                    max_new_tokens=180,
                    temperature=0.3,
                    top_p=0.9,
                    do_sample=True,
                    return_full_text=False
                )[0]["generated_text"].strip()

                # Hậu kiểm: nếu thiếu bullet -> fallback trích máy cho chắc chắn
                if (not has_bullet(ans)) or too_short(ans, 25):
                    ans = "Tóm tắt đầy đủ theo sổ tay:\n" + "\n".join([f"- {b}" for b in bullets])
                return ans
            except Exception:
                # Fallback khi LLM lỗi
                return "Tóm tắt đầy đủ theo sổ tay:\n" + "\n".join([f"- {b}" for b in bullets])

    # ===== 3) Các truy vấn khác -> LLM + hậu kiểm chung
    prompt = f"""
Bạn là chatbot học vụ của Trường Đại học Sư phạm TP.HCM (HCMUE).
Nhiệm vụ của bạn là giúp sinh viên hiểu rõ thông tin trong sổ tay, bằng văn phong tự nhiên, **rõ ràng và đủ ý**.

Thông tin chính thức:
---
{ctx}
---

Câu hỏi:
{question}

Hướng dẫn trả lời:
1) **Chỉ dựa vào phần "Thông tin chính thức"**, không tự suy luận.
2) Viết tiếng Việt tự nhiên, dễ hiểu. 
3) Nếu có gạch đầu dòng/điều kiện trong nguồn, **liệt kê lại đầy đủ từng dòng**, không gộp ý.
4) Có thể gọn, nhưng **không được bỏ sót ý nào** trong nguồn.
5) Không tạo câu hỏi trắc nghiệm. 
6) Nếu không có thông tin liên quan, trả lời: "Sổ tay chưa ghi rõ phần này."

Câu trả lời:
""".strip()

    try:
        ans = llm(
            prompt,
            max_new_tokens=180,
            temperature=0.3,
            top_p=0.9,
            do_sample=True,
            return_full_text=False
        )[0]["generated_text"].strip()

        # Làm sạch echo
        low = ans.lower()
        if "câu trả lời" in low:
            ans = ans.split(":", 1)[-1].strip()
        if "---" in ans:
            ans = ans.split("---")[-1].strip()

        # Hậu kiểm: nếu context có bullet mà answer không có/ quá ngắn -> regenerate nghiêm ngặt
        ctx_has_bullets = has_bullet(ctx)
        need_retry = (ctx_has_bullets and (not has_bullet(ans))) or too_short(ans, 35)
        if need_retry:
            strict_prompt = prompt + "\n\n⚠️ YÊU CẦU BỔ SUNG: Liệt kê đầy đủ từng dòng theo nguồn, mỗi ý một dòng."
            ans2 = llm(
                strict_prompt,
                max_new_tokens=180,
                temperature=0.25,
                top_p=0.9,
                do_sample=False,
                return_full_text=False
            )[0]["generated_text"].strip()
            if len(ans2) > len(ans):
                ans = ans2

        # Fallback cuối: nếu vẫn thiếu bullet -> trích máy từ context
        if ctx_has_bullets and (not has_bullet(ans)):
            bullets = extract_bullets(ctx)
            if bullets:
                ans = "Tóm tắt đầy đủ theo sổ tay:\n" + "\n".join([f"- {b}" for b in bullets])

        # Cắt bớt nếu quá dài
        if len(ans) > 1500:
            ans = ans[:1500].rstrip() + "…"

        if not ans:
            ans = "Sổ tay chưa ghi rõ phần này."
        return ans

    except Exception as e:
        # Fallback an toàn
        bullets = extract_bullets(ctx)
        if bullets:
            return "Tóm tắt đầy đủ theo sổ tay:\n" + "\n".join([f"- {b}" for b in bullets])
        return f"❌ Lỗi sinh câu trả lời tự nhiên: {e}"


# ========================================
# 8️⃣ HÀM XỬ LÝ CHÍNH
# ========================================
def chatbot_query_json(question: str, top_k: int = 2) -> dict:
    question = question.strip()
    if not question:
        return {"type": "error", "message": "Vui lòng nhập câu hỏi."}

    q_lower = question.lower()
    normalized_q = remove_vietnamese_diacritics(question)
    intent = classify_query_intent(question)

    course_keyword_hit = (
        bool(re.search(r"\bmôn\b", q_lower))
        or "học phần" in q_lower
        or "môn học" in q_lower
        or "học gì" in q_lower
        or "bao gồm gì" in q_lower
        or ("nội dung" in q_lower and "môn" in q_lower)
        or bool(re.search(r"\bmon\b", normalized_q))
        or "hoc phan" in normalized_q
        or "mon hoc" in normalized_q
        or "hoc gi" in normalized_q
        or "bao gom gi" in normalized_q
        or "noi dung mon" in normalized_q
    )
    is_course_intent = (intent == "COURSE") or course_keyword_hit

    schedule_tokens = [
        "buoi sang", "buoi chieu", "buoi toi", "lich hoc", "tiet",
        "ra choi", "nghi giua", "thu bay", "thu 7", "chu nhat",
        "gio vao hoc", "tan hoc", "vao toi"
    ]
    if any(token in normalized_q for token in schedule_tokens):
        is_course_intent = False

    greetings = [
        "chào", "hi", "hello", "xin chào", "yo", "alo", "hey",
        "cậu khoẻ không", "bạn khỏe không", "mày khỏe không",
        "good morning", "good afternoon", "good evening"
    ]
    
    if any(re.search(rf"\b{g}\b", q_lower) for g in greetings):
        return {
            "type": "greeting",
            "natural_answer": "Chào bạn 👋! Mình là chatbot HCMUE – sẵn sàng giúp bạn tra cứu thông tin học vụ 💬."
        }


    # ===== ƯU TIÊN: hỏi "Tiết X" =====
    asked_period = question_targets_period(question)
    periods = get_period_times()

    if (
        asked_period is not None
        and periods.get(asked_period)
        and not ("gio ra choi" in normalized_q or "nghi giua" in normalized_q)
    ):
        st = periods[asked_period]["start"]
        ed = periods[asked_period]["end"]
        ql = question.lower()
        if any(k in ql for k in ["vào học", "bắt đầu", "mấy giờ", "giờ học"]):
            return {"type": "schedule", "natural_answer": f"Theo sổ tay: Tiết {asked_period} bắt đầu {st} và kết thúc {ed}."}
        elif "kết thúc" in ql or "hết" in ql:
            return {"type": "schedule", "natural_answer": f"Theo sổ tay: Tiết {asked_period} kết thúc {ed}."}
        else:
            return {"type": "schedule", "natural_answer": f"Theo sổ tay: Tiết {asked_period} học từ {st} đến {ed}."}

        # ===== ƯU TIÊN: hỏi 'buổi sáng/chiều' =====
    morning_start, morning_end = "07g00", "11g30"
    afternoon_start, afternoon_end = "13g30", "17g30"
    end_keywords = ["ket thuc", "het", "tan"]
    start_keywords = ["bat dau", "vao hoc", "gio vao", "gio bat dau"]

    if "buoi sang" in normalized_q or "buổi sáng" in q_lower:
        if any(k in normalized_q for k in end_keywords):
            return {"type": "schedule", "natural_answer": f"Theo sổ tay: Buổi sáng kết thúc lúc {morning_end}."}
        if any(k in normalized_q for k in start_keywords):
            return {"type": "schedule", "natural_answer": f"Theo sổ tay: Buổi sáng bắt đầu lúc {morning_start}."}
        return {"type": "schedule", "natural_answer": f"Theo sổ tay: Buổi sáng học từ {morning_start} đến {morning_end}."}
    elif "buoi chieu" in normalized_q or "buổi chiều" in q_lower:
        if any(k in normalized_q for k in end_keywords):
            return {"type": "schedule", "natural_answer": f"Theo sổ tay: Buổi chiều kết thúc lúc {afternoon_end}."}
        if any(k in normalized_q for k in start_keywords):
            return {"type": "schedule", "natural_answer": f"Theo sổ tay: Buổi chiều bắt đầu lúc {afternoon_start}."}
        return {"type": "schedule", "natural_answer": f"Theo sổ tay: Buổi chiều học từ {afternoon_start} đến {afternoon_end}."}
    elif ("giờ vào học" in q_lower or "vào học" in q_lower) and not any(k in q_lower for k in ["tốt nghiệp", "hoc bong", "rèn luyện", "tot nghiep", "ren luyen"]):
        # fallback chung chỉ khi thật sự nói về giờ học
        return {
            "type": "schedule",
            "natural_answer": (
                f"Theo sổ tay: Buổi sáng học từ {morning_start} đến {morning_end} và buổi chiều học từ {afternoon_start} đến {afternoon_end}."
            )
        }

    if (
        "buoi toi" in normalized_q
        or ("vao toi" in normalized_q and "hoc" in normalized_q)
        or ("hoc toi" in normalized_q)
    ):
        return {
            "type": "schedule",
            "natural_answer": "Theo sổ tay: Lịch học chính khóa chỉ có ca sáng (07g00) và ca chiều (13g30), không có ca học buổi tối."
        }

    if "chu nhat" in normalized_q and "hoc" in normalized_q:
        return {"type": "schedule", "natural_answer": "Theo sổ tay: Nhà trường không sắp lớp chính khóa vào Chủ nhật."}

    if ("thu bay" in normalized_q or "thu 7" in normalized_q) and any(tok in normalized_q for tok in ["hoc", "lop", "chinh khoa"]):
        return {"type": "schedule", "natural_answer": "Theo sổ tay: Nhà trường không sắp lớp chính khóa vào Thứ bảy."}

    if is_minimum_credit_query(normalized_q):
        return {
            "type": "natural_table",
            "natural_answer": (
                "Theo sổ tay: Để được xét học bổng khuyến khích, sinh viên cần tích lũy tối thiểu 15 tín chỉ trong học kỳ xét học bổng (không tính tín chỉ trả nợ/cải thiện); đồng thời phải hoàn thành ít nhất 2/3 số tín chỉ đăng ký trong học kỳ đó."
            ),
        }

    if any(phrase in normalized_q for phrase in ["tot nghiep", "totnghiep", "xet tot nghiep", "cong nhan tot nghiep"]):
        graduation_answer = (
            "Theo sổ tay: Điều kiện xét tốt nghiệp gồm:\n"
            "- Tích lũy đủ học phần, số tín chỉ và hoàn thành các nội dung bắt buộc khác theo yêu cầu của CTĐT, đạt chuẩn đầu ra của CTĐT.\n"
            "- Điểm trung bình tích lũy của toàn khóa học đạt từ trung bình trở lên.\n"
            "- Tại thời điểm xét tốt nghiệp không bị truy cứu trách nhiệm hình sự hoặc không đang trong thời gian bị kỷ luật ở mức đình chỉ học tập."
        )
        return {"type": "natural_table", "natural_answer": graduation_answer}

    if "gio ra choi" in normalized_q or "nghi giua" in normalized_q:
        period_numbers = [int(p) for p in re.findall(r"tiet\s*(\d+)", normalized_q)]
        if len(period_numbers) < 2:
            all_numbers = [int(p) for p in re.findall(r"\b(\d+)\b", normalized_q)]
            for num in all_numbers:
                if num not in period_numbers:
                    period_numbers.append(num)
                if len(period_numbers) >= 2:
                    break
        if len(period_numbers) >= 2:
            period_numbers = sorted(period_numbers)[:2]
            duration = compute_break_duration(period_numbers[0], period_numbers[1])
            duration_text = format_duration(duration)
            if duration == 0:
                return {
                    "type": "schedule",
                    "natural_answer": (
                        f"Theo sổ tay: Giữa tiết {period_numbers[0]} và tiết {period_numbers[1]} không có thời gian nghỉ riêng."
                    )
                }
            if duration_text:
                start_label = periods.get(period_numbers[0], {}).get("end") if periods else None
                end_label = periods.get(period_numbers[1], {}).get("start") if periods else None
                window_text = ""
                if start_label and end_label:
                    window_text = f" (từ {start_label} đến {end_label})"
                return {
                    "type": "schedule",
                    "natural_answer": (
                        f"Theo sổ tay: Nghỉ giữa tiết {period_numbers[0]} và tiết {period_numbers[1]}"
                        f" kéo dài {duration_text}{window_text}."
                    )
                }
        return {"type": "schedule", "natural_answer": "Theo sổ tay: Thời gian nghỉ giữa các tiết chưa được ghi rõ."}

    if "hoc bong" in normalized_q:
        if is_scholarship_no_debt_query(normalized_q):
            return {
                "type": "natural_table",
                "natural_answer": (
                    "Theo sổ tay: Khi xét học bổng, tất cả tín chỉ đăng ký trong học kỳ phải đạt nên sinh viên không được nợ môn trong học kỳ xét học bổng."
                ),
            }

        if is_poor_conduct_query(normalized_q):
            return {
                "type": "natural_table",
                "natural_answer": (
                    "Theo sổ tay: Tiêu chuẩn học bổng yêu cầu điểm rèn luyện từ loại Khá (từ 65 điểm) trở lên, nên điểm rèn luyện Trung bình không đủ điều kiện."
                ),
            }

        level_key = detect_scholarship_level(normalized_q)
        if level_key:
            label, combos = get_scholarship_level_details(level_key)
            visible_label = label or SCHOLARSHIP_LEVEL_LABELS.get(level_key)
            if not combos:
                if visible_label:
                    return {
                        "type": "natural_table",
                        "natural_answer": (
                            f"Theo sổ tay: Không có học bổng khuyến khích học tập dành cho mức {visible_label.lower()}."
                        ),
                    }
                return {
                    "type": "natural_table",
                    "natural_answer": "Theo sổ tay: Không tìm thấy thông tin học bổng phù hợp với mức bạn hỏi.",
                }
            if combos:
                academic_only = ("diem hoc tap" in normalized_q and "ren luyen" not in normalized_q and "diem trung binh" not in normalized_q)
                header = f"Theo sổ tay: Tiêu chuẩn học bổng {visible_label} gồm:" if visible_label else "Theo sổ tay:"
                if academic_only:
                    academic_requirements = []
                    seen = set()
                    for combo in combos:
                        desc = combo.get("academic_desc")
                        key = desc or ""
                        if desc and key not in seen:
                            academic_requirements.append(desc)
                            seen.add(key)
                    if academic_requirements:
                        natural = f"Theo sổ tay: Điểm học tập tối thiểu cho học bổng {visible_label} gồm:\n" + "\n".join(f"- {req}" for req in academic_requirements)
                        return {"type": "natural_table", "natural_answer": natural}
                detail_lines = []
                seen_combo = set()
                for combo in combos:
                    parts = [p for p in [combo.get("academic_desc"), combo.get("conduct_desc")] if p]
                    if parts:
                        text = "; ".join(parts)
                        if text not in seen_combo:
                            detail_lines.append(text)
                            seen_combo.add(text)
                if detail_lines:
                    natural = header + "\n" + "\n".join(f"- {line}" for line in detail_lines)
                    return {"type": "natural_table", "natural_answer": natural}

        if is_scholarship_condition_query(question) or "khuyen khich" in normalized_q:
            return {"type": "natural_table", "natural_answer": GENERAL_SCHOLARSHIP_CONDITIONS}

        if SCHOLARSHIP_LOOKUP:
            summary = []
            for key, item in SCHOLARSHIP_LOOKUP.items():
                label, combos = get_scholarship_level_details(key)
                if label and combos:
                    temp_lines = []
                    for combo in combos:
                        parts = [p for p in [combo.get("academic_desc"), combo.get("conduct_desc")] if p]
                        if parts:
                            temp_lines.append("; ".join(parts))
                    for line in temp_lines:
                        summary.append(f"{label}: {line}")
            if summary:
                natural = "Theo sổ tay: Tiêu chuẩn học bổng gồm:\n" + "\n".join(f"- {line}" for line in summary)
                return {"type": "natural_table", "natural_answer": natural}

    if "diem ren luyen" in normalized_q:
        if "toi da" in normalized_q:
            return {"type": "natural_table", "natural_answer": "Theo sổ tay: Điểm rèn luyện tối đa là 100 điểm."}
        score_matches = re.findall(r"\d+(?:[.,]\d+)?", question)
        if score_matches:
            try:
                score_value = float(score_matches[0].replace(",", "."))
            except ValueError:
                score_value = None
            rank_info = determine_training_rank(score_value)
            if rank_info:
                score_text = format_decimal(score_value) if score_value is not None else score_matches[0]
                return {
                    "type": "natural_table",
                    "natural_answer": (
                        f"Theo sổ tay: Điểm rèn luyện {score_text} xếp loại {rank_info['label']} ({rank_info['range']})."
                    ),
                }
        for key, item in TRAINING_RANK_LOOKUP.items():
            if key in normalized_q:
                return {
                    "type": "natural_table",
                    "natural_answer": f"Theo sổ tay: Điểm rèn luyện xếp loại {item['label']} khi đạt {item['range']}."
                }
        if TRAINING_RANK_LOOKUP:
            overview = "\n".join(f"- {item['label']}: {item['range']}" for item in TRAINING_RANK_LOOKUP.values())
            return {"type": "natural_table", "natural_answer": "Theo sổ tay: Xếp loại điểm rèn luyện gồm:\n" + overview}

    if is_general_pass_requirement_query(normalized_q):
        return handle_pass_requirement_query(question, normalized_q)

    informal_phrases = [
        "may biet",
        "cho tao",
        "may co biet",
        "cho tui",
        "lam bai giup",
        "lam bai gium",
        "lam bai ho",
        "lam bai giup tao",
        "lam bai giup tui",
    ]
    if any(phrase in normalized_q for phrase in informal_phrases):
        return {"❌ Câu hỏi chưa hợp lệ hoặc không rõ ràng. Bạn thử hỏi lại cụ thể hơn nhé!"}
    
    requested_class_key = detect_academic_class_key(normalized_q)
    if requested_class_key:
        row = ACADEMIC_CLASS_LOOKUP.get(requested_class_key)
        if row:
            label = str(row.get("Xếp loại", "")).strip()
            range_text = str(row.get("Thang điểm 4", "")).strip()
            if label and range_text:
                return {
                    "type": "natural_table",
                    "natural_answer": f"Theo sổ tay: Xếp loại {label} khi điểm trung bình thang 4 {range_text}."
                }
            if label:
                return {
                    "type": "natural_table",
                    "natural_answer": f"Theo sổ tay: Xếp loại {label} được quy định trong sổ tay đào tạo."
                }

    matched_class_rows = []
    for key, row in ACADEMIC_CLASS_LOOKUP.items():
        if key and re.search(rf"\bxep\s+loai\s+{key}\b", normalized_q):
            matched_class_rows.append(row)

    if matched_class_rows:
        answers = []
        for row in matched_class_rows:
            label = str(row.get("Xếp loại", "")).strip()
            range_text = str(row.get("Thang điểm 4", "")).strip()
            if label and range_text:
                answers.append(f"Xếp loại {label} khi điểm trung bình thang 4 {range_text}.")
            elif label:
                answers.append(f"Xếp loại {label} được xác định trong sổ tay.")
        if answers:
            if len(answers) == 1:
                natural = f"Theo sổ tay: {answers[0]}"
            else:
                natural = "Theo sổ tay:\n" + "\n".join(f"- {ans}" for ans in answers)
            return {"type": "natural_table", "natural_answer": natural}

    grade = None
    if not is_course_intent:
        grade = extract_grade_token(question)

        if grade is None and "diem chu" in normalized_q:
            if any(kw in normalized_q for kw in ["dat toi thieu", "duoc xem la dat", "dat duoc", "dat toi"]):
                passing_list = ", ".join(PASSING_GRADE_ASC_ORDER)
                return {
                    "type": "natural_table",
                    "natural_answer": f"Theo sổ tay: Điểm chữ từ D trở lên ({passing_list}) được xem là đạt tối thiểu."
                }
            if any(kw in normalized_q for kw in ["rot", "truot", "khong dat", "khong du dieu kien"]):
                failing_list = ", ".join(FAILING_GRADE_ORDER)
                return {
                    "type": "natural_table",
                    "natural_answer": f"Theo sổ tay: Điểm chữ {failing_list.replace(', ', ' hoặc ')} bị xem là rớt (không đạt)."
                }

        if grade is None and "thang diem chu" in normalized_q and "thang diem 10" in normalized_q:
            for t in tables:
                if t.get("type") == "thang_diem_10_chu":
                    df = pd.DataFrame(t["data"])
                    rows = [f"- {row['Thang điểm chữ']}: {row['Thang điểm 10']}" for row in df.to_dict("records")]
                    natural = "Theo sổ tay: Quy đổi thang điểm 10 sang thang điểm chữ:\n" + "\n".join(rows)
                    return {"type": "natural_table", "natural_answer": natural}

        if grade is None and "thang diem chu" in normalized_q and ("thang diem 4" in normalized_q or re.search(r"\bthang\s*4\b", normalized_q)):
            for t in tables:
                if t.get("type") == "thang_diem_4":
                    df = pd.DataFrame(t["data"])
                    rows = [f"- {row['Thang điểm chữ']}: {row['Thang điểm 4']}" for row in df.to_dict("records")]
                    natural = "Theo sổ tay: Quy đổi thang điểm 4 sang thang điểm chữ:\n" + "\n".join(rows)
                    return {"type": "natural_table", "natural_answer": natural}

        if "thang diem 4" in normalized_q and any(kw in normalized_q for kw in ["loai hoc luc", "xep loai hoc luc", "xep loai"]):
            for t in tables:
                if t.get("type") == "xep_loai_hoc_luc":
                    df = pd.DataFrame(t["data"])
                    rows = [f"- {row['Xếp loại']}: {row['Thang điểm 4']}" for row in df.to_dict("records")]
                    natural = "Theo sổ tay: Thang điểm 4 được xếp loại học lực như sau:\n" + "\n".join(rows)
                    return {"type": "natural_table", "natural_answer": natural}

        if grade:
            if "dat" in normalized_q:
                info = GRADE_LOOKUP.get(grade, {})
                thang10 = info.get("thang_10")
                thang4 = info.get("thang_4")
                if grade in PASSING_GRADES:
                    detail = []
                    if thang4:
                        detail.append(f"thang 4: {thang4}")
                    if thang10:
                        detail.append(f"thang 10: {thang10}")
                    detail_text = ", ".join(detail)
                    postfix = f" ({detail_text})" if detail_text else ""
                    return {
                        "type": "natural_table",
                        "natural_answer": f"Theo sổ tay: Điểm chữ từ D trở lên được xem là đạt. {grade} thuộc nhóm đạt{postfix}."
                    }
                if grade in FAILING_GRADES:
                    detail = []
                    if thang4:
                        detail.append(f"thang 4 {thang4}")
                    if thang10:
                        detail.append(f"thang 10 {thang10}")
                    detail_text = ", ".join(detail)
                    postfix = f" ({detail_text})" if detail_text else ""
                    return {
                        "type": "natural_table",
                        "natural_answer": f"Theo sổ tay: Điểm chữ F hoặc F+ là không đạt. {grade} không được xem là đạt{postfix}."
                    }

            prefer_grade_thang4 = ("thang diem 4" in normalized_q) or ("thang 4" in normalized_q)
            prefer_grade_thang10 = ("thang diem 10" in normalized_q) or ("thang 10" in normalized_q)

            info = GRADE_LOOKUP.get(grade)
            if info:
                thang4 = info.get("thang_4")
                thang10 = info.get("thang_10")

                if prefer_grade_thang4 and thang4:
                    return {
                        "type": "natural_table",
                        "natural_answer": f"Theo sổ tay: {grade} tương đương {thang4} điểm thang 4."
                    }

                if prefer_grade_thang10 and thang10:
                    return {
                        "type": "natural_table",
                        "natural_answer": f"Theo sổ tay: {grade} tương đương {thang10} điểm thang 10."
                    }

                # Không chỉ rõ thang → ưu tiên thang 10 nếu có, ngược lại trả thang 4
                if thang10:
                    return {
                        "type": "natural_table",
                        "natural_answer": f"Theo sổ tay: {grade} tương đương {thang10} điểm thang 10."
                    }
                if thang4:
                    return {
                        "type": "natural_table",
                        "natural_answer": f"Theo sổ tay: {grade} tương đương {thang4} điểm thang 4."
                    }

        # =====  NGƯỢC LẠI: người dùng hỏi từ điểm số sang chữ =====
        num_match = re.search(r"(\d+[.,]?\d*)", q_lower)

        if num_match:
            num_str = num_match.group(1).replace(",", ".")
            try:
                num_val = float(num_str)
            except:
                num_val = None

            if num_val is not None:
                prefers_thang4 = ("thang diem 4" in normalized_q) or ("thang 4" in normalized_q) or (num_val <= 4 and "thang diem 10" not in normalized_q)
                prefers_thang10 = ("thang diem 10" in normalized_q) or ("thang 10" in normalized_q) or (num_val > 4 and "thang diem 4" not in normalized_q)

                if prefers_thang4:
                    letter = grade_letter_from_score(num_val, 4)
                    if letter:
                        return {
                            "type": "natural_table",
                            "natural_answer": (
                                f"Theo sổ tay: {format_score_text(num_val)} điểm thang 4 tương đương điểm chữ {letter}."
                            ),
                        }
                    return {
                        "type": "natural_table",
                        "natural_answer": (
                            f"Theo sổ tay: {format_score_text(num_val)} điểm thang 4 tiệm cận điểm chữ D (mốc đạt tối thiểu)."
                        ),
                    }

                if prefers_thang10:
                    letter = grade_letter_from_score(num_val, 10)
                    if letter:
                        return {
                            "type": "natural_table",
                            "natural_answer": (
                                f"Theo sổ tay: {format_score_text(num_val)} điểm thang 10 tương đương điểm chữ {letter}."
                            ),
                        }
                    return {
                        "type": "natural_table",
                        "natural_answer": (
                            f"Theo sổ tay: {format_score_text(num_val)} điểm thang 10 không khớp với thang quy đổi hiện có."
                        ),
                    }

    if is_course_intent:
        course = find_course_by_fuzzy_match(question)
        if course:
            return {"type": "course", "data": course}

    tb = find_table_by_keyword(question)
    if tb:
        return {"type": "table", "data": tb}

    # ===== 4) Mặc định: RAG chung + fallback tốt nghiệp =====
    try:
        if any(k in q_lower for k in ["tốt nghiệp", "tot nghiep", "xét tốt nghiệp", "cong nhan tot nghiep"]):
            vec_results = vector_search(question, top_k=1)
        else:
            vec_results = vector_search(question, top_k=max(top_k, 2))

        if not vec_results:
            return {"type": "vector_search", "results": [], "message": "Không tìm thấy thông tin."}

        sims = [1 - v["distance"] for v in vec_results if v.get("distance") is not None]
        best_sim = sims[0] if sims else 0.0
        threshold = 0.7

        if best_sim < threshold:
            # ✅ Fallback đặc biệt cho 'tốt nghiệp'
            if any(k in q_lower.replace(" ", "") for k in ["tốtnghiệp", "totnghiep", "xéttốtnghiệp", "congnhantotnghiep"]):
                retry_q = "điều kiện công nhận tốt nghiệp, xét tốt nghiệp, quy định công nhận tốt nghiệp"
                vec_results = vector_search(retry_q, top_k=1)
                sims = [1 - v["distance"] for v in vec_results if v.get("distance") is not None]
                if sims and sims[0] >= 0.6:  # hạ nhẹ threshold riêng cho tốt nghiệp
                    combined_context = "\n".join([v["chunk"] for v in vec_results])
                    natural = generate_natural_answer(question, combined_context)
                    return {"type": "vector_search", "results": vec_results, "natural_answer": natural}
            # Nếu không phải nhóm 'tốt nghiệp' hoặc retry vẫn thấp → invalid
            return {"type": "invalid_query", "message": "❌ Câu hỏi chưa hợp lệ hoặc không rõ ràng. Bạn thử hỏi lại cụ thể hơn nhé!"}

        combined_context = "\n".join([v["chunk"] for v in vec_results])
        natural = generate_natural_answer(question, combined_context)
        return {"type": "vector_search", "results": vec_results, "natural_answer": natural}

    except Exception as e:
        return {"type": "error", "message": f"Lỗi truy vấn vector: {e}"}



# ========================================
# 9️⃣ API ENDPOINTS
# ========================================
class QueryRequest(BaseModel):
    query: str
    top_k: int = 2

@app.post("/query")
async def process_query(request: QueryRequest):
    if SYSTEM_STATUS != "OK":
        raise HTTPException(status_code=503, detail={"error": "Hệ thống chưa sẵn sàng", "status": SYSTEM_STATUS})
    return chatbot_query_json(request.query, request.top_k)

@app.get("/")
def home():
    return {"message": "✅ Chatbot HCMUE RAG API đang hoạt động!", "status": SYSTEM_STATUS, "model": MODEL_NAME}