import { Router, type IRouter } from "express";
import { db, usersTable, linksTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/:username", async (req, res) => {
  const { username } = req.params;

  const users = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (users.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  const u = users[0];
  const links = await db
    .select()
    .from(linksTable)
    .where(eq(linksTable.userId, u.id))
    .orderBy(asc(linksTable.order));

  return res.json({
    username: u.username,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    links: links.map((l) => ({
      id: l.id,
      title: l.title,
      url: l.url,
      order: l.order,
      userId: l.userId,
    })),
  });
});

export default router;
