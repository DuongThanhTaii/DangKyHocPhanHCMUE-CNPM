# Hệ thống Đăng ký Học phần - HCMUE (hcmue-reg)

> Một hệ thống đăng ký học phần hiện đại được xây dựng trên kiến trúc Monorepo, sử dụng React (Vite) cho Frontend, Express.js cho Backend và được quản lý bởi PNPM Workspaces. Dữ liệu được vận hành trên PostgreSQL với sự hỗ trợ của Prisma ORM và Docker.

---

## 📖 Mục lục

- [🛠️ Công nghệ sử dụng](#️-công-nghệ-sử-dụng)
- [📂 Cấu trúc dự án](#-cấu-trúc-dự-án)
- [📋 Yêu cầu tiên quyết](#-yêu-cầu-tiên-quyết)
- [🚀 Hướng dẫn Cài đặt & Khởi chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
- [💡 Các lệnh hữu ích](#-các-lệnh-hữu-ích)
- [📄 Giấy phép](#-giấy-phép)

---

## 🛠️ Công nghệ sử dụng

| Lĩnh vực | Công nghệ |
| :--- | :--- |
| **Monorepo** | [PNPM Workspaces](https://pnpm.io/workspaces) |
| **Frontend** | [React](https://reactjs.org/), [Vite](https://vitejs.dev/), [Redux Toolkit](https://redux-toolkit.js.org/), [React Router](https://reactrouter.com/), [TypeScript](https://www.typescriptlang.org/) |
| **Backend** | [Express.js](https://expressjs.com/), [Prisma](https://www.prisma.io/), [Zod](https://zod.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Cơ sở dữ liệu** | [PostgreSQL 16](https://www.postgresql.org/) |
| **Containerization** | [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/) |

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
│   └── docker-compose.yml  # Định nghĩa service database cho Docker
├── packages/shared         # Các gói dùng chung (components, types, etc.) 
│   ├── package.json        # Cấu hình gốc và workspaces của pnpm
    └── pnpm-workspace.yaml
├── .gitignore   
└── README.md
```

---

## 📋 Yêu cầu tiên quyết

Để khởi chạy dự án, bạn cần đảm bảo đã cài đặt các công cụ sau trên máy tính của mình:

-   **Node.js**: `v18.x` trở lên
-   **PNPM**: `v8.x` trở lên ([Hướng dẫn cài đặt PNPM](https://pnpm.io/installation))
-   **Git**
-   **Docker** & **Docker Compose**

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### Bước 1: Clone Repository

```bash
git clone https://github.com/DuongThanhTaii/DangKyHocPhanHCMUE-CNPM.git
cd hcmue-reg
```

### Bước 2: Cài đặt Dependencies

Sử dụng `pnpm` để cài đặt tất cả các gói cần thiết cho toàn bộ monorepo.

```bash
pnpm install
```

### Bước 3: Cấu hình Biến môi trường

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

### Bước 4: Khởi chạy Cơ sở dữ liệu

Vì file `docker-compose.yml` nằm trong `infra`, chúng ta cần chỉ định đường dẫn tới nó bằng cờ `-f`. Chạy lệnh sau từ **thư mục gốc** của dự án.

```bash
docker-compose -f infra/docker-compose.yml up -d
```

Lệnh này sẽ khởi tạo và chạy container PostgreSQL ở chế độ nền.

### Bước 5: Chạy Backend và Frontend

Sử dụng lệnh `dev` ở thư mục gốc để khởi động đồng thời cả hai ứng dụng.

```bash
pnpm dev
```

### Bước 6: Truy cập ứng dụng

Sau khi các tiến trình khởi động thành công:
-   **Frontend (Giao diện người dùng):** [http://localhost:5173](http://localhost:5173) (Port mặc định của Vite)
-   **Backend (API Server):** [http://localhost:3000](http://localhost:3000)
-   **Kết nối Database:** Host: `localhost`, Port: `5433`

---

## 💡 Các lệnh hữu ích

**Lưu ý:** Tất cả các lệnh `docker-compose` đều phải được chạy từ **thư mục gốc** và sử dụng cờ `-f infra/docker-compose.yml`.

#### Quản lý Docker

-   **Dừng và xóa container database:**
    ```bash
    docker-compose -f infra/docker-compose.yml down
    ```
-   **Dừng, xóa container VÀ xóa luôn DỮ LIỆU (làm mới database):**
    ```bash
    docker-compose -f infra/docker-compose.yml down -v
    ```
-   **Xem log của database:**
    ```bash
    docker-compose -f infra/docker-compose.yml logs -f db
    ```

#### Quản lý Prisma (Chạy từ `apps/backend`)

Để chạy các lệnh này, bạn cần di chuyển vào thư mục backend trước: `cd apps/backend`.

-   **Đồng bộ schema với database:**
    *Lệnh này sẽ kéo cấu trúc hiện tại của DB về file `schema.prisma`.*
    ```bash
    pnpm prisma:pull
    ```
-   **Chạy file seed để thêm dữ liệu mẫu:**
    ```bash
    pnpm seed
    ```
-   **Mở Prisma Studio (Công cụ quản lý DB trực quan):**
    ```bash
    pnpm prisma studio
    ```
    Sau đó truy cập [http://localhost:5555](http://localhost:5555).

---

## 📄 Giấy phép

Dự án này được cấp phép theo Giấy phép MIT.
