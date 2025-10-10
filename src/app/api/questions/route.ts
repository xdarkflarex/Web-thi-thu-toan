import { NextRequest, NextResponse } from 'next/server'
import { QuestionService } from '@/lib/question-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const take = Math.max(1, Math.min(100, parseInt(searchParams.get('take') || '25')))
    const category = searchParams.get('category') || undefined
    const type = searchParams.get('type') || undefined
    const level = searchParams.get('level') || undefined

    const { items, itemCount, pageCount, hasPreviousPage, hasNextPage } = await QuestionService.getQuestions(page, take, {
      category,
      type,
      level,
    })

    return NextResponse.json({
      statusCode: 200,
      success: true,
      data: items,
      meta: {
        page,
        take,
        itemCount,
        pageCount,
        hasPreviousPage,
        hasNextPage,
      },
      message: 'success',
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { statusCode: 500, success: false, data: [], meta: null, message: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const question = await QuestionService.createQuestion(body)
    return NextResponse.json({ statusCode: 201, success: true, data: question, message: 'created' }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create question'
    console.error('Error creating question:', error)
    return NextResponse.json(
      { statusCode: 500, success: false, data: null, message },
      { status: 500 }
    )
  }
}