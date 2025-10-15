"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'

type Question = {
  id: string
  type: 'multiple-choice' | 'multiple-select' | 'short-answer'
  category: string
  question: string
  solution_guide: string | null
  level: 'recognize' | 'understand' | 'apply'
  short_answer: string | null
  correct_index: number | null
  correct_indices: number[] | null
  answers?: Array<{
    id: string
    question_id: string
    answer_text: string
    answer_order: number
  }>
  images?: Array<{
    id: string
    image_url: string
    image_label: string | null
    image_name: string | null
    image_order: number
  }>
}

type QuizState = {
  [questionId: string]: number | number[] | string | undefined
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function GuestExamPage() {
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<QuizState>({})
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let abort = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/questions?take=25`, { cache: 'no-store' })
        const json = await res.json()
        if (abort) return
        const items = (json?.data ?? []) as Question[]
        // Randomize and pick first 10 for a quick guest exam
        const picked = shuffle(items).slice(0, 10)
        setQuestions(picked)
      } catch (e) {
        setError('Failed to load questions')
      } finally {
        if (!abort) setLoading(false)
      }
    })()
    return () => {
      abort = true
    }
  }, [])

  const score = useMemo(() => {
    if (!submitted) return null as null | { correct: number; total: number }
    let correct = 0
    for (const q of questions) {
      const ans = answers[q.id]
      if (q.type === 'multiple-choice' && typeof ans === 'number' && q.correct_index !== null) {
        if (ans === q.correct_index) correct++
      } else if (q.type === 'multiple-select' && Array.isArray(ans) && Array.isArray(q.correct_indices)) {
        const a = [...(ans as number[])].sort().join(',')
        const b = [...(q.correct_indices as number[])].sort().join(',')
        if (a === b) correct++
      } else if (q.type === 'short-answer' && typeof ans === 'string' && q.short_answer) {
        if (ans.trim().toLowerCase() === q.short_answer.trim().toLowerCase()) correct++
      }
    }
    return { correct, total: questions.length }
  }, [submitted, answers, questions])

  const reset = () => {
    setAnswers({})
    setSubmitted(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl p-4">
        <div className="flex items-center gap-3 text-muted-foreground"><Spinner size="sm" /> Loading guest exam…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-3xl p-4">
        <Card>
          <CardHeader>
            <CardTitle>Guest exam</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Guest exam (no login required)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Your selections are kept only in your browser and are not saved to the server.
          </p>
          <Separator className="my-4" />

          <div className="space-y-8">
            {questions.map((q, idx) => (
              <div key={q.id} className="space-y-3">
                <div className="font-medium">{idx + 1}. {q.question}</div>
                {q.images && q.images.length > 0 && (
                  <div className="space-y-2">
                    {q.images.map((img) => (
                      <img key={img.id} src={img.image_url} alt={img.image_label ?? ''} className="max-h-64 rounded" />
                    ))}
                  </div>
                )}

                {q.type === 'multiple-choice' && (
                  <div className="space-y-2">
                    {q.answers?.sort((a, b) => a.answer_order - b.answer_order).map((opt, i) => {
                      const selected = answers[q.id] as number | undefined
                      return (
                        <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            checked={selected === i}
                            onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                          />
                          <span>{opt.answer_text}</span>
                        </label>
                      )
                    })}
                  </div>
                )}

                {q.type === 'multiple-select' && (
                  <div className="space-y-2">
                    {q.answers?.sort((a, b) => a.answer_order - b.answer_order).map((opt, i) => {
                      const selected = (answers[q.id] as number[] | undefined) ?? []
                      const has = selected.includes(i)
                      return (
                        <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={has}
                            onChange={(e) =>
                              setAnswers((prev) => {
                                const cur = ((prev[q.id] as number[] | undefined) ?? []).slice()
                                if (e.target.checked) {
                                  if (!cur.includes(i)) cur.push(i)
                                } else {
                                  const idx = cur.indexOf(i)
                                  if (idx >= 0) cur.splice(idx, 1)
                                }
                                return { ...prev, [q.id]: cur }
                              })
                            }
                          />
                          <span>{opt.answer_text}</span>
                        </label>
                      )
                    })}
                  </div>
                )}

                {q.type === 'short-answer' && (
                  <input
                    className="w-full border rounded px-3 py-2"
                    placeholder="Your answer"
                    value={(answers[q.id] as string | undefined) ?? ''}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  />
                )}

                {submitted && (
                  <div className="text-sm">
                    {(() => {
                      const ans = answers[q.id]
                      if (q.type === 'multiple-choice' && typeof ans === 'number' && q.correct_index !== null) {
                        const ok = ans === q.correct_index
                        return <span className={ok ? 'text-green-600' : 'text-red-600'}>{ok ? 'Correct' : 'Incorrect'}</span>
                      }
                      if (q.type === 'multiple-select' && Array.isArray(ans) && Array.isArray(q.correct_indices)) {
                        const a = [...ans].sort().join(',')
                        const b = [...q.correct_indices].sort().join(',')
                        const ok = a === b
                        return <span className={ok ? 'text-green-600' : 'text-red-600'}>{ok ? 'Correct' : 'Incorrect'}</span>
                      }
                      if (q.type === 'short-answer' && typeof ans === 'string' && q.short_answer) {
                        const ok = ans.trim().toLowerCase() === q.short_answer.trim().toLowerCase()
                        return <span className={ok ? 'text-green-600' : 'text-red-600'}>{ok ? 'Correct' : 'Incorrect'}</span>
                      }
                      return <span className="text-muted-foreground">No answer</span>
                    })()}
                  </div>
                )}

                <Separator className="mt-4" />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-6">
            {!submitted ? (
              <Button onClick={() => setSubmitted(true)}>Submit</Button>
            ) : (
              <>
                <Button onClick={reset} variant="secondary">Reset</Button>
                {score && (
                  <span className="text-sm text-muted-foreground">Score: {score.correct} / {score.total}</span>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


