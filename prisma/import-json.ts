import { PrismaClient, QuestionStatus, QuestionType, Difficulty } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

type JsonQuestion = {
  id?: number;
  type: "multiple" | "truefalse" | "short";
  question: string;
  options?: string[];
  answer: number | string;
};

const prisma = new PrismaClient();

function mapType(t: string): QuestionType {
  if (t === "multiple") return "MCQ4";
  if (t === "truefalse") return "TRUE_FALSE";
  return "SHORT_ANSWER";
}

async function ensureTag(slug: string, name?: string) {
  const node = await prisma.taxonomyNode.upsert({
    where: { slug },
    create: { slug, name: name || slug, type: "TOPIC" },
    update: { name: name || slug },
  });
  return node.id;
}

async function main() {
  const file = path.join(process.cwd(), "public", "db", "questions.json");
  if (!fs.existsSync(file)) {
    console.error("questions.json not found at:", file);
    process.exit(1);
  }
  const raw = fs.readFileSync(file, "utf8");
  const items = JSON.parse(raw) as JsonQuestion[];

  // Default mapping params
  const defaultDifficulty: Difficulty = "NHAN_BIET";
  const defaultStatus: QuestionStatus = "PUBLISHED";
  const defaultTagSlug = "tinh-don-dieu-cua-ham-so";
  const tagId = await ensureTag(defaultTagSlug, "Tính đơn điệu của hàm số");

  let created = 0;
  for (const q of items) {
    const type = mapType(q.type);
    const data: any = {
      stem: q.question,
      type,
      difficulty: defaultDifficulty,
      status: defaultStatus,
      tags: { create: [{ taxonomyNodeId: tagId }] },
    };
    if (type === "MCQ4") {
      const opts = (q.options || []).slice(0, 4).map((content, i) => ({ content, order: i + 1, label: String.fromCharCode(65 + i), isCorrect: i === (q.answer as number) }));
      data.options = { create: opts };
    } else if (type === "TRUE_FALSE") {
      const ansIndex = (typeof q.answer === "number" ? q.answer : String(q.answer).toLowerCase().includes("đúng") ? 0 : 1) as number;
      data.options = { create: [
        { content: "Đúng", order: 1, label: "A", isCorrect: ansIndex === 0 },
        { content: "Sai", order: 2, label: "B", isCorrect: ansIndex === 1 },
      ] };
    } else {
      const textAns = typeof q.answer === "string" ? q.answer : String(q.answer);
      data.answers = { create: [{ text: textAns, score: 1 }] };
    }

    await prisma.question.create({ data });
    created++;
  }

  console.log(`Imported ${created} questions from JSON.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});


