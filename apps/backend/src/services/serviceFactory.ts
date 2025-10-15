import { UnitOfWork } from "../repositories/unitOfWork";
import { DeXuatHocPhanService } from "./deXuatHocPhanService";
import { HocKyService } from "./hocKyService";
import { KyPhaseService } from "./kyPhaseService";
import { SinhVienService } from "./sinhVienService";

export class ServiceFactory {
    private static instance: ServiceFactory;
    private unitOfWork: UnitOfWork;

    private _hocKyService?: HocKyService;
    private _kyPhaseService?: KyPhaseService;
    private _deXuatHocPhanService?: DeXuatHocPhanService;
    private _sinhVienService?: SinhVienService;
    private constructor() {
        this.unitOfWork = UnitOfWork.getInstance();
    }

    static getInstance(): ServiceFactory {
        if (!ServiceFactory.instance) {
            ServiceFactory.instance = new ServiceFactory();
        }
        return ServiceFactory.instance;
    }

    get hocKyService(): HocKyService {
        if (!this._hocKyService) {
            this._hocKyService = new HocKyService(this.unitOfWork);
        }
        return this._hocKyService;
    }

    get kyPhaseService(): KyPhaseService {
        if (!this._kyPhaseService) {
            this._kyPhaseService = new KyPhaseService(this.unitOfWork);
        }
        return this._kyPhaseService;
    }

    get deXuatHocPhanService() {
        if (!this._deXuatHocPhanService) {
            this._deXuatHocPhanService = new DeXuatHocPhanService(this.unitOfWork);
        }
        return this._deXuatHocPhanService;
    }
    get sinhVienService() {
        if (!this._sinhVienService) {
            this._sinhVienService = new SinhVienService(this.unitOfWork);
        }
        return this._sinhVienService;
    }
}