import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "linkbio_salt_v2").digest("hex");
}

function generateId(): string {
  return crypto.randomUUID();
}

function generateToken(userId: string): string {
  const payload = { userId, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function verifyToken(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return payload.userId;
  } catch {
    return null;
  }
}

function serializeUser(u: any) {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    bio: u.bio || "",
    avatarUrl: u.avatarUrl || "",
    createdAt: u.createdAt?.toISOString(),
    appearance: {
      theme: u.theme || "dark",
      bgColor: u.bgColor || "",
      bgGradientFrom: u.bgGradientFrom || "",
      bgGradientTo: u.bgGradientTo || "",
      bgGradientAngle: u.bgGradientAngle ?? 135,
      textColor: u.textColor || "",
      btnStyle: u.btnStyle || "solid",
      btnRadius: u.btnRadius ?? 12,
      btnShadow: u.btnShadow ?? true,
      fontStyle: u.fontStyle || "inter",
    },
  };
}

router.post("/register", async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ error: "Email, password, and username are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  if (username.length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters" });
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return res.status(400).json({ error: "Username can only contain letters, numbers, underscores, and hyphens" });
  }

  const existingEmail = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existingEmail.length > 0) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const existingUsername = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (existingUsername.length > 0) {
    return res.status(409).json({ error: "Username already taken" });
  }

  const id = generateId();
  await db.insert(usersTable).values({
    id,
    email,
    passwordHash: hashPassword(password),
    username,
    bio: "",
    avatarUrl: "",
    theme: "dark",
    btnStyle: "solid",
    btnRadius: 12,
    btnShadow: true,
    fontStyle: "inter",
  });

  const [u] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  return res.status(201).json({ user: serializeUser(u), token: generateToken(id) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const [u] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!u || u.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  return res.json({ user: serializeUser(u), token: generateToken(u.id) });
});

router.post("/logout", (_req, res) => {
  return res.json({ success: true, message: "Logged out" });
});

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const userId = verifyToken(authHeader.slice(7));
  if (!userId) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const [u] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!u) return res.status(401).json({ error: "User not found" });
  return res.json(serializeUser(u));
});

export { serializeUser };
export default router;
