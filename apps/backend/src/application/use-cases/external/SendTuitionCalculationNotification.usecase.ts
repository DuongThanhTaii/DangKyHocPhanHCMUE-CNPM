import { injectable, inject } from "inversify";
import { IEmailService } from "../../ports/external/IEmailService";
import { CalculationResultDTO } from "../../dtos/tuition/CalculationResultDTO";
@injectable()
export class SendTuitionCalculationNotificationUseCase {
    constructor(
        @inject(IEmailService) private emailService: IEmailService
    ) { }

    async execute(result: CalculationResultDTO, triggeredBy: string): Promise<void> {
        try {
            const subject = "Kết quả tính học phí hàng loạt";
            const body = `
Kết quả tính học phí:

- Tổng sinh viên: ${result.totalProcessed}
- Thành công: ${result.successCount}
- Thất bại: ${result.failedCount}

${result.failedCount > 0 ? `\nDanh sách lỗi:\n${result.errors.map((e: any) => `- ${e.mssv}: ${e.error}`).join('\n')}` : ''}

Người kích hoạt: ${triggeredBy}
Thời gian: ${new Date().toLocaleString('vi-VN')}
            `;

            await this.emailService.send({
                to: process.env.ADMIN_EMAIL || "admin@example.com",
                subject,
                body,
            });

            console.log("[EMAIL] Notification sent successfully");
        } catch (error) {
            console.error("[EMAIL] Failed to send notification:", error);
            // Don't throw - email failure shouldn't break tuition calculation
        }
    }
}
