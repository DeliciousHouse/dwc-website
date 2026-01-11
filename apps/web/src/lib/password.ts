import bcrypt from "bcryptjs";

export async function hashPassword(password: string) {
  // bcryptjs uses an internal random salt; 12 is a reasonable baseline for web apps.
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

