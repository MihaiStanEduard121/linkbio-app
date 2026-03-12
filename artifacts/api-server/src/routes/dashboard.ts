import { Router, type IRouter } from "express";
import { db, usersTable, linksTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import crypto from "crypto";
import { verifyToken } from "./auth.js";

const router: IRouter = Router();

async function authenticate(req: any): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return verifyToken(token);
}

router.put("/profile", async (req, res) => {
  const userId = await authenticate(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { username, bio, avatarUrl } = req.body;

  if (username) {
    if (username.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters" });
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return res.status(400).json({ error: "Username can only contain letters, numbers, underscores, and hyphens" });
    }

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    if (existing.length > 0 && existing[0].id !== userId) {
      return res.status(409).json({ error: "Username already taken" });
    }
  }

  const updateData: Record<string, string> = {};
  if (username !== undefined) updateData.username = username;
  if (bio !== undefined) updateData.bio = bio;
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

  await db.update(usersTable).set(updateData).where(eq(usersTable.id, userId));

  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
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

router.get("/links", async (req, res) => {
  const userId = await authenticate(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const links = await db
    .select()
    .from(linksTable)
    .where(eq(linksTable.userId, userId))
    .orderBy(asc(linksTable.order));

  return res.json(
    links.map((l) => ({
      id: l.id,
      title: l.title,
      url: l.url,
      order: l.order,
      userId: l.userId,
    }))
  );
});

router.post("/links", async (req, res) => {
  const userId = await authenticate(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { title, url } = req.body;
  if (!title || !url) {
    return res.status(400).json({ error: "Title and URL are required" });
  }

  const existingLinks = await db.select().from(linksTable).where(eq(linksTable.userId, userId));
  const maxOrder = existingLinks.length > 0 ? Math.max(...existingLinks.map((l) => l.order)) : -1;

  const id = crypto.randomUUID();
  await db.insert(linksTable).values({
    id,
    userId,
    title,
    url,
    order: maxOrder + 1,
  });

  const link = await db.select().from(linksTable).where(eq(linksTable.id, id)).limit(1);
  const l = link[0];

  return res.status(201).json({
    id: l.id,
    title: l.title,
    url: l.url,
    order: l.order,
    userId: l.userId,
  });
});

router.put("/links/:linkId", async (req, res) => {
  const userId = await authenticate(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { linkId } = req.params;
  const links = await db.select().from(linksTable).where(eq(linksTable.id, linkId)).limit(1);

  if (links.length === 0 || links[0].userId !== userId) {
    return res.status(404).json({ error: "Link not found" });
  }

  const { title, url, order } = req.body;
  const updateData: Record<string, string | number> = {};
  if (title !== undefined) updateData.title = title;
  if (url !== undefined) updateData.url = url;
  if (order !== undefined) updateData.order = order;

  await db.update(linksTable).set(updateData).where(eq(linksTable.id, linkId));

  const updated = await db.select().from(linksTable).where(eq(linksTable.id, linkId)).limit(1);
  const l = updated[0];

  return res.json({
    id: l.id,
    title: l.title,
    url: l.url,
    order: l.order,
    userId: l.userId,
  });
});

router.delete("/links/:linkId", async (req, res) => {
  const userId = await authenticate(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { linkId } = req.params;
  const links = await db.select().from(linksTable).where(eq(linksTable.id, linkId)).limit(1);

  if (links.length === 0 || links[0].userId !== userId) {
    return res.status(404).json({ error: "Link not found" });
  }

  await db.delete(linksTable).where(eq(linksTable.id, linkId));

  return res.json({ success: true, message: "Link deleted" });
});

export default router;
