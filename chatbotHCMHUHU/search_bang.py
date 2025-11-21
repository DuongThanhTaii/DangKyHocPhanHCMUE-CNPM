import json
import itertools
from rapidfuzz import fuzz
from sentence_transformers import SentenceTransformer, util

# ============================================================
# 0. TÊN BẢNG THEO TIẾNG VIỆT (để hiển thị đẹp)
# ============================================================
DISPLAY_NAMES = {
    "thoi_gian_dai_hoc_k51_goc": "Thời gian đào tạo đại học",
    "hinh_thuc_dao_tao": "Hình thức đào tạo",
    "thang_diem_10_k51": "Thang điểm 10",
    "thang_diem_10_dai_cuong": "Thang điểm 10 các học phần đại cương",
    "thang_diem_10_chuyen_nganh": "Thang điểm 10 các học phần chuyên ngành",
    "thang_diem_4": "Thang điểm 4",
    "xep_loai_hoc_luc": "Xếp loại học lực",
    "phan_bo_tiet_hoc": "Phân bố tiết học",
    "phan_loai_ren_luyen": "Phân loại rèn luyện",
    "he_thong_danh_gia_ren_luyen": "Hệ thống đánh giá rèn luyện"
}

# ============================================================
# 1. LOAD DỮ LIỆU
# ============================================================
with open("/kaggle/input/bang-stsv/bang.json", "r", encoding="utf-8") as f:
    BANG = json.load(f)

TABLE_KEYS = list(BANG.keys())

# ============================================================
# 1.1 ALIAS RIÊNG CHO TỪNG BẢNG (CHO FUZZY)
# ============================================================
# ⚠️ Nhớ đảm bảo các key này có tồn tại trong bang.json
FUZZY_ALIAS = {
    "thoi_gian_dai_hoc_k51_goc": [
        "thoi gian dao tao",
        "thời gian đào tạo",
        "số năm học",
        "thoi gian hoc"
    ],
    "hinh_thuc_dao_tao": [
        "hinh thuc dao tao",
        "hình thức đào tạo"
    ],
    "thang_diem_10_k51": [
        "thang diem 10",
        "thang điểm 10"
    ],
    "thang_diem_10_dai_cuong": [
        "thang diem 10 dai cuong",
        "thang điểm 10 đại cương",
        "thang diem 10 cac hoc phan dai cuong",
        "thang điểm 10 các học phần đại cương"
    ],
    "thang_diem_10_chuyen_nganh": [
        "thang diem 10 chuyen nganh",
        "thang điểm 10 chuyên ngành",
        "thang diem 10 cac mon chuyen nganh",
        "thang diem 10 cac hoc phan chuyen nganh",
        "thang điểm 10 các học phần chuyên ngành"
    ],
    "thang_diem_4": [
        "thang diem 4",
        "thang điểm 4",
        "điểm hệ 4",
        "gpa 4"
    ],
    "xep_loai_hoc_luc": [
        "xep loai hoc luc",
        "xếp loại học lực",
        "xep loai hoc tap"
    ],
    "phan_bo_tiet_hoc": [
        "phan bo tiet hoc",
        "phân bố tiết học",
        "gio hoc",
        "tiết học trong ngày"
    ],
    "phan_loai_ren_luyen": [
        "phan loai ren luyen",
        "phân loại rèn luyện",
        "xep loai diem ren luyen",
        "điểm rèn luyện"
    ],
    "he_thong_danh_gia_ren_luyen": [
        "he thong danh gia ren luyen",
        "hệ thống đánh giá rèn luyện",
        "tieu chi ren luyen",
        "tiêu chí rèn luyện"
    ]
}

# ============================================================
# 2. MODEL
# ============================================================
model = SentenceTransformer("BAAI/bge-m3")

# ============================================================
# 3. TITLE LABEL TĂNG NHẬN DIỆN
# ============================================================
TABLE_LABELS = {
    "thoi_gian_dai_hoc_k51_goc": "thời gian đào tạo, số năm học, thời lượng học",
    "hinh_thuc_dao_tao": "hình thức đào tạo",
    "thang_diem_10_k51": "thang điểm 10, điểm chữ, quy đổi điểm",
    "thang_diem_10_dai_cuong": "thang điểm 10 các học phần đại cương",
    "thang_diem_10_chuyen_nganh": "thang điểm 10 các học phần chuyên ngành",
    "thang_diem_4": "thang điểm 4, điểm trung bình học kỳ, GPA 4",
    "xep_loai_hoc_luc": "xếp loại học lực, đánh giá học lực sinh viên",
    "phan_bo_tiet_hoc": "phân bố tiết học, tiết học, giờ học, thời khóa biểu",
    "phan_loai_ren_luyen": "phân loại điểm rèn luyện, xếp loại điểm rèn luyện",
    "he_thong_danh_gia_ren_luyen": "hệ thống rèn luyện, quy chế rèn luyện, tiêu chí rèn luyện, đánh giá điểm rèn luyện"
}

