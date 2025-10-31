const axios = require("axios");

const testIPN = async () => {
  const mockIPNData = {
    partnerCode: "MOMO",
    orderId: "ORDER_1761854137145_82e78711-c455-4fb9-82e3-e02cb9270f08",
    requestId: "REQ_1761854137145",
    amount: 5000000,
    orderInfo: "Thanh toan hoc phi HK uuid",
    orderType: "momo_wallet",
    transId: "12345678",
    resultCode: 0,
    message: "Successful.",
    payType: "qr",
    responseTime: Date.now(),
    extraData: "",
    signature: "test_signature", // MoMo sẽ gửi signature thật
  };

  try {
    const response = await axios.post(
      "http://localhost:3000/api/payment/ipn",
      mockIPNData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ IPN Test Success:", response.data);
  } catch (error) {
    console.error("❌ IPN Test Failed:", error.response?.data || error.message);
  }
};

testIPN();
