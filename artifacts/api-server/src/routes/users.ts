import { Router, type IRouter } from "express";
import { db, usersTable, linksTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/:username", async (req, res) => {
  const { username } = req.params;

  const [u] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (!u) return res.status(404).json({ error: "User not found" });

  const links = await db
    .select()
    .from(linksTable)
    .where(eq(linksTable.userId, u.id))
    .orderBy(asc(linksTable.order));

  return res.json({
    username: u.username,
    bio: u.bio || "",
    avatarUrl: u.avatarUrl || "",
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
    links: links
      .filter((l) => l.enabled)
      .map((l) => ({
        id: l.id,
        title: l.title,
        url: l.url,
        order: l.order,
        enabled: l.enabled,
        icon: l.icon || "",
        userId: l.userId,
        clicks: 0,
      })),
  });
});

export default router;
