import { ThoiKhoaBieuRepository } from "../repositories/mongo/thoiKhoaBieuRepository";
import type { DanhSachLop } from "../../node_modules/.prisma/client-mongo";

const tkbRepo = new ThoiKhoaBieuRepository();

/**
 * Test tạo thời khóa biểu môn học
 */
async function testCreateTKBMonHoc() {
    console.log("\n🧪 Test: Tạo TKB môn học mới");

    try {
        const maHocPhan = "CNPM01";
        const hocKyId = "hk-2024-1";

        const danhSachLop: DanhSachLop[] = [
            {
                tenLop: "CNPM01.01",
                phongHocId: "1b803c32-0f4c-463c-a738-0c3ff90dbff0", // UUID từ PostgreSQL
                ngayBatDau: new Date("2024-01-08"),
                ngayKetThuc: new Date("2024-05-20"),
                tietBatDau: 1,
                tietKetThuc: 3,
                thuTrongTuan: 2, // Thứ 2
            },
            {
                tenLop: "CNPM01.02",
                phongHocId: "2c904d43-1e5d-574d-b849-eb92b8c312f1",
                ngayBatDau: new Date("2024-01-08"),
                ngayKetThuc: new Date("2024-05-20"),
                tietBatDau: 4,
                tietKetThuc: 6,
                thuTrongTuan: 3, // Thứ 3
            },
        ];

        const result = await tkbRepo.createTKBMonHoc(maHocPhan, hocKyId, danhSachLop);

        console.log("✅ Tạo TKB thành công:");
        console.log(JSON.stringify(result, null, 2));

        return result;
    } catch (error) {
        console.error("❌ Lỗi:", error);
        throw error;
    }
}

/**
 * Test thêm lớp vào TKB đã có
 */
async function testAddLop(tkbId: string) {
    console.log("\n🧪 Test: Thêm lớp vào TKB");

    try {
        const lopMoi: DanhSachLop = {
            tenLop: "CNPM01.03",
            phongHocId: "3d015e54-2f6e-685e-c95a-fc03c9d423g2",
            ngayBatDau: new Date("2024-01-08"),
            ngayKetThuc: new Date("2024-05-20"),
            tietBatDau: 7,
            tietKetThuc: 9,
            thuTrongTuan: 4, // Thứ 4
        };

        const result = await tkbRepo.addLop(tkbId, lopMoi);

        console.log("✅ Thêm lớp thành công:");
        console.log(JSON.stringify(result, null, 2));

        return result;
    } catch (error) {
        console.error("❌ Lỗi:", error);
        throw error;
    }
}

/**
 * Test upsert lớp
 */
async function testUpsertLop() {
    console.log("\n🧪 Test: Upsert lớp (tạo mới hoặc thêm vào)");

    try {
        const maHocPhan = "CNPM02";
        const hocKyId = "hk-2024-1";

        const lopMoi: DanhSachLop = {
            tenLop: "CNPM02.01",
            phongHocId: "4e126f65-3g7f-796f-d06b-gd14d0e534h3",
            ngayBatDau: new Date("2024-01-08"),
            ngayKetThuc: new Date("2024-05-20"),
            tietBatDau: 1,
            tietKetThuc: 3,
            thuTrongTuan: 5, // Thứ 5
        };

        const result = await tkbRepo.upsertLop(maHocPhan, hocKyId, lopMoi);

        console.log("✅ Upsert thành công:");
        console.log(JSON.stringify(result, null, 2));

        return result;
    } catch (error) {
        console.error("❌ Lỗi:", error);
        throw error;
    }
}

/**
 * Test tìm TKB theo mã học phần và học kỳ
 */
async function testFindByMaHocPhanAndHocKy() {
    console.log("\n🧪 Test: Tìm TKB theo mã học phần và học kỳ");

    try {
        const maHocPhan = "CNPM01";
        const hocKyId = "hk-2024-1";

        const result = await tkbRepo.findByMaHocPhanAndHocKy(maHocPhan, hocKyId);

        if (result) {
            console.log("✅ Tìm thấy TKB:");
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log("⚠️ Không tìm thấy TKB");
        }

        return result;
    } catch (error) {
        console.error("❌ Lỗi:", error);
        throw error;
    }
}

/**
 * Chạy tất cả test
 */
async function runAllTests() {
    console.log("🚀 Bắt đầu test TKB Môn Học\n");

    try {
        // Test 1: Tạo TKB mới
        const tkb = await testCreateTKBMonHoc();

        // Test 2: Thêm lớp
        await testAddLop(tkb.id);

        // Test 3: Upsert lớp
        await testUpsertLop();

        // Test 4: Tìm TKB
        await testFindByMaHocPhanAndHocKy();

        console.log("\n✅ Tất cả test đã pass!");
    } catch (error) {
        console.error("\n❌ Test thất bại:", error);
    }
}

// Chạy test
runAllTests();
