# pip install rapidfuzz
import json
from sentence_transformers import SentenceTransformer, util
from rapidfuzz import fuzz

# ============================
# 1. LOAD JSON NGÀNH
# ============================
with open("nganh_cohoi.json", "r", encoding="utf-8") as f:
    DATA_NGANH = json.load(f)

# Flatten
NGANH_LIST = []
for name, content in DATA_NGANH.items():
    NGANH_LIST.append({
        "ten_nganh": name,
        "cohoi": content["co_hoi_nghe_nghiep"]
    })

# ============================
# 2. LOAD MODEL
# ============================
model_nganh = SentenceTransformer("BAAI/bge-m3")

NGANH_TEXTS = [item["ten_nganh"] for item in NGANH_LIST]
NGANH_EMBEDS = model_nganh.encode(NGANH_TEXTS, convert_to_tensor=True)

# ============================
# 3. THAM SỐ
# ============================
FUZZY_THRESHOLD = 0.7
TOP_K = 3
MARGIN = 0.03
SEMANTIC_MIN = 0.50


# ============================
# 4. RULE ƯU TIÊN CNTT
# ============================
def cntt_rule(query: str):
    q = query.lower()
    # các pattern gợi ý CNTT
    if ("cntt" in q or "it" in q or "information technology" in q
        or ("công nghệ" in q and "thông tin" in q)):
        for item in NGANH_LIST:
            name = item["ten_nganh"].lower()
            if "công nghệ thông tin" in name:
                return item
    return None


# ============================
# 5. EXACT + PARTIAL MATCH
# ============================
def exact_match_nganh(query: str):
    q_norm = query.lower().strip()
    for item in NGANH_LIST:
        if q_norm == item["ten_nganh"].lower():
            return item
    return None

def partial_exact_match_nganh(query: str):
    q_norm = query.lower().strip()
    for item in NGANH_LIST:
        if item["ten_nganh"].lower() in q_norm:
            return item
    return None


# ============================
# 6. FUZZY MATCH
# ============================
def fuzzy_match_nganh(query: str, threshold: float = FUZZY_THRESHOLD):
    best_item = None
    best_score = 0.0
    q_lower = query.lower()

    for item in NGANH_LIST:
        score = fuzz.partial_ratio(q_lower, item["ten_nganh"].lower()) / 100.0
        if score > best_score:
            best_score = score
            best_item = item

    if best_score >= threshold:
        return best_item, best_score
    return None, best_score


# ============================
# 7. SEMANTIC SEARCH
# ============================
def semantic_search_nganh(query: str):
    qvec = model_nganh.encode(query, convert_to_tensor=True)
    scores = util.cos_sim(qvec, NGANH_EMBEDS)[0].cpu().numpy()

    top_idx = scores.argsort()[-TOP_K:][::-1]
    top_scores = scores[top_idx]
    top1, top2 = top_scores[0], top_scores[1]

    if top1 < SEMANTIC_MIN:
        return None, top1, top2

    if (top1 - top2) < MARGIN:
        return None, top1, top2

    best_item = NGANH_LIST[top_idx[0]]
    return best_item, top1, top2


# ============================
# 8. SEARCH NGÀNH
# ============================
def search_nganh(query: str):

    q = query.strip()
    if not q:
        return {"type": "irrelevant", "message": "Câu hỏi trống."}

    # 1. Rule ưu tiên CNTT
    cntt_item = cntt_rule(q)
    if cntt_item:
        return {
            "type": "ok",
            "method": "rule_cntt",
            "ten_nganh": cntt_item["ten_nganh"],
            "cohoi": cntt_item["cohoi"],
            "score": 1.0
        }

    # 2. Exact
    item = exact_match_nganh(q)
    if item:
        return {
            "type": "ok",
            "method": "exact_name",
            "ten_nganh": item["ten_nganh"],
            "cohoi": item["cohoi"],
            "score": 1.0
        }

    # 3. Partial exact
    item = partial_exact_match_nganh(q)
    if item:
        return {
            "type": "ok",
            "method": "exact_partial",
            "ten_nganh": item["ten_nganh"],
            "cohoi": item["cohoi"],
            "score": 0.95
        }

    # 4. Fuzzy
    item, fuzzy_score = fuzzy_match_nganh(q)
    if item:
        return {
            "type": "ok",
            "method": "fuzzy_name",
            "ten_nganh": item["ten_nganh"],
            "cohoi": item["cohoi"],
            "score": float(fuzzy_score)
        }

    # 5. Semantic
    item, top1, top2 = semantic_search_nganh(q)
    if item is None:
        return {
            "type": "ambiguous",
            "message": "Không xác định được ngành phù hợp.",
            "top1": float(top1),
            "top2": float(top2)
        }

    return {
        "type": "ok",
        "method": "semantic",
        "ten_nganh": item["ten_nganh"],
        "cohoi": item["cohoi"],
        "score": float(top1)
    }


# ============================
# 9. CHAT LOOP — FORMAT OUTPUT ĐẸP
# ============================
def chat_nganh():
    print("Hỏi về ngành học (gõ 'quit' để thoát):")
    while True:
        q = input("\nBạn hỏi: ").strip()
        if q.lower() == "quit":
            break

        result = search_nganh(q)
        print("\n--- KẾT QUẢ ---")

        if result["type"] == "irrelevant":
            print(result["message"])
            continue

        if result["type"] == "ambiguous":
            print(result["message"])
            print("Top1:", result["top1"])
            print("Top2:", result["top2"])
            continue

        print(f"Ngành: {result['ten_nganh']}")
        print(f"Phương thức: {result['method']}")
        print(f"Độ khớp: {result['score']:.4f}")
        print("\nCơ hội nghề nghiệp ",end="")
        print(result["cohoi"])


if __name__ == "__main__":
    chat_nganh()
