import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const SECRET = process.env["SESSION_SECRET"] ?? "scrollio-dev-secret";
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: number): string {
  return jwt.sign({ userId }, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    const payload = jwt.verify(token, SECRET) as { userId: number };
    return payload;
  } catch {
    return null;
  }
}
