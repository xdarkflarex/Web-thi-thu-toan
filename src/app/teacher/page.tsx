"use client";
import { useEffect, useMemo, useState } from "react";

type QuestionType = "MCQ4" | "TRUE_FALSE" | "SHORT_ANSWER";
type Difficulty = "NHAN_BIET" | "THONG_HIEU" | "VAN_DUNG";

const typeSamples: Record<string, string> = {
  multiple: `Câu ví dụ. Hàm số nào sau đây là bậc nhất?\na) y = 2x + 1\nb) y = x^2 + 1\nc) y = 3/x\nd) y = \\sqrt{x}\n*Đáp án: a`,
  truefalse: `Câu ví dụ. Hàm số y = x^2 là hàm số bậc nhất.\n*Đáp án: sai`,
  short: `Câu ví dụ. Kết quả của 2 + 2 là?\n*Đáp án: 4`,
};

function parseLegacy(text: string, legacyType: "multiple" | "truefalse" | "short") {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  let question = ""; let options: string[] = []; let answerIndex = 0; let shortAnswer = "";
  if (legacyType === "multiple") {
    for (let i = 0; i < lines.length; i++) {
      if (i === 0) question = lines[0];
      else if (/^[a-d]\)/i.test(lines[i])) options.push(lines[i].replace(/^[a-d]\)\s*/i, ""));
      else if (lines[i].toLowerCase().startsWith("*đáp án:")) {
        const ans = lines[i].split(":")[1].trim().toLowerCase();
        answerIndex = ["a","b","c","d"].indexOf(ans);
      }
    }
    return { stem: question, type: "MCQ4" as QuestionType, options: options.map((content, i) => ({ label: String.fromCharCode(65+i), content, isCorrect: i === answerIndex, order: i+1 })) };
  } else if (legacyType === "truefalse") {
    question = lines[0] || "";
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].toLowerCase().startsWith("*đáp án:")) {
        const ans = lines[i].split(":")[1].trim().toLowerCase();
        answerIndex = (ans === "đúng" || ans === "dung") ? 0 : 1;
      }
    }
    const opts = ["Đúng","Sai"].map((content, i) => ({ label: i===0?"A":"B", content, isCorrect: i===answerIndex, order: i+1 }));
    return { stem: question, type: "TRUE_FALSE" as QuestionType, options: opts };
  } else {
    question = lines[0] || "";
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].toLowerCase().startsWith("*đáp án:")) shortAnswer = lines[i].split(":")[1].trim();
    }
    return { stem: question, type: "SHORT_ANSWER" as QuestionType, answers: shortAnswer ? [{ text: shortAnswer }] : [] };
  }
}

