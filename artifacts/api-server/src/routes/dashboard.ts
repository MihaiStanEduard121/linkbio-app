import { Router, type IRouter } from "express";
import { db, usersTable, linksTable, linkClicksTable } from "@workspace/db";
import { eq, asc, count } from "drizzle-orm";
import crypto from "crypto";
import { verifyToken, serializeUser } from "./auth.js";

const router: IRouter = Router();

async function authenticate(req: any): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  return verifyToken(authHeader.slice(7));
}

router.put("/profile", async (req, res) => {
  const userId = await authenticate(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { username, bio, avatarUrl, appearance } = req.body;

  if (username !== undefined) {
    if (username.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters" });
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return res.status(400).json({ error: "Invalid username characters" });
    }
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (existing && existing.id !== userId) {
      return res.status(409).json({ error: "Username already taken" });
    }
  }

  const updateData: Record<string, any> = {};
  if (username !== undefined) updateData.username = username;
  if (bio !== undefined) updateData.bio = bio;
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

  if (appearance) {
    if (appearance.theme !== undefined) updateData.theme = appearance.theme;
    if (appearance.bgColor !== undefined) updateData.bgColor = appearance.bgColor;
    if (appearance.bgGradientFrom !== undefined) updateData.bgGradientFrom = appearance.bgGradientFrom;
    if (appearance.bgGradientTo !== undefined) updateData.bgGradientTo = appearance.bgGradientTo;
    if (appearance.bgGradientAngle !== undefined) updateData.bgGradientAngle = appearance.bgGradientAngle;
    if (appearance.textColor !== undefined) updateData.textColor = appearance.textColor;
    if (appearance.btnStyle !== undefined) updateData.btnStyle = appearance.btnStyle;
    if (appearance.btnRadius !== undefined) updateData.btnRadius = appearance.btnRadius;
    if (appearance.btnShadow !== undefined) updateData.btnShadow = appearance.btnShadow;
    if (appearance.fontStyle !== undefined) updateData.fontStyle = appearance.fontStyle;
  }

  if (Object.keys(updateData).length > 0) {
    await db.update(usersTable).set(updateData).where(eq(usersTable.id, userId));
  }

  const [u] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  return res.json(serializeUser(u));
});

router.get("/links", async (req, res) => {
  const userId = await authenticate(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const links = await db
    .select()
    .from(linksTable)
    .where(eq(linksTable.userId, userId))
    .orderBy(asc(linksTable.order));

  const clicksResult = await db
    .select({ linkId: linkClicksTable.linkId, clicks: count() })
    .from(linkClicksTable)
    .groupBy(linkClicksTable.linkId);

  const clickMap: Record<string, number> = {};
  clicksResult.forEach((r) => { clickMap[r.linkId] = Number(r.clicks); });

  return res.json(
    links.map((l) => ({
      id: l.id,
      title: l.title,
      url: l.url,
      order: l.order,
      enabled: l.enabled,
      icon: l.icon || "",
      userId: l.userId,
      clicks: clickMap[l.id] || 0,
    }))
  );
});

router.post("/links", async (req, res) => {
  const userId = await authenticate(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { title, url, icon } = req.body;
  if (!title || !url) return res.status(400).json({ error: "Title and URL are required" });

  const existingLinks = await db.select().from(linksTable).where(eq(linksTable.userId, userId));
  const maxOrder = existingLinks.length > 0 ? Math.max(...existingLinks.map((l) => l.order)) : -1;

  const id = crypto.randomUUID();
  await db.insert(linksTable).values({
    id,
    userId,
    title,
    url,
    icon: icon || "",
    order: maxOrder + 1,
    enabled: true,
  });

  const [l] = await db.select().from(linksTable).where(eq(linksTable.id, id)).limit(1);
  return res.status(201).json({
    id: l.id, title: l.title, url: l.url, order: l.order,
    enabled: l.enabled, icon: l.icon || "", userId: l.userId, clicks: 0,
  });
});

router.put("/links/reorder", async (req, res) => {
  const userId = await authenticate(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { linkIds } = req.body;
  if (!Array.isArray(linkIds)) return res.status(400).json({ error: "linkIds must be an array" });

  for (let i = 0; i < linkIds.length; i++) {
    await db
      .update(linksTable)
      .set({ order: i })
      .where(eq(linksTable.id, linkIds[i]));
  }

  return res.json({ success: true, message: "Links reordered" });
});

router.put("/links/:linkId", async (req, res) => {
  const userId = await authenticate(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { linkId } = req.params;
  const [link] = await db.select().from(linksTable).where(eq(linksTable.id, linkId)).limit(1);
  if (!link || link.userId !== userId) return res.status(404).json({ error: "Link not found" });

  const { title, url, order, enabled, icon } = req.body;
  const updateData: Record<string, any> = {};
  if (title !== undefined) updateData.title = title;
  if (url !== undefined) updateData.url = url;
  if (order !== undefined) updateData.order = order;
  if (enabled !== undefined) updateData.enabled = enabled;
  if (icon !== undefined) updateData.icon = icon;

  await db.update(linksTable).set(updateData).where(eq(linksTable.id, linkId));

  const [l] = await db.select().from(linksTable).where(eq(linksTable.id, linkId)).limit(1);
  const clicksResult = await db
    .select({ clicks: count() })
    .from(linkClicksTable)
    .where(eq(linkClicksTable.linkId, linkId));

  return res.json({
    id: l.id, title: l.title, url: l.url, order: l.order,
    enabled: l.enabled, icon: l.icon || "", userId: l.userId,
    clicks: Number(clicksResult[0]?.clicks || 0),
  });
});

router.delete("/links/:linkId", async (req, res) => {
  const userId = await authenticate(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { linkId } = req.params;
  const [link] = await db.select().from(linksTable).where(eq(linksTable.id, linkId)).limit(1);
  if (!link || link.userId !== userId) return res.status(404).json({ error: "Link not found" });

  await db.delete(linksTable).where(eq(linksTable.id, linkId));
  return res.json({ success: true, message: "Link deleted" });
});

export default router;
