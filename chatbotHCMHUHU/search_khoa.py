#!pip install sentence-transformers
#!pip install rapidfuzz
import json
from sentence_transformers import SentenceTransformer, util


# ============================
# 0. ABBREV MAP (CHỈ CNTT)
# ============================
ABBREV_MAP = {
    "cntt": "khoa công nghệ thông tin",
}


def normalize_abbrev(q: str):
    """
    Chuẩn hóa từ viết tắt như CNTT → Công nghệ Thông Tin.
    Không phân biệt hoa/thường vì đã .lower().
    """
    q_low = q.lower()
    for k, v in ABBREV_MAP.items():
        if k in q_low:
            q_low = q_low.replace(k, v)
    return q_low


# ============================
# 1. LOAD JSON KHOA
# ============================
with open("khoa_to.json", "r", encoding="utf-8") as f:
    DATA_KHOA = json.load(f)

KHOA_LIST = [{"ten_khoa": k, "info": v} for k, v in DATA_KHOA.items()]


# ============================
# 2. MODEL BGE-M3
# ============================
model = SentenceTransformer("BAAI/bge-m3")

KHOA_NAMES = [item["ten_khoa"] for item in KHOA_LIST]
KHOA_EMBEDS = model.encode(KHOA_NAMES, convert_to_tensor=True)


# ============================
# 3. N-GRAM BUILDER
# ============================
def build_ngrams(words, max_n=4):
    ngrams = []
    L = len(words)
    for n in range(1, max_n + 1):
        for i in range(L - n + 1):
           ng = " ".join(words[i:i+n])
           ngrams.append(ng)
    return ngrams


# ============================
# 4. AUTO SEMANTIC KEYWORD (KHÔNG RULE)
# ============================
def extract_keyword_semantic(query):
    """
    Tách từ khóa tự nhiên bằng cách so tất cả N-grams của câu hỏi
    với embedding của TÊN KHOA.
    """
    words = query.lower().split()
    ngrams = build_ngrams(words, max_n=4)

    ngram_embeds = model.encode(ngrams, convert_to_tensor=True)
    scores = util.cos_sim(ngram_embeds, KHOA_EMBEDS).cpu().numpy()

    # lấy n-gram có similarity cao nhất
    best_i = scores.argmax() // scores.shape[1]
    return ngrams[best_i]


# ============================
# 5. RELEVANCE FILTER
# ============================
anchor_embeds = model.encode(KHOA_NAMES, convert_to_tensor=True)
ANCHOR_VEC = anchor_embeds.mean(dim=0, keepdim=True)

def compute_relevance(q):
    qv = model.encode(q, convert_to_tensor=True)
    return util.cos_sim(qv, ANCHOR_VEC)[0][0].item()


# ============================
# 6. SEMANTIC SEARCH
# ============================
SEM_MIN = 0.45
MARGIN = 0.01
REL_MIN = 0.30

def semantic_search(keyword):
    qv = model.encode(keyword, convert_to_tensor=True)
    scores = util.cos_sim(qv, KHOA_EMBEDS)[0].cpu().numpy()

    top1 = scores.max()
    top_i = scores.argmax()

    sorted_scores = sorted(scores, reverse=True)
    top2 = sorted_scores[1]

    if top1 < SEM_MIN:
        return None, top1, top2

    # nếu top1 >= 0.60 → đáng tin
    if top1 >= 0.60:
        return KHOA_LIST[top_i], top1, top2

    # nếu < 0.60 → cần margin
    if (top1 - top2) < MARGIN:
        return None, top1, top2

    return KHOA_LIST[top_i], top1, top2


# ============================
# 7. HÀM CHÍNH
# ============================
def search_khoa(query):

    # Normalize từ viết tắt
    query = normalize_abbrev(query)

    # relevance để loại câu hỏi vô nghĩa
    rel = compute_relevance(query)
    if rel < REL_MIN:
        return {"type": "irrelevant", "message": "Không liên quan khoa/phòng."}

    # auto extract keyword
    keyword = extract_keyword_semantic(query)

    # semantic search
    item, top1, top2 = semantic_search(keyword)

    if item is None:
        return {
            "type": "ambiguous",
            "message": "Không xác định được khoa/phòng.",
            "top1": float(top1),
            "top2": float(top2)
        }

    return {
        "type": "ok",
        "method": "semantic-ngram",
        "ten_khoa": item["ten_khoa"],
        "info": item["info"],
        "score": float(top1)
    }


# ============================
# 8. FORMAT OUTPUT
# ============================
def format_khoa(r):

    if r["type"] == "irrelevant":
        return "❌ Câu hỏi không liên quan."

    if r["type"] == "ambiguous":
        return f"⚠️ Mơ hồ.\nTop1={r['top1']:.4f}, Top2={r['top2']:.4f}"

    info = r["info"]

    return (
        f"Khoa/Phòng: {r['ten_khoa']}\n"
        f"Phương thức: {r['method']}\n"
        f"Độ khớp: {r['score']:.4f}\n\n"
        f"Văn phòng: {info.get('van_phong_lam_viec','Không có')}\n"
        f"Điện thoại: {info.get('dien_thoai','Không có')}\n"
        f"Nội bộ: {info.get('noi_bo','Không có')}\n"
        f"Email: {info.get('email','Không có')}\n"
        f"Website: {info.get('website','Không có')}"
    )


# ============================
# 9. CHAT LOOP
# ============================
def chat_khoa():
    print("Hỏi về khoa/phòng (gõ quit để thoát):")
    while True:
        q = input("\nBạn hỏi: ")
        if q.lower() == "quit":
            break

        result = search_khoa(q)
        print("\n--- KẾT QUẢ ---\n")
        print(format_khoa(result))


if __name__ == "__main__":
    chat_khoa()
