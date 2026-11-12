/**
 * Create a lecturer or administrator from the command line:
 *   npm run create-user -- --email name@uni.ac.ke --name "Dr. Name" --role LECTURER
 * The password is read from the NEW_USER_PASSWORD environment variable so it never
 * appears in shell history.
 */
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const arg = (k: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

async function main() {
  const email = arg("email")?.toLowerCase();
  const name = arg("name");
  const role = (arg("role") ?? "LECTURER").toUpperCase() as Role;
  const password = process.env.NEW_USER_PASSWORD;
  if (!email || !name || !password) throw new Error("Usage: NEW_USER_PASSWORD=... npm run create-user -- --email x --name y [--role LECTURER|ADMIN]");
  if (password.length < 12) throw new Error("Password must be at least 12 characters");
  if (!["LECTURER", "ADMIN"].includes(role)) throw new Error("Role must be LECTURER or ADMIN");
  const prisma = new PrismaClient();
  await prisma.user.create({ data: { email, name, role, passwordHash: await bcrypt.hash(password, 12) } });
  console.log(`Created ${role} ${email}`);
  await prisma.$disconnect();
}
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
