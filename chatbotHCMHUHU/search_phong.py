import json
from sentence_transformers import SentenceTransformer, util


# ============================
# 0. TỪ ĐIỂN VIẾT TẮT (CNTT + CTCT-HSSV)
# ============================

# Tên chính xác trong JSON
REAL_CTCT_HSSV = "Phòng Công tác chính trị và Học sinh, sinh viên"

ABBREV_MAP = {
    # ==== CNTT (để khỏi match sai) ====
    "cntt": "khoa công nghệ thông tin",

    # ==== Phòng Công tác Chính trị & HSSV ====
    "ctct hssv": REAL_CTCT_HSSV,
    "ctct-hssv": REAL_CTCT_HSSV,
    "ctsv": REAL_CTCT_HSSV,
    "ctct": REAL_CTCT_HSSV,
    "hssv": REAL_CTCT_HSSV,
    "công tác sinh viên": REAL_CTCT_HSSV,
}


def normalize_abbrev(q: str):
    q_low = q.lower()
    for k, v in ABBREV_MAP.items():
        if k in q_low:
            q_low = q_low.replace(k, v)
    return q_low


# ============================
# 1. LOAD JSON PHÒNG – TRUNG TÂM
# ============================
with open("phong_trungtam.json", "r", encoding="utf-8") as f:
    DATA_PHONG = json.load(f)

# Chuyển json thành list cho dễ xử lý
PHONG_LIST = [{"ten_phong": k, "info": v} for k, v in DATA_PHONG.items()]


# ============================
# 1.5 CLONE ALIAS CHO CTCT-HSSV
# ============================
ALIASES = {
    "phòng ctct hssv": REAL_CTCT_HSSV,
    "ctct hssv": REAL_CTCT_HSSV,
    "ctsv": REAL_CTCT_HSSV,
    "ctct": REAL_CTCT_HSSV,
    "hssv": REAL_CTCT_HSSV,
    "phòng công tác sinh viên": REAL_CTCT_HSSV,
    "phòng ctsv": REAL_CTCT_HSSV,
    "phong ctsv": REAL_CTCT_HSSV,
}

for alias, real in ALIASES.items():
    if real in DATA_PHONG:
        PHONG_LIST.append({
            "ten_phong": alias,
            "info": DATA_PHONG[real]
        })


# ============================
# 2. LOAD MODEL
# ============================
model = SentenceTransformer("BAAI/bge-m3")

PHONG_NAMES = [item["ten_phong"] for item in PHONG_LIST]
PHONG_EMBEDS = model.encode(PHONG_NAMES, convert_to_tensor=True)


# ============================
# 3. N-GRAM BUILDER
# ============================
def build_ngrams(words, max_n=4):
    ngrams = []
    L = len(words)
    for n in range(1, max_n + 1):
        for i in range(L - n + 1):
            ngrams.append(" ".join(words[i:i+n]))
    return ngrams


# ============================
# 4. SEMANTIC N-GRAM EXTRACTION
# ============================
def extract_keyword_semantic(query):
    words = query.lower().split()
    ngrams = build_ngrams(words, max_n=4)

    embeds = model.encode(ngrams, convert_to_tensor=True)
    scores = util.cos_sim(embeds, PHONG_EMBEDS).cpu().numpy()

    best_i = scores.argmax() // scores.shape[1]
    return ngrams[best_i]


# ============================
# 5. RELEVANCE FILTER
# ============================
anchor_embeds = model.encode(PHONG_NAMES, convert_to_tensor=True)
ANCHOR_VEC = anchor_embeds.mean(dim=0, keepdim=True)

def compute_relevance(q):
    qv = model.encode(q, convert_to_tensor=True)
    return util.cos_sim(qv, ANCHOR_VEC)[0][0].item()


# ============================
# 6. SEMANTIC SEARCH
# ============================
SEM_MIN = 0.7
MARGIN = 0.01
REL_MIN = 0.6   # tăng để loại "ú ớ ú ớ"

def semantic_search(keyword):
    qv = model.encode(keyword, convert_to_tensor=True)
    scores = util.cos_sim(qv, PHONG_EMBEDS)[0].cpu().numpy()

    top1 = scores.max()
    top_i = scores.argmax()

    sorted_scores = sorted(scores, reverse=True)
    top2 = sorted_scores[1]

    if top1 < SEM_MIN:
        return None, top1, top2

    if top1 >= 0.60:
        return PHONG_LIST[top_i], top1, top2

    if (top1 - top2) < MARGIN:
        return None, top1, top2

    return PHONG_LIST[top_i], top1, top2


# ============================
# 7. SEARCH LOGIC
# ============================
def search_phong(query):

    query = normalize_abbrev(query)

    rel = compute_relevance(query)
    if rel < REL_MIN:
        return {"type": "irrelevant", "message": "Không liên quan phòng/trung tâm."}

    keyword = extract_keyword_semantic(query)

    item, top1, top2 = semantic_search(keyword)

    if item is None:
        return {
            "type": "ambiguous",
            "message": "Không xác định được phòng/trung tâm.",
            "top1": float(top1),
            "top2": float(top2)
        }

    return {
        "type": "ok",
        "method": "semantic-ngram",
        "ten_phong": item["ten_phong"],
        "info": item["info"],
        "score": float(top1)
    }


# ============================
# 8. FORMATTER
# ============================
def format_phong(r):

    if r["type"] == "irrelevant":
        return "❌ Câu hỏi không liên quan."

    if r["type"] == "ambiguous":
        return f"⚠️ Mơ hồ.\nTop1={r['top1']:.4f}, Top2={r['top2']:.4f}"

    info = r["info"]

    text = (
        f"Phòng/Trung tâm: {r['ten_phong']}\n"
        f"Phương thức: {r['method']}\n"
        f"Độ khớp: {r['score']:.4f}\n\n"
        f"Văn phòng: {info.get('van_phong_lam_viec','Không có')}\n"
        f"Điện thoại: {info.get('dien_thoai','Không có')}\n"
        f"Nội bộ: {info.get('noi_bo','Không có')}\n"
        f"Email: {info.get('email','Không có')}\n"
        f"Website: {info.get('website','Không có')}\n"
    )

    # Nếu có danh sách công việc liên quan sinh viên
    if "cong_viec_lien_quan_sinh_vien" in info:
        text += "\nCông việc liên quan sinh viên:\n"
        for cv in info["cong_viec_lien_quan_sinh_vien"]:
            text += f" • {cv}\n"

    return text



# ============================
# 9. CHAT LOOP
# ============================
def chat_phong():
    print("Hỏi về phòng / trung tâm (gõ quit để thoát):")
    while True:
        q = input("\nBạn hỏi: ").strip()
        if q.lower() == "quit":
            break

        r = search_phong(q)
        print("\n--- KẾT QUẢ ---\n")
        print(format_phong(r))


if __name__ == "__main__":
    chat_phong()
