import * as cron from "node-cron";
import { UnitOfWork } from "../repositories/unitOfWork";

export class PhaseSchedulerService {
    private static instance: PhaseSchedulerService;
    private unitOfWork: UnitOfWork;
    private cronJob?: cron.ScheduledTask;

    private constructor() {
        this.unitOfWork = UnitOfWork.getInstance();
    }

    static getInstance(): PhaseSchedulerService {
        if (!PhaseSchedulerService.instance) {
            PhaseSchedulerService.instance = new PhaseSchedulerService();
        }
        return PhaseSchedulerService.instance;
    }

    start() {
        // ❌ COMMENT hoặc XÓA auto-enable logic
        // setInterval(() => this.checkAndEnablePhases(), 60000);
        
        console.log("[PhaseScheduler] ⚠️ DISABLED for demo (manual control via admin panel)");
    }

    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            console.log("Phase Scheduler stopped");
        }
    }

    private async updatePhaseStatus() {
        try {
            const now = new Date();

            // Transaction để đảm bảo atomicity
            await this.unitOfWork.transaction(async (tx) => {
                // 1. Disable tất cả phases đã hết hạn (end_at < now)
                await (tx as any).ky_phase.updateMany({
                    where: {
                        is_enabled: true,
                        end_at: {
                            lt: now,
                        },
                    },
                    data: {
                        is_enabled: false,
                    },
                });

                // 2. Enable phases đang trong thời gian hoạt động (start_at <= now <= end_at)
                await (tx as any).ky_phase.updateMany({
                    where: {
                        is_enabled: false,
                        start_at: {
                            lte: now,
                        },
                        end_at: {
                            gte: now,
                        },
                    },
                    data: {
                        is_enabled: true,
                    },
                });

                // 3. Disable phases chưa đến thời gian (start_at > now)
                await (tx as any).ky_phase.updateMany({
                    where: {
                        is_enabled: true,
                        start_at: {
                            gt: now,
                        },
                    },
                    data: {
                        is_enabled: false,
                    },
                });
            });

            console.log(`[${now.toISOString()}] Phase status updated successfully`);
        } catch (error) {
            console.error("Error updating phase status:", error);
        }
    }

    // Method để force update ngay lập tức (dùng khi cần test hoặc manual trigger)
    async forceUpdate() {
        await this.updatePhaseStatus();
    }
}