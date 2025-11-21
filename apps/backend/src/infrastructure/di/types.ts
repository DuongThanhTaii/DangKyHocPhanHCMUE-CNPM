export const TYPES = {
    // ...existing code...

    // ✅ QL Sinh Vien PDT Module (UNIQUE symbols)
    QlSinhVienPDT: {
        IUnitOfWork: Symbol.for("QlSinhVienPDT.IUnitOfWork"),
        ISinhVienRepository: Symbol.for("QlSinhVienPDT.ISinhVienRepository"),
        IPasswordHasher: Symbol.for("QlSinhVienPDT.IPasswordHasher"),
        CreateSinhVienUseCase: Symbol.for("QlSinhVienPDT.CreateSinhVienUseCase"),
        UpdateSinhVienUseCase: Symbol.for("QlSinhVienPDT.UpdateSinhVienUseCase"),
        ListSinhVienUseCase: Symbol.for("QlSinhVienPDT.ListSinhVienUseCase"),
        GetSinhVienDetailUseCase: Symbol.for("QlSinhVienPDT.GetSinhVienDetailUseCase"),
        DeleteSinhVienUseCase: Symbol.for("QlSinhVienPDT.DeleteSinhVienUseCase"),
        SinhVienController: Symbol.for("QlSinhVienPDT.SinhVienController"),
        ImportSinhVienController: Symbol.for("QlSinhVienPDT.ImportSinhVienController"),
        // ✅ THÊM USE CASE
        ImportSinhVienUseCase: Symbol.for("QlSinhVienPDT.ImportSinhVienUseCase"),
    },

    PdtQuanLyHocKy: {
        IUnitOfWork: Symbol.for("PdtQuanLyHocKy.IUnitOfWork"),
        // ... other symbols
    },

    DanhMuc: {
        IKhoaRepository: Symbol.for("DanhMuc.IKhoaRepository"),
        INganhRepository: Symbol.for("DanhMuc.INganhRepository"),
        ICoSoRepository: Symbol.for("DanhMuc.ICoSoRepository"),
        DanhMucUseCases: Symbol.for("DanhMuc.DanhMucUseCases"),
    },

    // ✅ PDT Quan Ly Phase Module
    PdtQuanLyPhase: {
        IKyPhaseRepository: Symbol.for("PdtQuanLyPhase.IKyPhaseRepository"),
        IHocKyRepository: Symbol.for("PdtQuanLyPhase.IHocKyRepository"),
        ToggleKyPhaseUseCase: Symbol.for("PdtQuanLyPhase.ToggleKyPhaseUseCase"),
        // ✅ ADD: New use case symbol
        GetCurrentActivePhaseUseCase: Symbol.for("PdtQuanLyPhase.GetCurrentActivePhaseUseCase"),
        KyPhaseController: Symbol.for("PdtQuanLyPhase.KyPhaseController"),
    },

    // ...existing code...
};