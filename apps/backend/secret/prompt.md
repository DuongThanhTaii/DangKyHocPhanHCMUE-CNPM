🎯 CLEAN ARCHITECTURE REFACTORING REQUEST
## 📌 MODULE INFORMATION

**Module Name:** [Tên module, VD: Quản lý Giảng Viên]

**Features:**
- [ ] CRUD (List, Detail, Create, Update, Delete)
- [ ] Import (Excel/Self-input/CSV)
- [ ] Export
- [ ] [Feature khác...]

---

## 📁 LEGACY CODE TO REFACTOR

**Files:**
modules/[module]/[router].ts
services/[service].ts

**API Endpoints (giữ nguyên để FE không sửa):**
GET /api/[prefix]/[resource]
POST /api/[prefix]/[resource]
PUT /api/[prefix]/[resource]/:id
DELETE /api/[prefix]/[resource]/:id
hoặc import từ router để xxem:


---

## 🏗️ ARCHITECTURE REQUIREMENTS

### **1. Domain Layer (Pure Business Logic)**
src/domain/
├── entities/
│ └── [Entity].entity.ts # Business rules, NO framework deps
└── value-objects/
└── [ValueObject].vo.ts # Validation logic


**Requirements:**
- [ ] Entity với business methods
- [ ] Value Objects cho validation
- [ ] NO dependencies (Prisma, Express, etc.)

---

### **2. Application Layer (Use Cases + Ports)**

src/application/
├── use-cases/
│ └── [moduleName]/
│ ├── crud/ # CRUD use cases
│ └── [feature]/ # Feature-specific use cases
├── ports/
│ └── [moduleName]/
│ ├── repositories/ # Repository interfaces
│ │ ├── I[Entity]Repository.ts
│ │ └── ...
│ ├── services/ # External service interfaces
│ │ ├── I[Service].ts
│ │ └── ...
│ └── IUnitOfWork.ts # ⭐ Module-specific UnitOfWork
└── dtos/
└── [moduleName]/
├── crud/ # CRUD DTOs with Zod
└── [feature]/ # Feature DTOs


**UnitOfWork Strategy:**

**Option A: Module-Specific UnitOfWork (Recommended)**
```typescript
// ✅ Mỗi module có UnitOfWork riêng
application/ports/qlSinhVienPDT/IUnitOfWork.ts
application/ports/qlGiangVien/IUnitOfWork.ts
application/ports/qlMonHoc/IUnitOfWork.ts
// ⚠️ UnitOfWork chung cho tất cả (phức tạp, khó maintain)
application/ports/shared/IUnitOfWork.ts

 Tôi chọn: [Option A / Option B]

Lý do: [Giải thích ngắn gọn]

3. Infrastructure Layer (Implementations)

src/infrastructure/
├── persistence/
│   └── [moduleName]/
│       ├── Prisma[Entity]Repository.ts
│       ├── Prisma[Related]Repository.ts
│       └── PrismaUnitOfWork.ts          # ⭐ Module UnitOfWork impl
├── services/
│   └── [moduleName]/
│       ├── [strategies]/                # Strategy implementations
│       └── [security]/                  # Hashers, validators
└── di/
    ├── container.ts                     # Global container
    └── modules/
        └── [moduleName].bindings.ts     # Module bindings

Transaction Management:

// Module-specific UnitOfWork
interface IUnitOfWork {
  transaction<T>(work: (repos: ModuleRepositories) => Promise<T>): Promise<T>
  
  // Direct access (outside transaction)
  get[Entity]Repository(): I[Entity]Repository
  get[Related]Repository(): I[Related]Repository
}

4. Presentation Layer (Controllers + Routes)
src/presentation/http/
├── controllers/
│   └── [moduleName]/
│       ├── [Entity]Controller.ts
│       └── [Feature]Controller.ts
└── routes/
    └── [moduleName]/
        ├── [resource].routes.ts
        └── [feature].routes.ts

🎨 DESIGN PATTERNS
Required:

 Repository Pattern (per entity)
 UnitOfWork Pattern (module-specific)
 Strategy Pattern (for [feature])
 Factory Pattern
 Observer Pattern
Concurrency Control:

 Batch operations: [số lượng concurrent, VD: 5]
 Limiter: [p-limit / custom]

 🗄️ DATABASE SCHEMA
Prisma Models: (paste relevant models)
model [main_entity] {
  id         String  @id @db.Uuid
  // ... fields
}

model [related_entity] {
  // ... fields
}

🔧 TECHNICAL SPECS
Validation:

 Zod schemas for DTOs
 Domain validation in Entities
 Business rules in Use Cases
Error Handling:

 ServiceResult pattern
 Error codes for FE
 Transaction rollback on error
Dependency Injection:

 InversifyJS container
 Symbol-based identifiers
 Module-specific bindings
 Register to global container
🚀 DELIVERABLES
Code:

 Domain Layer (Entities + VOs)
 Application Layer (Use Cases + Ports + DTOs)
 Infrastructure Layer (Repos + UnitOfWork + Services + DI)
 Presentation Layer (Controllers + Routes)
 Update routes.ts to mount new routes
Quality:

 TypeScript strict mode (no errors)
 Prisma schema mapping chính xác
 FE compatible (no breaking changes)
 Legacy code coexist (no conflicts)
Documentation:

 Migration guide (optional)
 Architecture diagram (optional)

 🎯 EXECUTION PHASES
Phase 1: Domain Layer (Entities + Value Objects)
Phase 2: Application Layer (Ports + Use Cases + DTOs)
Phase 3: Infrastructure Layer (Repositories + UnitOfWork + Services + DI)
Phase 4: Presentation Layer (Controllers + Routes)
Phase 5: Integration & Testing
