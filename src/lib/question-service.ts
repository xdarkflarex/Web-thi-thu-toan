import { supabase, supabaseAdmin } from './supabase'
import { Database } from '@/types/database'

type Question = Database['public']['Tables']['questions']['Row']
// type QuestionInsert = Database['public']['Tables']['questions']['Insert']
type QuestionAnswer = Database['public']['Tables']['question_answers']['Row']
type QuestionAnswerInsert = Database['public']['Tables']['question_answers']['Insert']
type QuestionImage = Database['public']['Tables']['question_images']['Row']
type QuestionImageInsert = Database['public']['Tables']['question_images']['Insert']

export interface QuestionWithRelations extends Question {
  answers: QuestionAnswer[]
  images: QuestionImage[]
}

export interface CreateQuestionData {
  type: 'multiple-choice' | 'multiple-select' | 'short-answer'
  category: string
  question: string
  solutionGuide?: string
  level: 'recognize' | 'understand' | 'apply'
  answers: string[]
  shortAnswer?: string
  images: Array<{
    url: string
    label?: string
    name?: string
  }>
  correctIndex?: number | null
  correctIndices?: number[]
}

export class QuestionService {
  // Create a new question with answers and images
  static async createQuestion(data: CreateQuestionData): Promise<QuestionWithRelations> {
    const { answers, images, ...questionData } = data
    const client = supabaseAdmin ?? supabase

    // Start a transaction
    const { data: question, error: questionError } = await client
      .from('questions')
      .insert({
        type: questionData.type,
        category: questionData.category,
        question: questionData.question,
        level: questionData.level,
        solution_guide: questionData.solutionGuide,
        short_answer: questionData.shortAnswer,
        correct_index: questionData.correctIndex,
        correct_indices: questionData.correctIndices,
      })
      .select()
      .single()

    if (questionError) {
      throw new Error(`Failed to create question: ${questionError.message}`)
    }

    // Insert answers if provided
    if (answers && answers.length > 0) {
      const answerInserts: QuestionAnswerInsert[] = answers.map((answer, index) => ({
        question_id: question.id,
        answer_text: answer,
        answer_order: index,
      }))

      const { error: answersError } = await client
        .from('question_answers')
        .insert(answerInserts)

      if (answersError) {
        throw new Error(`Failed to create answers: ${answersError.message}`)
      }
    }

    // Insert images if provided
    if (images && images.length > 0) {
      const imageInserts: QuestionImageInsert[] = images
        .filter(img => img.url) // Only insert images with URLs
        .map((image, index) => ({
          question_id: question.id,
          image_url: image.url,
          image_name: image.name || null,
          image_label: image.label || null,
          image_order: index,
        }))

      if (imageInserts.length > 0) {
        const { error: imagesError } = await client
          .from('question_images')
          .insert(imageInserts)

        if (imagesError) {
          throw new Error(`Failed to create images: ${imagesError.message}`)
        }
      }
    }

    // Return the complete question with relations
    return this.getQuestionById(question.id)
  }

  // Get a question by ID with all relations
  static async getQuestionById(id: string): Promise<QuestionWithRelations> {
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select(`
        *,
        answers:question_answers(*),
        images:question_images(*)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (questionError) {
      throw new Error(`Failed to fetch question: ${questionError.message}`)
    }

    return question as QuestionWithRelations
  }

  // Get all questions with pagination
  static async getQuestions(
    page: number = 1,
    limit: number = 10,
    filters?: {
      category?: string
      type?: string
      level?: string
    }
  ) {
    let base = supabase
      .from('questions')
      .select(
        `
        *,
        answers:question_answers(*),
        images:question_images(*)
      `,
        { count: 'exact' }
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.category) {
      base = base.eq('category', filters.category)
    }
    if (filters?.type) {
      base = base.eq('type', filters.type)
    }
    if (filters?.level) {
      base = base.eq('level', filters.level)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await base.range(from, to)

    if (error) {
      throw new Error(`Failed to fetch questions: ${error.message}`)
    }

    const itemCount = count ?? 0
    const pageCount = Math.max(1, Math.ceil(itemCount / limit))

    return {
      items: (data || []) as QuestionWithRelations[],
      itemCount,
      page,
      take: limit,
      pageCount,
      hasPreviousPage: page > 1,
      hasNextPage: page < pageCount,
    }
  }

  // Update a question
  static async updateQuestion(id: string, data: Partial<CreateQuestionData>): Promise<QuestionWithRelations> {
    const { answers, images, ...questionData } = data

    // Update the main question
    const { error: questionError } = await supabase
      .from('questions')
      .update({
        type: questionData.type,
        category: questionData.category,
        question: questionData.question,
        level: questionData.level,
        solution_guide: questionData.solutionGuide,
        short_answer: questionData.shortAnswer,
        correct_index: questionData.correctIndex,
        correct_indices: questionData.correctIndices,
      })
      .eq('id', id)

    if (questionError) {
      throw new Error(`Failed to update question: ${questionError.message}`)
    }

    // Update answers if provided
    if (answers) {
      // Delete existing answers
      await supabase
        .from('question_answers')
        .delete()
        .eq('question_id', id)

      // Insert new answers
      if (answers.length > 0) {
        const answerInserts: QuestionAnswerInsert[] = answers.map((answer, index) => ({
          question_id: id,
          answer_text: answer,
          answer_order: index,
        }))

        const { error: answersError } = await supabase
          .from('question_answers')
          .insert(answerInserts)

        if (answersError) {
          throw new Error(`Failed to update answers: ${answersError.message}`)
        }
      }
    }

    // Update images if provided
    if (images) {
      // Delete existing images
      await supabase
        .from('question_images')
        .delete()
        .eq('question_id', id)

      // Insert new images
      const imageInserts: QuestionImageInsert[] = images
        .filter(img => img.url)
        .map((image, index) => ({
          question_id: id,
          image_url: image.url,
          image_name: image.name || null,
          image_label: image.label || null,
          image_order: index,
        }))

      if (imageInserts.length > 0) {
        const { error: imagesError } = await supabase
          .from('question_images')
          .insert(imageInserts)

        if (imagesError) {
          throw new Error(`Failed to update images: ${imagesError.message}`)
        }
      }
    }

    return this.getQuestionById(id)
  }

  // Soft delete a question
  static async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete question: ${error.message}`)
    }
  }
}