TITLE_EMBEDS = model.encode(
    [TABLE_LABELS[k] for k in TABLE_KEYS],
    convert_to_tensor=True
)

# ============================================================
# 4. EMBED NỘI DUNG
# ============================================================
def flatten_nested(d):
    if isinstance(d, dict):
        return " ".join(flatten_nested(v) for v in d.values())
    if isinstance(d, list):
        return " ".join(flatten_nested(x) for x in d)
    return str(d)

CONTENT_TEXTS = [flatten_nested(BANG[key]) for key in TABLE_KEYS]
CONTENT_EMBEDS = model.encode(CONTENT_TEXTS, convert_to_tensor=True)

# ============================================================
# 5. DOMAIN VECTOR
# ============================================================
ALL_TEXT = " ".join(CONTENT_TEXTS)
DOMAIN_VEC = model.encode(ALL_TEXT, convert_to_tensor=True)

def compute_relevance(q):
    qv = model.encode(q, convert_to_tensor=True)
    return util.cos_sim(qv, DOMAIN_VEC)[0][0].item()

# ============================================================
# 6. N-GRAM KEYWORD EXTRACTION
# ============================================================
def extract_keywords(query):
    words = query.lower().split()
    ngrams = []
    for n in range(1, 4):
        for comb in itertools.combinations(words, n):
            ngrams.append(" ".join(comb))
    return ngrams

# ============================================================
# 7. FORMATTERS
# ============================================================
def format_table(data_list):
    cols = []
    for row in data_list:
        for c in row.keys():
            if c not in cols:
                cols.append(c)

    widths = {
        c: max(len(c), max(len(str(row.get(c, ""))) for row in data_list)) + 2
        for c in cols
    }

    header = "".join(c.ljust(widths[c]) for c in cols)
    out = header + "\n" + "-" * len(header) + "\n"

    for row in data_list:
        out += "".join(str(row.get(c, "")).ljust(widths[c]) for c in cols) + "\n"

    return out

def format_nested(d, indent=0):
    out = ""
    if isinstance(d, dict):
        for k, v in d.items():
            out += " " * indent + f"{k}:\n"
            out += format_nested(v, indent + 2)
    elif isinstance(d, list):
        for x in d:
            out += format_nested(x, indent)
    else:
        out += " " * indent + f"- {d}\n"
    return out

# ============================================================
# 8. FUZZY MATCH DỰA TRÊN ALIAS (ƯU TIÊN, FIX SAI CHÍNH TẢ)
# ============================================================
FUZZY_THRESHOLD = 0.70  # ngưỡng fuzzy

def fuzzy_match_table(query):

    q = query.lower()
    best_key = None
    best_score = 0.0

    # ===========================
    # 1) KEYWORD đặc thù RÈN LUYỆN (ƯU TIÊN HIGHEST)
    # ===========================
    kw_phan_loai = [
        "phân loại rèn luyện", "phan loai ren luyen",
        "xếp loại rèn luyện", "xep loai ren luyen",
        "xep loai drl", "phan loai drl",
        "khung diem ren luyen", "muc ren luyen"
    ]

    kw_he_thong = [
        "hệ thống đánh giá rèn luyện", "he thong danh gia ren luyen",
        "đánh giá rèn luyện", "danh gia ren luyen",
        "cách chấm điểm rèn luyện", "cach cham diem ren luyen",
        "chấm điểm rèn luyện"
    ]

    # ===== Nếu chứa từ khóa hệ thống rèn luyện → trả bảng hệ thống =====
    if any(kw in q for kw in kw_he_thong):
        return "he_thong_danh_gia_ren_luyen", 1.0

    # ===== Nếu chứa từ khóa phân loại rèn luyện → trả bảng phân loại =====
    if any(kw in q for kw in kw_phan_loai):
        return "phan_loai_ren_luyen", 1.0

    # ===========================
    # 2) TIẾP TỤC XỬ LÝ THANG ĐIỂM
    # ===========================
    is_chuyen_nganh = any(kw in q for kw in [
        "chuyên ngành", "chuyen nganh", "mon chuyen nganh"
    ])

    is_dai_cuong = any(kw in q for kw in [
        "đại cương", "dai cuong"
    ])

    is_thang_diem_10 = "thang diem 10" in q or "thang điểm 10" in q

    # ===========================
    # 3) FUZZY CHUNG
    # ===========================
    for key, aliases in FUZZY_ALIAS.items():

        # --- match chuyên ngành ---
        if is_chuyen_nganh and key != "thang_diem_10_chuyen_nganh":
            continue

        # --- match đại cương ---
        if is_dai_cuong and key != "thang_diem_10_dai_cuong":
            continue

        # --- match thang điểm 10 ---
        if is_thang_diem_10:
            if not key.startswith("thang_diem_10"):
                continue

        # --- chặn fuzzy thang điểm 10 khi không có từ khóa ---
        if (not is_chuyen_nganh and not is_dai_cuong and not is_thang_diem_10):
            if key.startswith("thang_diem_10"):
                continue

        # ============ fuzzy chính ============
        for alias in aliases:
            partial = fuzz.partial_ratio(q, alias.lower()) / 100
            token = fuzz.token_set_ratio(q, alias.lower()) / 100
            score = 0.4 * partial + 0.6 * token

            if score > best_score:
                best_score = score
                best_key = key

    if best_score >= 0.70:
        return best_key, best_score

    return None, best_score





