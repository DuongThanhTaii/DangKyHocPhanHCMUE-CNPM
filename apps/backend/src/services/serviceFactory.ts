import { UnitOfWork } from "../repositories/unitOfWork";
import { CheckTrangThaiForSinhVien } from "./CheckTrangThaiForSinhVien";
import { DeXuatHocPhanService } from "./deXuatHocPhanService";
import { DotDangKyService } from "./dotDangKyService";
import { HocKyService } from "./hocKyService";
import { HocPhanService } from "./hocPhanService";
import { KyPhaseService } from "./kyPhaseService";
import { PhongHocService } from "./phongHocService";
import { SinhVienService } from "./sinhVienService";
import { GiangVienService } from "./giangVienService";
import { LopHocPhanSinhVienService } from "./lopHocPhanSinhVienService";
import { DangKyHocPhanSinhVienService } from "./dangKyHocPhanSinhVienService";
import { GvLopHocPhanService } from "./gvLopHocPhanService";
import { LichSuDangKySinhVienService } from "./lichSuDangKySinhVienService";
import { HocPhiService } from "./hocPhiService";
import { ChinhSachTinChiService } from "./chinhSachTinChiService";
import { DanhMucService } from "./danhMucService";

export class ServiceFactory {
    private static instance: ServiceFactory;
    private unitOfWork: UnitOfWork;

    private _hocKyService?: HocKyService;
    private _kyPhaseService?: KyPhaseService;
    private _deXuatHocPhanService?: DeXuatHocPhanService;
    private _sinhVienService?: SinhVienService;
    private _dotDangKyService?: DotDangKyService;
    private _checkTrangThaiForSinhVien?: CheckTrangThaiForSinhVien;
    private _hocphanService?: HocPhanService;
    private _phongHocService?: PhongHocService;
    private _giangVienService?: GiangVienService;
    private _lopHocPhanSinhVienService?: LopHocPhanSinhVienService;
    private _dangKyHocPhanSinhVienService?: DangKyHocPhanSinhVienService;
    private _gvLopHocPhanService?: GvLopHocPhanService;
    private _lichSuDangKySinhVienService?: LichSuDangKySinhVienService;
    private _hocPhiService?: HocPhiService;
    private _chinhSachTinChiService?: ChinhSachTinChiService;
    private _danhMucService?: DanhMucService;
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
    get dotDangKyService() {
        if (!this._dotDangKyService) {
            this._dotDangKyService = new DotDangKyService(this.unitOfWork);
        }
        return this._dotDangKyService;
    }

    get hocphanService() {
        if (!this._hocphanService) {
            this._hocphanService = new HocPhanService();
        }
        return this._hocphanService;
    }

    get phongHocService() {
        if (!this._phongHocService) {
            this._phongHocService = new PhongHocService();
        }
        return this._phongHocService;
    }
    get giangVienService() {
        if (!this._giangVienService) {
            this._giangVienService = new GiangVienService();
        }
        return this._giangVienService;
    }
    get checkTrangThaiForSinhVien() {
        if (!this._checkTrangThaiForSinhVien) {
            this._checkTrangThaiForSinhVien = new CheckTrangThaiForSinhVien(this.unitOfWork);
        }
        return this._checkTrangThaiForSinhVien;
    }

    get lopHocPhanSinhVienService() {
        if (!this._lopHocPhanSinhVienService) {
            this._lopHocPhanSinhVienService = new LopHocPhanSinhVienService();
        }
        return this._lopHocPhanSinhVienService;
    }

    get dangKyHocPhanSinhVienService() {
        if (!this._dangKyHocPhanSinhVienService) {
            this._dangKyHocPhanSinhVienService = new DangKyHocPhanSinhVienService();
        }
        return this._dangKyHocPhanSinhVienService;
    }

    get gvLopHocPhanService() {
        if (!this._gvLopHocPhanService) {
            this._gvLopHocPhanService = new GvLopHocPhanService();
        }
        return this._gvLopHocPhanService;
    }

    get lichSuDangKySinhVienService() {
        if (!this._lichSuDangKySinhVienService) {
            this._lichSuDangKySinhVienService = new LichSuDangKySinhVienService();
        }
        return this._lichSuDangKySinhVienService;
    }

    get hocPhiService() {
        if (!this._hocPhiService) {
            this._hocPhiService = new HocPhiService();
        }
        return this._hocPhiService;
    }

    get chinhSachTinChiService() {
        if (!this._chinhSachTinChiService) {
            this._chinhSachTinChiService = new ChinhSachTinChiService();
        }
        return this._chinhSachTinChiService;
    }

    get danhMucService() {
        if (!this._danhMucService) {
            this._danhMucService = new DanhMucService();
        }
        return this._danhMucService;
    }
}