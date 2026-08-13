import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";

// ─── Password Helpers ─────────────────────────────────────────────────────────

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (
  password: string,
  hashed: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashed);
};

// ─── Token Helpers ────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

export interface TokenPayload {
  adminId: string;
  role: string;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

// ─── Cookie Helpers ───────────────────────────────────────────────────────────

/** Cookies are marked secure in production or when served over HTTPS. */
export const isSecureContext = (): boolean => {
  return process.env.NODE_ENV === "production";
};

export const COOKIE_NAME = "cat_session";

export const cookieOptions = () => {
  const secure = isSecureContext();
  return {
    httpOnly: true,
    secure,
    sameSite: (secure ? "none" : "lax") as "none" | "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };
};
