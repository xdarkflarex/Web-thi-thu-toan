"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type QuestionType = "MCQ4" | "TRUE_FALSE" | "SHORT_ANSWER";

type Question = {
  id: string;
  stem: string;
  type: QuestionType;
  options?: { id: string; content: string; isCorrect: boolean; order: number; label?: string }[];
  answers?: { id: string; text?: string; regex?: string }[];
};

export default function StudentExam() {
  const { t } = useTranslation(['common', 'student']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`/api/questions?page=1&pageSize=50&status=PUBLISHED`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || t('errorLoadingQuestions', { ns: 'student' }));
        setQuestions(data.items as Question[]);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const total = questions.length;

  function grade() {
    let correct = 0;
    for (const q of questions) {
      const user = answers[q.id];
      if (q.type === "MCQ4" || q.type === "TRUE_FALSE") {
        const chosen = q.options?.find(o => o.id === user);
        if (chosen?.isCorrect) correct++;
      } else if (q.type === "SHORT_ANSWER") {
        const val = (user ?? "").toString().trim();
        if (!val) continue;
        const okText = q.answers?.some(a => a.text && a.text.trim().toLowerCase() === val.toLowerCase());
        const okRegex = q.answers?.some(a => a.regex && new RegExp(a.regex).test(val));
        if (okText || okRegex) correct++;
      }
    }
    setResult({ correct, total });
  }

  if (loading) return <div className="container"><div>{t('loadingExam', { ns: 'student' })}</div></div>;
  if (error) return <div className="container"><div className="text-red-600">{error}</div></div>;

  return (
    <div className="container">
      <div className="quiz-header">
        <div className="quiz-header-left">
          <img className="quiz-logo" src="/logo.png" alt="logo" />
          <div className="quiz-title">{t('examTitle', { ns: 'student' })}</div>
        </div>
        <div className="quiz-header-right">
          <span className="timer-label">{t('time', { ns: 'student' })}</span>
          <span className="quiz-timer">--:--</span>
        </div>
      </div>
      <ol className="questions-scroll list-decimal pl-6">
        {questions.map((q, idx) => (
          <li key={q.id} className="question">
            <div className="question-title">{q.stem}</div>
            {(q.type === "MCQ4" || q.type === "TRUE_FALSE") && (
              <div className="options">
                {q.options?.sort((a,b)=>a.order-b.order).map(opt => (
                  <label key={opt.id} className="quiz-option">
                    <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === opt.id} onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt.id }))} />
                    <span className="option-label">{opt.label ?? String.fromCharCode(64+opt.order)}</span>
                    <span className="option-content">{opt.content}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type === "SHORT_ANSWER" && (
              <input className="border p-2 w-2/3" placeholder={t('enterAnswer', { ns: 'student' })} value={answers[q.id] ?? ""} onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} />
            )}
          </li>
        ))}
      </ol>
      <button id="submit-btn" onClick={grade}>{t('submit', { ns: 'student' })}</button>
      {result && <div id="result">{t('result', { ns: 'student' })}: {result.correct}/{result.total} {t('correctAnswers', { ns: 'student' })}</div>}
    </div>
  );
}


