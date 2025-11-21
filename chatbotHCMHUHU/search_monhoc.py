# pip install rapidfuzz
import json
import numpy as np
from sentence_transformers import SentenceTransformer, util
from rapidfuzz import fuzz


# ============================
# 1. LOAD JSON
# ============================
with open("mon_hoc_mo_ta.json", "r", encoding="utf-8") as f:
    DATA = json.load(f)


# ============================
# 2. TÁCH DỮ LIỆU THEO ĐỘ DÀI MÔ TẢ
# ============================
SHORT_DESC_THRESHOLD = 60

valid_items = []      # mô tả đủ dài → embedding
invalid_items = []    # mô tả quá ngắn → fuzzy/name match

for item in DATA:
    if len(item["Description"]) < SHORT_DESC_THRESHOLD:
        invalid_items.append(item)
    else:
        valid_items.append(item)


# Prepare text embedding cho valid_items
COMBINED_TEXT = [
    f"{item['ten_mon']} {item['ten_mon']} {item['ten_mon']} - {item['Description']}"
    for item in valid_items
]


# ============================
# 3. LOAD MODEL EMBEDDING
# ============================
model = SentenceTransformer("BAAI/bge-m3")
TEXT_EMBEDS = model.encode(COMBINED_TEXT, convert_to_tensor=True)


# ============================
# 4. DATASET WORDS (CHẶN LAN MAN)
# ============================
dataset_words = set()
for item in DATA:
    dataset_words.update(item["ten_mon"].lower().split())
    dataset_words.update(item["Description"].lower().split())

def query_has_valid_words(query: str) -> bool:
    q_words = query.lower().split()
    return any(w in dataset_words for w in q_words)


# ============================
# 5. DANH SÁCH TÊN MÔN (CHO EXACT + FUZZY)
# ============================
all_course_names = [item["ten_mon"] for item in DATA]
index_to_item = {i: item for i, item in enumerate(DATA)}


# ============================
# 6. EXACT MATCH
# ============================
def exact_match(query: str):
    q_norm = query.lower().strip()
    for item in DATA:
        if q_norm == item["ten_mon"].lower():
            return item
    return None


# ============================
# 7. PARTIAL EXACT MATCH
# ============================
def partial_exact_match(query: str):
    q_norm = query.lower().strip()
    for item in DATA:
        if item["ten_mon"].lower() in q_norm:
            return item
    return None


# ============================
# 8. FUZZY TOÀN CỤC
# ============================
def global_fuzzy_match(query: str, threshold: float):
    best_item = None
    best_score = 0.0
    q_lower = query.lower()

    for item in DATA:
        score = fuzz.partial_ratio(q_lower, item["ten_mon"].lower()) / 100.0
        if score > best_score:
            best_score = score
            best_item = item

    if best_score >= threshold:
        return best_item, best_score

    return None, best_score


# ============================
# 9. ANCHOR VECTOR (độ liên quan domain "môn học")
# ============================
anchor_texts = [
    f"{item['ten_mon']} - {item['Description']}"
    for item in DATA
]
anchor_embeds = model.encode(anchor_texts, convert_to_tensor=True)
ANCHOR_VEC = anchor_embeds.mean(dim=0, keepdim=True)

def compute_relevance(query: str) -> float:
    qvec = model.encode(query, convert_to_tensor=True)
    return util.cos_sim(qvec, ANCHOR_VEC)[0][0].item()


# ============================
# 10. SEMANTIC SEARCH
# ============================
TOP_K = 3
MARGIN = 0.03
FUZZY_THRESHOLD = 0.75
RELEVANCE_MIN = 0.30
SEMANTIC_MIN = 0.50

def semantic_search(query: str):
    qvec = model.encode(query, convert_to_tensor=True)
    scores = util.cos_sim(qvec, TEXT_EMBEDS)[0].cpu().numpy()

    top_idx = scores.argsort()[-TOP_K:][::-1]
    top_scores = scores[top_idx]

    top1, top2 = top_scores[0], top_scores[1]

    if top1 < SEMANTIC_MIN:
        return None, top1, top2

    if (top1 - top2) < MARGIN:
        return None, top1, top2

    best_idx = top_idx[0]
    item = valid_items[best_idx]

    return item, top1, top2


