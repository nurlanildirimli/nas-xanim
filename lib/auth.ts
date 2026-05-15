import { prisma } from "@/lib/db";
import { getAdminAuth } from "@/lib/firebase-admin";

export class AuthError extends Error {
  constructor(
    message: string,
    public status = 401,
  ) {
    super(message);
  }
}

export async function requireUser(request: Request) {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new AuthError("UNAUTHENTICATED", 401);
  }

  const decoded = await getAdminAuth().verifyIdToken(token);
  const email = decoded.email;

  if (!email) {
    throw new AuthError("EMAIL_REQUIRED", 401);
  }

  return prisma.user.upsert({
    where: { firebaseUid: decoded.uid },
    update: {
      email,
      name: decoded.name ?? null,
    },
    create: {
      firebaseUid: decoded.uid,
      email,
      name: decoded.name ?? null,
    },
  });
}

function getAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function requireAdmin(request: Request) {
  const user = await requireUser(request);
  const adminEmails = getAdminEmails();

  if (user.role !== "ADMIN" && !adminEmails.has(user.email.toLowerCase())) {
    throw new AuthError("FORBIDDEN", 403);
  }

  return user;
}
