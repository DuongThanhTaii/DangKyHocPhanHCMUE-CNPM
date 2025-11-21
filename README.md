# Hệ thống Đăng ký Học phần - HCMUE (hcmue-reg)

> Một hệ thống đăng ký học phần hiện đại được xây dựng trên kiến trúc Monorepo, sử dụng React (Vite) cho Frontend, Express.js cho Backend và được quản lý bởi PNPM Workspaces. Dữ liệu được vận hành trên PostgreSQL với sự hỗ trợ của Prisma ORM và Docker.

---

## 📖 Mục lục

- [🛠️ Công nghệ sử dụng](#️-công-nghệ-sử-dụng)
- [📂 Cấu trúc dự án](#-cấu-trúc-dự-án)
- [📋 Yêu cầu tiên quyết](#-yêu-cầu-tiên-quyết)
- [📥 Tải về và Cài đặt](#-tải-về-và-cài-đặt)
  - [Phương án 1: Cài đặt với Docker (Khuyến nghị)](#phương-án-1-cài-đặt-với-docker-khuyến-nghị)
  - [Phương án 2: Cài đặt Development](#phương-án-2-cài-đặt-development)
- [💡 Các lệnh hữu ích](#-các-lệnh-hữu-ích)
- [📄 Giấy phép](#-giấy-phép)

---

## 🛠️ Công nghệ sử dụng

| Lĩnh vực             | Công nghệ                                                                                                                                                                                           |
| :------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo**         | [PNPM Workspaces](https://pnpm.io/workspaces)                                                                                                                                                       |
| **Frontend**         | [React](https://reactjs.org/), [Vite](https://vitejs.dev/), [Redux Toolkit](https://redux-toolkit.js.org/), [React Router](https://reactrouter.com/), [TypeScript](https://www.typescriptlang.org/) |
| **Backend**          | [Express.js](https://expressjs.com/), [Prisma](https://www.prisma.io/), [Zod](https://zod.dev/), [TypeScript](https://www.typescriptlang.org/)                                                      |
| **Cơ sở dữ liệu**    | [PostgreSQL 17](https://www.postgresql.org/)                                                                                                                                                        |
| **Containerization** | [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/)                                                                                                               |

---

## 📂 Cấu trúc dự án

Dự án được tổ chức theo cấu trúc Monorepo, giúp quản lý các ứng dụng và gói dùng chung một cách hiệu quả:

```
hcmue-reg/
├── apps/
│   ├── backend/
│   │   ├── prisma/         # Prisma schema và migrations
│   │   └── src/            # Source code của Backend (Express.js)
│   └── frontend/
│       └── src/            # Source code của Frontend (React + Vite)
├── infra/
│   ├── docker-compose.yml  # Định nghĩa service database cho Docker
│   └── init.sql           # Script khởi tạo database và dữ liệu mẫu
├── packages/shared         # Các gói dùng chung (components, types, etc.)
├── package.json            # Cấu hình gốc và workspaces của pnpm
├── pnpm-workspace.yaml
├── .gitignore
└── README.md
```

---

## 📋 Yêu cầu tiên quyết

### Cho Người dùng cuối (Phương án Docker):

- **Docker Desktop** ([Tải về Docker Desktop](https://www.docker.com/products/docker-desktop))

### Cho Developer (Phương án Development):

- **Node.js**: `v18.x` trở lên
- **PNPM**: `v8.x` trở lên ([Hướng dẫn cài đặt PNPM](https://pnpm.io/installation))
- **Git**
- **Docker** & **Docker Compose**

---

## 📥 Tải về và Cài đặt

### Phương án 1: Cài đặt với Docker (Khuyến nghị)

> ⚡ **Phương án này cho phép chạy toàn bộ hệ thống chỉ với Docker, không cần cài đặt Node.js hay PNPM**

#### 🔗 Tải về

**[⬇️ Tải file cài đặt từ Google Drive](https://drive.google.com/file/d/1L_htEfDkKlaCm_3RLJ4TdjZ_xXqPVqE2/view?usp=sharing)**

> **Lưu ý:** Nếu không tải trực tiếp được, vui lòng:
>
> 1. Click vào link trên
> 2. Click nút **Download** ở góc trên bên phải
> 3. Nếu file quá lớn, chọn **Download anyway**

---

#### 📦 Hướng dẫn Cài đặt

**Bước 1: Giải nén file**

1. Sau khi tải về, giải nén file `dangky-hocphan.zip`
2. Bạn sẽ có cấu trúc thư mục như sau:
   ```
   dangky-hocphan/
   ├── docker-compose.yaml
   ├── infra/
   │   └── init.sql
   └── README.md
   ```

**Bước 2: Khởi động ứng dụng**

Mở **Command Prompt** hoặc **PowerShell**, di chuyển vào thư mục vừa giải nén:

```bash
cd dangky-hocphan
docker-compose up -d
```

> ⏳ **Lưu ý:** Lần đầu chạy có thể mất 5-10 phút để tải các Docker images.

**Bước 3: Kiểm tra trạng thái**

```bash
docker-compose ps
```

Đảm bảo tất cả các service đều có trạng thái **Up**.

**Bước 4: Truy cập ứng dụng**

Sau khi các container khởi động thành công:

- **Frontend (Giao diện người dùng):** [http://localhost:5173](http://localhost:5173)
- **Backend (API Server):** [http://localhost:3000](http://localhost:3000)
- **Database:** Host: `localhost`, Port: `5433`

---

#### 🛑 Dừng và Gỡ bỏ

**Dừng ứng dụng (giữ lại dữ liệu):**

```bash
docker-compose down
```

**Khởi động lại:**

```bash
docker-compose up -d
```

**Xóa hoàn toàn (bao gồm dữ liệu):**

```bash
docker-compose down -v
```

---

#### ❓ Xử lý Sự cố

**Lỗi: Port đã được sử dụng**

Nếu gặp lỗi `port already allocated`, có nghĩa là port đang được sử dụng bởi ứng dụng khác. Sửa file `docker-compose.yaml`:

```yaml
# Đổi port database
ports:
  - "5434:5432"  # Thay vì 5433:5432

# Đổi port backend
ports:
  - "3001:3000"  # Thay vì 3000:3000

# Đổi port frontend
ports:
  - "5174:5173"  # Thay vì 5173:5173
```

**Lỗi: Không kết nối được database**

```bash
# Kiểm tra logs của database
docker-compose logs db

# Khởi động lại database
docker-compose restart db

# Nếu vẫn lỗi, xóa và tạo lại
docker-compose down -v
docker-compose up -d
```

**Lỗi: Docker Desktop chưa khởi động**

Đảm bảo Docker Desktop đang chạy trước khi thực hiện các lệnh `docker-compose`.

---

### Phương án 2: Cài đặt Development

> 👨‍💻 **Phương án này dành cho developer muốn phát triển và chỉnh sửa code**

#### Bước 1: Clone Repository

```bash
git clone https://github.com/DuongThanhTaii/DangKyHocPhanHCMUE-CNPM.git
cd hcmue-reg
```

#### Bước 2: Cài đặt Dependencies

Sử dụng `pnpm` để cài đặt tất cả các gói cần thiết cho toàn bộ monorepo.

```bash
pnpm install
```

#### Bước 3: Cấu hình Biến môi trường

Dự án yêu cầu hai file môi trường để hoạt động: một cho Database và một cho Backend.

1.  **Database Environment:**
    Tạo một file tên là `.env` bên trong thư mục `infra` (`infra/.env`). File này sẽ được `docker-compose.yml` sử dụng.

    ```env
    # infra/.env
    POSTGRES_DB=hcmue_db
    POSTGRES_USER=admin
    POSTGRES_PASSWORD=supersecretpassword
    ```

2.  **Backend Environment:**
    Tạo một file `.env` bên trong thư mục `apps/backend` (`apps/backend/.env`). Backend sẽ dùng file này để kết nối tới database.
    **Quan trọng:** Các giá trị này phải khớp với file `infra/.env` ở trên.

    ```env
    # apps/backend/.env
    DATABASE_URL="postgresql://admin:supersecretpassword@localhost:5433/hcmue_db"
    ```

#### Bước 4: Khởi chạy Cơ sở dữ liệu

Vì file `docker-compose.yml` nằm trong `infra`, chúng ta cần chỉ định đường dẫn tới nó bằng cờ `-f`. Chạy lệnh sau từ **thư mục gốc** của dự án.

```bash
docker-compose -f infra/docker-compose.yml up -d
```

Lệnh này sẽ khởi tạo và chạy container PostgreSQL ở chế độ nền.

#### Bước 5: Chạy Backend và Frontend

Sử dụng lệnh `dev` ở thư mục gốc để khởi động đồng thời cả hai ứng dụng.

```bash
pnpm dev
```

#### Bước 6: Truy cập ứng dụng

Sau khi các tiến trình khởi động thành công:

- **Frontend (Giao diện người dùng):** [http://localhost:5173](http://localhost:5173) (Port mặc định của Vite)
- **Backend (API Server):** [http://localhost:3000](http://localhost:3000)
- **Kết nối Database:** Host: `localhost`, Port: `5433`

---

## 💡 Các lệnh hữu ích

### Lệnh Docker (Cho người dùng)

```bash
# Kiểm tra trạng thái các container
docker-compose ps

# Xem logs của tất cả services
docker-compose logs -f

# Xem logs của một service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Khởi động lại tất cả services
docker-compose restart

# Khởi động lại một service cụ thể
docker-compose restart backend

# Dừng ứng dụng (giữ dữ liệu)
docker-compose down

# Xóa hoàn toàn (bao gồm dữ liệu)
docker-compose down -v

# Cập nhật images mới nhất
docker-compose pull
docker-compose up -d
```

---

### Lệnh Docker cho Development

**Lưu ý:** Tất cả các lệnh `docker-compose` đều phải được chạy từ **thư mục gốc** và sử dụng cờ `-f infra/docker-compose.yml`.

- **Dừng và xóa container database:**
  ```bash
  docker-compose -f infra/docker-compose.yml down
  ```
- **Dừng, xóa container VÀ xóa luôn DỮ LIỆU (làm mới database):**
  ```bash
  docker-compose -f infra/docker-compose.yml down -v
  ```
- **Xem log của database:**
  ```bash
  docker-compose -f infra/docker-compose.yml logs -f db
  ```

---

### Quản lý Prisma (Chạy từ `apps/backend`)

Để chạy các lệnh này, bạn cần di chuyển vào thư mục backend trước: `cd apps/backend`.

- **Đồng bộ schema với database:**
  _Lệnh này sẽ kéo cấu trúc hiện tại của DB về file `schema.prisma`._
  ```bash
  pnpm prisma:pull
  ```
- **Chạy file seed để thêm dữ liệu mẫu:**
  ```bash
  pnpm seed
  ```
- **Mở Prisma Studio (Công cụ quản lý DB trực quan):**
  ```bash
  pnpm prisma studio
  ```
  Sau đó truy cập [http://localhost:5555](http://localhost:5555).

---

## 📄 Giấy phép

Dự án này được cấp phép theo Giấy phép MIT.

---
