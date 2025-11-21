# Sử dụng base image Python 3.10
FROM python:3.10

# Đặt thư mục làm việc là /app
WORKDIR /app

# Sao chép và cài đặt các thư viện
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sao chép toàn bộ mã nguồn và dữ liệu
COPY . /app

# Lệnh Khởi chạy máy chủ Uvicorn để chạy ứng dụng FastAPI
# app:app nghĩa là chạy biến 'app' trong file 'app.py' trên cổng 7860
# Cổng 7860 là cổng mặc định mà Hugging Face Spaces expose
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]