export default function TeacherIntegrated() {
  const [legacyType, setLegacyType] = useState<"multiple"|"truefalse"|"short">("multiple");
  const [legacyText, setLegacyText] = useState(typeSamples["multiple"]);
  const [difficulty, setDifficulty] = useState<Difficulty>("NHAN_BIET");
  const [tagSlugs, setTagSlugs] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [suggest, setSuggest] = useState<{ name: string; slug: string }[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  const parsed = useMemo(() => parseLegacy(legacyText, legacyType), [legacyText, legacyType]);

  useEffect(() => {
    // MathJax typeset preview if available
    // @ts-ignore
    if (window && (window as any).MathJax && (window as any).MathJax.typesetPromise) {
      // @ts-ignore
      (window as any).MathJax.typesetPromise();
    }
  }, [parsed, legacyText]);

  useEffect(() => {
    // Suggest top-level taxonomy children of domain 'mot-so-yeu-to-giai-tich' if available
    fetch(`/api/taxonomy?parent=mot-so-yeu-to-giai-tich`).then(r => r.json()).then(setSuggest).catch(() => {});
    // Load recent questions
    fetch(`/api/questions?page=1&pageSize=10`).then(r => r.json()).then(d => setRecent(d.items || [])).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMsg("Đang tạo câu hỏi...");
    try {
      const body: any = {
        stem: parsed.stem,
        type: parsed.type,
        difficulty,
        status: "PUBLISHED",
        tagSlugs: tagSlugs.split(",").map(s => s.trim()).filter(Boolean),
      };
      if (parsed.options) body.options = parsed.options;
      if (parsed.answers) body.answers = parsed.answers;
      const res = await fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Tạo câu hỏi thất bại");
      setStatusMsg("Tạo câu hỏi thành công: " + data.id);
    } catch (err: any) {
      setStatusMsg("Lỗi: " + err.message);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded border p-4">
        <h2 className="font-semibold mb-3">Soạn theo định dạng legacy</h2>
        <label className="block text-sm mb-1">Loại</label>
        <select className="border p-2 mb-2" value={legacyType} onChange={e => { const v = e.target.value as any; setLegacyType(v); setLegacyText(typeSamples[v]); }}>
          <option value="multiple">Trắc nghiệm 4 phương án</option>
          <option value="truefalse">Đúng/Sai</option>
          <option value="short">Trả lời ngắn</option>
        </select>
        <textarea className="w-full border p-2" rows={12} value={legacyText} onChange={e => setLegacyText(e.target.value)} />
        <p className="text-xs text-gray-600 mt-2">Gõ LaTeX giữa $...$ hoặc \\( ... \\).</p>
        <div className="mt-3">
          <label className="block text-sm mb-1">Mức độ</label>
          <select className="border p-2" value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)}>
            <option value="NHAN_BIET">Nhận biết</option>
            <option value="THONG_HIEU">Thông hiểu</option>
            <option value="VAN_DUNG">Vận dụng</option>
          </select>
        </div>
        <div className="mt-3">
          <label className="block text-sm mb-1">Tag slugs (phân cách bởi dấu phẩy)</label>
          <input className="w-full border p-2" placeholder="vd: tinh-don-dieu-cua-ham-so, nb-dong-bien-nghich-bien" value={tagSlugs} onChange={e => setTagSlugs(e.target.value)} />
        </div>
        <button onClick={submit as any} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Lưu câu hỏi</button>
        {statusMsg && <p className="text-sm mt-2">{statusMsg}</p>}
        <p className="text-sm text-gray-600">Cần cấu hình DATABASE_URL và migrate trước khi tạo câu hỏi.</p>
      </div>

      <div className="bg-white rounded border p-4">
        <h2 className="font-semibold mb-3">Preview</h2>
        <div className="mb-3">
          <div className="font-semibold mb-2">Câu hỏi</div>
          <div className="math-latex">{parsed.stem}</div>
        </div>
        {parsed.type === "MCQ4" && (
          <div className="space-y-2">
            {parsed.options?.map((opt: any, i: number) => (
              <label key={i} className="flex items-center gap-2">
                <input type="radio" name="prev" disabled checked={opt.isCorrect} />
                <span className="font-semibold text-blue-600">{opt.label})</span>
                <span className="math-latex">{opt.content}</span>
              </label>
            ))}
          </div>
        )}
        {parsed.type === "TRUE_FALSE" && (
          <div className="space-y-2">
            {parsed.options?.map((opt: any, i: number) => (
              <label key={i} className="flex items-center gap-2">
                <input type="radio" name="prev" disabled checked={opt.isCorrect} />
                <span className="font-semibold text-blue-600">{opt.content}</span>
              </label>
            ))}
          </div>
        )}
        {parsed.type === "SHORT_ANSWER" && (
          <div>
            <input type="text" className="border p-2 w-3/4" placeholder="Nhập đáp án..." />
          </div>
        )}
      </div>

      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded border p-4">
          <h3 className="font-semibold mb-2">Gợi ý tag (taxonomy)</h3>
          <div className="flex flex-wrap gap-2">
            {suggest.map(s => (
              <button key={s.slug} type="button" className="px-3 py-1 border rounded" onClick={() => setTagSlugs(v => v ? `${v}, ${s.slug}` : s.slug)}>{s.name}</button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded border p-4">
          <h3 className="font-semibold mb-2">Câu hỏi mới tạo</h3>
          <ul className="list-disc pl-5">
            {recent.map((q: any) => (
              <li key={q.id}><span className="text-xs text-gray-600">[{q.type} - {q.difficulty}]</span> {q.stem}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}


