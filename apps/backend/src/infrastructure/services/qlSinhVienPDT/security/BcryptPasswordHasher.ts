import { injectable } from "inversify";
import bcrypt from "bcrypt";
import { IPasswordHasher } from "../../../../application/ports/qlSinhVienPDT/services/IPasswordHasher";

@injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    async compare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
