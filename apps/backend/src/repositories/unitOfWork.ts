import { PrismaClient } from "@prisma/client";
import { HocKyRepository } from "./hocKyRepository";
import { KyPhaseRepository } from "./kyPhaseRepository";

export class UnitOfWork {
    private static instance: UnitOfWork;
    private prisma: PrismaClient;

    private _hocKyRepository?: HocKyRepository;
    private _kyPhaseRepository?: KyPhaseRepository;

    private constructor() {
        this.prisma = new PrismaClient();
    }

    static getInstance(): UnitOfWork {
        if (!UnitOfWork.instance) {
            UnitOfWork.instance = new UnitOfWork();
        }
        return UnitOfWork.instance;
    }

    get hocKyRepository(): HocKyRepository {
        if (!this._hocKyRepository) {
            this._hocKyRepository = new HocKyRepository(this.prisma);
        }
        return this._hocKyRepository;
    }

    get kyPhaseRepository(): KyPhaseRepository {
        if (!this._kyPhaseRepository) {
            this._kyPhaseRepository = new KyPhaseRepository(this.prisma);
        }
        return this._kyPhaseRepository;
    }

    async transaction<T>(callback: (prisma: PrismaClient) => Promise<T>): Promise<T> {
        return this.prisma.$transaction(async (tx) => {
            return callback(tx as PrismaClient);
        });
    }

    async disconnect(): Promise<void> {
        await this.prisma.$disconnect();
    }
}