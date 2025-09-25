import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/taxonomy?parent=slug  -> list children + question counts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parentSlug = searchParams.get("parent");
  let parentId: string | null = null;

  if (parentSlug) {
    const parent = await prisma.taxonomyNode.findUnique({ where: { slug: parentSlug } });
    if (!parent) return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    parentId = parent.id;
  }

  const nodes = await prisma.taxonomyNode.findMany({
    where: { parentId: parentId ?? null },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  const ids = nodes.map(n => n.id);
  const counts = await prisma.questionTag.groupBy({
    by: ["taxonomyNodeId"],
    _count: { questionId: true },
    where: { taxonomyNodeId: { in: ids } },
  });
  const countMap = Object.fromEntries(counts.map(c => [c.taxonomyNodeId, c._count.questionId]));

  return NextResponse.json(nodes.map(n => ({
    id: n.id,
    name: n.name,
    slug: n.slug,
    type: n.type,
    description: n.description,
    questionCount: countMap[n.id] ?? 0,
  })));
}


