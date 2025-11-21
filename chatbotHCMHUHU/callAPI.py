import google.generativeai as genai
import os
import time

# --- 1. Cấu hình API Key ---
# (Cách an toàn: Đặt biến môi trường 'GOOGLE_API_KEY')
try:
    # Lấy key từ biến môi trường
    genai.configure(api_key='AIzaSyA497Re-3tFErWhEqAmj7ypm458c8xiI5U')
except KeyError:
    print("LỖI: Vui lòng đặt biến môi trường 'GOOGLE_API_KEY'")
    # Hoặc để test nhanh (không khuyến khích):
    # api_key = 'YOUR_API_KEY_HERE' 
    # genai.configure(api_key=api_key)
    exit()

# --- 2. Tải file PDF lên API ---
# !!! THAY ĐỔI: Đặt đúng tên file PDF của bạn ở đây
file_path = 'C:\\Users\\anhph\\Desktop\\Python\\sotay.txt' 
# !!! 
uploaded_file = None

print(f"Đang kiểm tra file '{file_path}'...")
if not os.path.exists(file_path):
    print(f"LỖI: Không tìm thấy file '{file_path}'.")
    print("Vui lòng đặt file sotay.txt vào cùng thư mục với script này, hoặc sửa lại đường dẫn.")
    exit()

try:
    print(f"Đang tải file '{file_path}' lên máy chủ Gemini...")
    # Tải file lên và nhận về một đối tượng File
    uploaded_file = genai.upload_file(
        path=file_path,
        display_name="Sổ tay Sinh viên (Tạm thời)"
    )
    print(f"Đã tải file thành công: {uploaded_file.display_name} (ID: {uploaded_file.name})")
except Exception as e:
    print(f"Lỗi khi tải file: {e}")
    exit()

# --- 3. Khởi tạo Model ---
# Chúng ta sẽ dùng gemini-2.5-flash cho tốc độ và khả năng xử lý file
model = genai.GenerativeModel(model_name="models/gemini-2.0-flash-lite")

# --- 4. Bắt đầu Chatbot ---
print("\n" + "="*50)
print("🤖 CHATBOT SỔ TAY SINH VIÊN ĐÃ SẴN SÀNG!")
print("   (Gõ 'thoát' để kết thúc chương trình)")
print("="*50)

try:
    while True:
        # Nhận câu hỏi từ người dùng
        question = input("Sinh viên hỏi: ")
        
        if question.lower() == 'thoát':
            print("Chatbot: Tạm biệt!")
            break
        
        if not question:
            continue

        print("Chatbot: Đang tìm kiếm trong Sổ tay...")
        
        # Gửi cả file đã upload và câu hỏi cho model
        # Model sẽ tự động đọc file để tìm thông tin trả lời
        response = model.generate_content(
            [uploaded_file, question],  # Gửi file và prompt
            request_options={'timeout': 600} # Tăng thời gian chờ xử lý
        )
        
        print(f"Chatbot (từ PDF): {response.text}\n")

except KeyboardInterrupt:
    print("\nChatbot: Đã dừng.")
except Exception as e:
    print(f"Đã xảy ra lỗi: {e}")

finally:
    # --- 5. Dọn dẹp: Xóa file đã upload ---
    if uploaded_file:
        print(f"\nĐang xóa file '{uploaded_file.display_name}' khỏi máy chủ...")
        try:
            genai.delete_file(uploaded_file.name)
            print("Đã xóa file thành công.")
        except Exception as e:
            print(f"Lỗi khi xóa file: {e}. Bạn có thể xóa thủ công qua API.")