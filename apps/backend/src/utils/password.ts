import bcrypt from "bcrypt";

const rounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, rounds);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}
