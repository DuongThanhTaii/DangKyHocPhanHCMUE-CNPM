import { PrismaClient as PrismaClientMongo } from "../../node_modules/.prisma/client-mongo";

const mongoClient = new PrismaClientMongo();

async function testConnection() {
    try {
        console.log("🔌 Đang kết nối MongoDB...");

        await mongoClient.$connect();
        console.log("✅ Kết nối MongoDB thành công!");

        // Test với raw query thay vì model query
        const db = await mongoClient.$runCommandRaw({
            ping: 1
        });
        console.log("🏓 Ping database:", db);

        // Test create thay vì count
        console.log("\n📝 Test tạo document...");
        const testDoc = await mongoClient.thoiKhoaBieuMonHoc.create({
            data: {
                maHocPhan: "TEST01",
                hocKyId: "test-hk-001",
                danhSachLop: []
            }
        });
        console.log("✅ Tạo document thành công:", testDoc.id);

        // Test count
        const count = await mongoClient.thoiKhoaBieuMonHoc.count();
        console.log(`📊 Số lượng TKB: ${count}`);

        // Cleanup
        await mongoClient.thoiKhoaBieuMonHoc.delete({
            where: { id: testDoc.id }
        });
        console.log("🗑️ Đã xóa document test");

        await mongoClient.$disconnect();
        console.log("\n✅ Test hoàn tất!");
    } catch (error) {
        console.error("❌ Lỗi:", error);
        await mongoClient.$disconnect();
    }
}

testConnection();