# ============================================================
# 9. SEMANTIC MATCH
# ============================================================
TITLE_W = 0.65
CONTENT_W = 0.35
KEYWORD_BONUS = 0.15

MIN_TABLE_SCORE = 0.52
MIN_RELEVANCE = 0.50

def detect_table(query):

    qv = model.encode(query, convert_to_tensor=True)
    title_scores = util.cos_sim(qv, TITLE_EMBEDS)[0].cpu().numpy()
    content_scores = util.cos_sim(qv, CONTENT_EMBEDS)[0].cpu().numpy()

    final = TITLE_W * title_scores + CONTENT_W * content_scores
    ql = query.lower()

    # ƯU TIÊN MẠNH (rule đơn giản)
    if "thang diem 10" in ql or "thang điểm 10" in ql:
        for i, k in enumerate(TABLE_KEYS):
            if "thang_diem_10" in k:
                final[i] += 0.20

    if "thang diem 4" in ql or "thang điểm 4" in ql:
        for i, k in enumerate(TABLE_KEYS):
            if "thang_diem_4" in k:
                final[i] += 0.20

    if "hoc luc" in ql or "học lực" in ql:
        for i, k in enumerate(TABLE_KEYS):
            if "xep_loai_hoc_luc" in k:
                final[i] += 0.20

    # N-GRAM BONUS
    keywords = extract_keywords(query)
    for i, key in enumerate(TABLE_KEYS):
        label = TABLE_LABELS[key].lower()
        for kw in keywords:
            if kw in label:
                final[i] += KEYWORD_BONUS

    idx = final.argmax()
    best = final[idx]

    return idx, best, final

# ============================================================
# 10. MAIN SEARCH
# ============================================================
def search_bang(query):

    # 1) FUZZY MATCH TRƯỚC (XỬ LÝ SAI CHÍNH TẢ + CÂU CÓ TỪ KHÓA RÕ RÀNG)
    fk, fscore = fuzzy_match_table(query)
    if fk:
        table = BANG[fk]
        if isinstance(table, list):
            return f"(Match fuzzy alias: {fscore:.2f})\n[Bảng: {DISPLAY_NAMES.get(fk, fk)}]\n\n" + format_table(table)
        return f"(Match fuzzy alias: {fscore:.2f})\n[Bảng: {DISPLAY_NAMES.get(fk, fk)}]\n\n" + format_nested(table)

    # 2) SEMANTIC SEARCH
    relevance = compute_relevance(query)
    idx, best, all_scores = detect_table(query)

    if best < MIN_TABLE_SCORE or relevance < MIN_RELEVANCE:
        top3 = all_scores.argsort()[-3:][::-1]
        out = "❌ Câu hỏi không khớp bảng nào.\nCó phải bạn muốn xem:\n"
        for i in top3:
            key = TABLE_KEYS[i]
            out += f" • {DISPLAY_NAMES.get(key, key)}\n"
        return out

    key = TABLE_KEYS[idx]
    table = BANG[key]

    if isinstance(table, list):
        return f"(Độ khớp semantic: {best:.4f}, relevance: {relevance:.4f})\n[Bảng: {DISPLAY_NAMES.get(key, key)}]\n\n" + format_table(table)

    return f"(Độ khớp semantic: {best:.4f}, relevance: {relevance:.4f})\n[Bảng: {DISPLAY_NAMES.get(key, key)}]\n\n" + format_nested(table)

# ============================================================
# 11. CHAT LOOP
# ============================================================
def chat_bang():
    print("Hỏi bảng (gõ 'quit' để thoát):")
    while True:
        q = input("\nBạn hỏi: ").strip()
        if q.lower() == "quit":
            break
        print("\n--- KẾT QUẢ ---\n")
        print(search_bang(q))


if __name__ == "__main__":
    chat_bang()