# ============================
# 11. RULE ƯU TIÊN CƠ SỞ DỮ LIỆU
# ============================
csdl_keywords = [
    "sql", "plsql", "pl/sql",
    "database", "cơ sở dữ liệu", "csdl",
    "truy vấn", "truy van",
    "oracle"
]

def csdl_rule(query: str):
    q = query.lower()
    for kw in csdl_keywords:
        if kw in q:
            # Nếu query chứa "nâng cao"
            if "nâng cao" in q:
                for item in DATA:
                    if item["ten_mon"].lower() == "cơ sở dữ liệu nâng cao":
                        return item
            # Mặc định trả CSDL thường
            for item in DATA:
                if item["ten_mon"].lower() == "cơ sở dữ liệu":
                    return item
    return None


# ============================
# 12. SEARCH COURSE (CHÍNH)
# ============================
def search_course(query: str):

    q_clean = query.strip()

    # A. RULE ƯU TIÊN CSDL
    csdl_item = csdl_rule(q_clean)
    if csdl_item:
        return {
            "type": "ok",
            "method": "rule_csdl",
            "ten_mon": csdl_item["ten_mon"],
            "description": csdl_item["Description"],
            "score": 1.0
        }

    # B. CHECK DOMAIN RELEVANCE
    relevance = compute_relevance(q_clean)
    if relevance < RELEVANCE_MIN:
        return {
            "type": "irrelevant",
            "message": "Câu hỏi không liên quan đến môn học.",
            "relevance": relevance
        }

    # C. EXACT MATCH
    item = exact_match(q_clean)
    if item:
        return {
            "type": "ok",
            "method": "exact_name",
            "ten_mon": item["ten_mon"],
            "description": item["Description"],
            "score": 1.0
        }

    # D. PARTIAL EXACT MATCH
    item = partial_exact_match(q_clean)
    if item:
        return {
            "type": "ok",
            "method": "exact_partial",
            "ten_mon": item["ten_mon"],
            "description": item["Description"],
            "score": 0.95
        }

    # E. FUZZY MATCH
    item, fuzzy_score = global_fuzzy_match(q_clean, FUZZY_THRESHOLD)
    if item:
        return {
            "type": "ok",
            "method": "fuzzy_name",
            "ten_mon": item["ten_mon"],
            "description": item["Description"],
            "score": float(fuzzy_score)
        }

    # F. SEMANTIC SEARCH
    item, top1, top2 = semantic_search(q_clean)
    if item is None:
        return {
            "type": "ambiguous",
            "message": "Câu hỏi mơ hồ hoặc không đủ thông tin.",
            "top1": float(top1),
            "top2": float(top2),
            "relevance": relevance
        }

    return {
        "type": "ok",
        "method": "semantic",
        "ten_mon": item["ten_mon"],
        "description": item["Description"],
        "score": float(top1),
        "relevance": relevance
    }


# ============================
# 13. CHAT LOOP (TUỲ NGỮ CẢNH)
# ============================
def chat():
    print("Hỏi về môn học (gõ 'quit' để thoát):")
    while True:
        q = input("\nBạn hỏi: ").strip()
        if q.lower() == "quit":
            break
        print("\n--- KẾT QUẢ ---")
        result = search_course(q)

        if result["type"] == "irrelevant":
            print(result["message"])
        elif result["type"] == "ambiguous":
            print(result["message"])
            print("Top1:", result["top1"])
            print("Top2:", result["top2"])
        else:
            print(f"Phương thức: {result['method']}")
            print(f"Môn: {result['ten_mon']}")
            print(f"Độ khớp: {result['score']}")
            print("Mô tả:")
            print(result["description"])

if __name__ == "__main__":
    chat()
