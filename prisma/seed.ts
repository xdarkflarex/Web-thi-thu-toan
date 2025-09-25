import { PrismaClient, NodeType, QuestionType, Difficulty, QuestionStatus } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

type Row = { name: string; slug: string; type: NodeType; parent_slug?: string; description?: string };

async function upsertNode(row: Row, cache: Map<string, string>) {
  const parentId = row.parent_slug ? cache.get(row.parent_slug) ?? null : null;
  const node = await prisma.taxonomyNode.upsert({
    where: { slug: row.slug },
    create: {
      name: row.name,
      slug: row.slug,
      type: row.type,
      description: row.description ?? null,
      parentId: parentId ?? undefined,
    },
    update: {
      name: row.name,
      type: row.type,
      description: row.description ?? null,
      parentId: parentId ?? undefined,
    },
  });
  cache.set(row.slug, node.id);
}

function parseCSV(csvPath: string): Row[] {
  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith("#"));
  const rows: Row[] = [];
  for (const line of lines) {
    const parts: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        // toggle quotes or handle escaped quotes ""
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        parts.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    parts.push(current.trim());

    // strip surrounding quotes
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith('"') && parts[i].endsWith('"')) {
        parts[i] = parts[i].slice(1, -1);
      }
    }

    if (parts.length < 3) continue;
    const [name, slug, type, parent_slug, description] = parts;
    rows.push({
      name,
      slug,
      type: (type as NodeType),
      parent_slug: parent_slug || undefined,
      description: description || undefined,
    });
  }
  return rows;
}

async function seedTaxonomy() {
  const csvPath = path.join(process.cwd(), "prisma", "taxonomy.csv");
  if (!fs.existsSync(csvPath)) {
    console.warn("taxonomy.csv not found, skipping taxonomy seed.");
    return;
  }
  const rows = parseCSV(csvPath);
  const order = { DOMAIN: 0, TOPIC: 1, SUBTOPIC: 2, OUTCOME: 3 } as Record<string, number>;
  rows.sort((a, b) => order[a.type] - order[b.type]);
  const idCache = new Map<string, string>();
  for (const r of rows) {
    await upsertNode(r, idCache);
  }
  console.log(`Seeded taxonomy nodes: ${rows.length}`);
}

async function seedSamples() {
  const topic = await prisma.taxonomyNode.findFirst({ where: { slug: "tinh-don-dieu-cua-ham-so" } });
  const outcome = await prisma.taxonomyNode.findFirst({ where: { slug: "nb-dong-bien-nghich-bien" } });

  const q1 = await prisma.question.create({
    data: {
      stem: "Cho hàm số f(x)=x^3-3x. Hỏi f'(x) > 0 trên khoảng nào?",
      type: QuestionType.MCQ4,
      difficulty: Difficulty.NHAN_BIET,
      status: QuestionStatus.PUBLISHED,
      options: {
        create: [
          { content: "(-∞,-1) ∪ (1,∞)", isCorrect: true, order: 1, label: "A" },
          { content: "(-1,1)", isCorrect: false, order: 2, label: "B" },
          { content: "(0,∞)", isCorrect: false, order: 3, label: "C" },
          { content: "(-∞,0)", isCorrect: false, order: 4, label: "D" }
        ]
      },
      tags: {
        create: [
          ...(topic ? [{ taxonomyNodeId: topic.id }] : []),
          ...(outcome ? [{ taxonomyNodeId: outcome.id }] : []),
        ]
      }
    }
  });

  const q2 = await prisma.question.create({
    data: {
      stem: "Mệnh đề: “Hàm số tăng trên (a,b) khi f'(x) > 0 với mọi x∈(a,b)”. Đây là phát biểu đúng hay sai?",
      type: QuestionType.TRUE_FALSE,
      difficulty: Difficulty.THONG_HIEU,
      status: QuestionStatus.PUBLISHED,
      options: {
        create: [
          { content: "Đúng", isCorrect: true, order: 1, label: "A" },
          { content: "Sai", isCorrect: false, order: 2, label: "B" }
        ]
      }
    }
  });

  const q3 = await prisma.question.create({
    data: {
      stem: "Tính ∫_0^1 (2x) dx (ghi kết quả dạng số thập phân hoặc phân số).",
      type: QuestionType.SHORT_ANSWER,
      difficulty: Difficulty.NHAN_BIET,
      status: QuestionStatus.PUBLISHED,
      answers: {
        create: [
          { text: "1", score: 1 },
          { regex: "^1(\\.0+)?$", score: 1 }
        ]
      }
    }
  });

  console.log("Seeded sample questions:", q1.id, q2.id, q3.id);
}

async function main() {
  await seedTaxonomy();
  await seedSamples();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});


