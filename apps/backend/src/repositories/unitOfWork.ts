import { PrismaClient } from "@prisma/client";
import { HocKyRepository } from "./hocKyRepository";
import { KyPhaseRepository } from "./kyPhaseRepository";
import { DeXuatHocPhanRepository } from "./deXuatHocPhanRepository";
import { TroLyKhoaRepository } from "./troLyKhoaRepository";
import { TruongKhoaRepository } from "./truongKhoaRepository";
import { HocPhanRepository } from "./hocPhanRepository";
import { TaiKhoanRepository } from "./taiKhoanRepository";
import { UsersRepository } from "./usersRepository";
import { SinhVienRepository } from "./sinhVienRepository";
import { KhoaRepository } from "./khoaRepository";
import { NganhRepository } from "./nganhRepository";

export class UnitOfWork {
  private static instance: UnitOfWork;
  private prisma: PrismaClient;

  private _hocKyRepository?: HocKyRepository;
  private _kyPhaseRepository?: KyPhaseRepository;
  private _deXuatHocPhanRepository?: DeXuatHocPhanRepository;
  private _troLyKhoaRepository?: TroLyKhoaRepository;
  private _truongKhoaRepository?: TruongKhoaRepository;
  private _hocPhanRepository?: HocPhanRepository;

  private _taiKhoanRepository?: TaiKhoanRepository;
  private _usersRepository?: UsersRepository;
  private _sinhVienRepository?: SinhVienRepository;

  private _khoaRepository?: KhoaRepository;
  private _nganhRepository?: NganhRepository;

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

  get deXuatHocPhanRepository(): DeXuatHocPhanRepository {
    if (!this._deXuatHocPhanRepository) {
      this._deXuatHocPhanRepository = new DeXuatHocPhanRepository(this.prisma);
    }
    return this._deXuatHocPhanRepository;
  }

  get troLyKhoaRepository(): TroLyKhoaRepository {
    if (!this._troLyKhoaRepository) {
      this._troLyKhoaRepository = new TroLyKhoaRepository(this.prisma);
    }
    return this._troLyKhoaRepository;
  }

  get truongKhoaRepository(): TruongKhoaRepository {
    if (!this._truongKhoaRepository) {
      this._truongKhoaRepository = new TruongKhoaRepository(this.prisma);
    }
    return this._truongKhoaRepository;
  }

  get hocPhanRepository(): HocPhanRepository {
    if (!this._hocPhanRepository) {
      this._hocPhanRepository = new HocPhanRepository(this.prisma);
    }
    return this._hocPhanRepository;
  }

  get taiKhoanRepository(): TaiKhoanRepository {
    if (!this._taiKhoanRepository)
      this._taiKhoanRepository = new TaiKhoanRepository(this.prisma);
    return this._taiKhoanRepository;
  }

  get usersRepository(): UsersRepository {
    if (!this._usersRepository)
      this._usersRepository = new UsersRepository(this.prisma);
    return this._usersRepository;
  }

  get sinhVienRepository(): SinhVienRepository {
    if (!this._sinhVienRepository)
      this._sinhVienRepository = new SinhVienRepository(this.prisma);
    return this._sinhVienRepository;
  }

  get khoaRepository(): KhoaRepository {
    if (!this._khoaRepository)
      this._khoaRepository = new KhoaRepository(this.prisma);
    return this._khoaRepository;
  }

  get nganhRepository(): NganhRepository {
    if (!this._nganhRepository)
      this._nganhRepository = new NganhRepository(this.prisma);
    return this._nganhRepository;
  }

  async transaction<T>(
    callback: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return callback(tx as PrismaClient);
    });
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
