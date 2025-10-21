import { NextRequest, NextResponse } from 'next/server'
import { QuestionService } from '@/lib/question-service'
import { requireRole } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const question = await QuestionService.getQuestionById(id)
    return NextResponse.json({ statusCode: 200, success: true, data: question, message: 'success' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Not found'
    return NextResponse.json(
      { statusCode: 404, success: false, data: null, message },
      { status: 404 }
    )
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(['teacher', 'admin'])
    const { id } = await params
    const body = await req.json()
    const updated = await QuestionService.updateQuestion(id, body)
    return NextResponse.json({ statusCode: 200, success: true, data: updated, message: 'updated' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update'
    const status = message === 'Forbidden' ? 401 : 500
    return NextResponse.json(
      { statusCode: status, success: false, data: null, message },
      { status }
    )
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(['teacher', 'admin'])
    const { id } = await params
    await QuestionService.deleteQuestion(id)
    return NextResponse.json({ statusCode: 200, success: true, data: null, message: 'deleted' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete'
    const status = message === 'Forbidden' ? 401 : 500
    return NextResponse.json(
      { statusCode: status, success: false, data: null, message },
      { status }
    )
  }
}


