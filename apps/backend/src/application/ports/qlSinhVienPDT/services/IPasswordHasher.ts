export interface IPasswordHasher {
    /**
     * Hash password using bcrypt
     */
    hash(password: string): Promise<string>;

    /**
     * Compare password with hash
     */
    compare(password: string, hash: string): Promise<boolean>;
}

export const IPasswordHasher = Symbol.for("QlSinhVienPDT.IPasswordHasher");
