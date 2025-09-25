import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QuestionStatus, QuestionType } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const node = searchParams.get("node");
  const type = searchParams.get("type") as QuestionType | null;
  const difficulty = searchParams.get("difficulty");
  const status = (searchParams.get("status") as QuestionStatus) || "PUBLISHED";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const where: any = { status };
  if (type) where.type = type;
  if (difficulty) where.difficulty = difficulty;
  if (node) {
    const t = await prisma.taxonomyNode.findUnique({ where: { slug: node } });
    if (!t) return NextResponse.json({ error: "node not found" }, { status: 404 });
    where.tags = { some: { taxonomyNodeId: t.id } };
  }

  const [items, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: { options: true, answers: true, tags: { include: { node: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.question.count({ where })
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

export async function POST(req: Request) {
  const body = await req.json();
  // expect: { stem, type, difficulty, status?, options?, answers?, tagSlugs?: string[] }
  const tagSlugs: string[] = body.tagSlugs ?? [];
  const tagNodes = await prisma.taxonomyNode.findMany({ where: { slug: { in: tagSlugs } } });
  const createTags = tagNodes.map(n => ({ taxonomyNodeId: n.id }));

  const created = await prisma.question.create({
    data: {
      stem: body.stem,
      type: body.type,
      difficulty: body.difficulty,
      status: body.status ?? "DRAFT",
      explanation: body.explanation ?? null,
      source: body.source ?? null,
      options: body.options ? { create: body.options } : undefined,
      answers: body.answers ? { create: body.answers } : undefined,
      tags: createTags.length ? { create: createTags } : undefined,
    },
    include: { options: true, answers: true, tags: { include: { node: true } } }
  });

  return NextResponse.json(created, { status: 201 });
}


