import { Router, type IRouter } from "express";
import { db, usersTable, linksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "linkbio_salt").digest("hex");
}

function generateId(): string {
  return crypto.randomUUID();
}

function generateToken(userId: string): string {
  const payload = { userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
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
  const passwordHash = hashPassword(password);

  await db.insert(usersTable).values({
    id,
    email,
    passwordHash,
    username,
    bio: "",
    avatarUrl: "",
  });

  const user = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  const u = user[0];

  const token = generateToken(id);

  return res.status(201).json({
    user: {
      id: u.id,
      email: u.email,
      username: u.username,
      bio: u.bio,
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt?.toISOString(),
    },
    token,
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (users.length === 0) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const u = users[0];
  if (u.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = generateToken(u.id);

  return res.json({
    user: {
      id: u.id,
      email: u.email,
      username: u.username,
      bio: u.bio,
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt?.toISOString(),
    },
    token,
  });
});

router.post("/logout", (_req, res) => {
  return res.json({ success: true, message: "Logged out" });
});

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const token = authHeader.slice(7);
  const userId = verifyToken(token);
  if (!userId) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (users.length === 0) {
    return res.status(401).json({ error: "User not found" });
  }

  const u = users[0];
  return res.json({
    id: u.id,
    email: u.email,
    username: u.username,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt?.toISOString(),
  });
});

export default router;
