import { Router, type IRouter } from "express";
import { db, usersTable, linksTable, profileViewsTable, linkClicksTable } from "@workspace/db";
import { eq, count, gte, sql } from "drizzle-orm";
import { verifyToken } from "./auth.js";

const router: IRouter = Router();

async function authenticate(req: any): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  return verifyToken(authHeader.slice(7));
}

router.post("/click/:linkId", async (req, res) => {
  const { linkId } = req.params;
  const [link] = await db.select().from(linksTable).where(eq(linksTable.id, linkId)).limit(1);
  if (!link) return res.status(404).json({ error: "Link not found" });

  await db.insert(linkClicksTable).values({ linkId });
  return res.json({ success: true, message: "Click recorded" });
});

router.post("/view/:username", async (req, res) => {
  const { username } = req.params;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (!user) return res.status(404).json({ error: "User not found" });

  await db.insert(profileViewsTable).values({ userId: user.id });
  return res.json({ success: true, message: "View recorded" });
});

router.get("/dashboard", async (req, res) => {
  const userId = await authenticate(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalViewsResult] = await db
    .select({ count: count() })
    .from(profileViewsTable)
    .where(eq(profileViewsTable.userId, userId));

  const [totalClicksResult] = await db
    .select({ count: count() })
    .from(linkClicksTable)
    .where(
      sql`${linkClicksTable.linkId} IN (
        SELECT id FROM links WHERE user_id = ${userId}
      )`
    );

  const userLinks = await db.select().from(linksTable).where(eq(linksTable.userId, userId));

  const linkStatsRaw = await db
    .select({ linkId: linkClicksTable.linkId, clicks: count() })
    .from(linkClicksTable)
    .where(
      sql`${linkClicksTable.linkId} IN (
        SELECT id FROM links WHERE user_id = ${userId}
      )`
    )
    .groupBy(linkClicksTable.linkId);

  const linkClickMap: Record<string, number> = {};
  linkStatsRaw.forEach((r) => { linkClickMap[r.linkId] = Number(r.clicks); });

  const linkStats = userLinks.map((l) => ({
    linkId: l.id,
    title: l.title,
    clicks: linkClickMap[l.id] || 0,
  }));

  const recentViewsRaw = await db
    .select({
      date: sql<string>`DATE(${profileViewsTable.viewedAt})`,
      count: count(),
    })
    .from(profileViewsTable)
    .where(eq(profileViewsTable.userId, userId))
    .groupBy(sql`DATE(${profileViewsTable.viewedAt})`)
    .orderBy(sql`DATE(${profileViewsTable.viewedAt})`);

  const recentClicksRaw = await db
    .select({
      date: sql<string>`DATE(${linkClicksTable.clickedAt})`,
      count: count(),
    })
    .from(linkClicksTable)
    .where(
      sql`${linkClicksTable.linkId} IN (
        SELECT id FROM links WHERE user_id = ${userId}
      )`
    )
    .groupBy(sql`DATE(${linkClicksTable.clickedAt})`)
    .orderBy(sql`DATE(${linkClicksTable.clickedAt})`);

  return res.json({
    totalViews: Number(totalViewsResult?.count || 0),
    totalClicks: Number(totalClicksResult?.count || 0),
    linkStats,
    recentViews: recentViewsRaw.map((r) => ({ date: r.date, count: Number(r.count) })),
    recentClicks: recentClicksRaw.map((r) => ({ date: r.date, count: Number(r.count) })),
  });
});

export default router;
