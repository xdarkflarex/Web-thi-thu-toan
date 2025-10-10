import { NextRequest, NextResponse } from 'next/server'
import { QuestionService } from '@/lib/question-service'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const question = await QuestionService.getQuestionById(params.id)
    return NextResponse.json({ statusCode: 200, success: true, data: question, message: 'success' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Not found'
    return NextResponse.json(
      { statusCode: 404, success: false, data: null, message },
      { status: 404 }
    )
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const updated = await QuestionService.updateQuestion(params.id, body)
    return NextResponse.json({ statusCode: 200, success: true, data: updated, message: 'updated' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update'
    return NextResponse.json(
      { statusCode: 500, success: false, data: null, message },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await QuestionService.deleteQuestion(params.id)
    return NextResponse.json({ statusCode: 200, success: true, data: null, message: 'deleted' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete'
    return NextResponse.json(
      { statusCode: 500, success: false, data: null, message },
      { status: 500 }
    )
  }
}


