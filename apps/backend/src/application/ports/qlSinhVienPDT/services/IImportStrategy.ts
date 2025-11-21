import { ImportSinhVienRecord } from "../../../../domain/value-objects/ImportSinhVienRecord.vo";

export interface IImportStrategy {
    parse(input: any): Promise<ImportSinhVienRecord[]>;
}

export const IImportStrategy = Symbol.for("QlSinhVienPDT.IImportStrategy");
