export interface Database {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string
          type: 'multiple-choice' | 'multiple-select' | 'short-answer'
          category: string
          question: string
          solution_guide: string | null
          level: 'recognize' | 'understand' | 'apply'
          short_answer: string | null
          correct_index: number | null
          correct_indices: number[] | null
          created_at: string
          updated_at: string
          created_by: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          type: 'multiple-choice' | 'multiple-select' | 'short-answer'
          category: string
          question: string
          solution_guide?: string | null
          level: 'recognize' | 'understand' | 'apply'
          short_answer?: string | null
          correct_index?: number | null
          correct_indices?: number[] | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          type?: 'multiple-choice' | 'multiple-select' | 'short-answer'
          category?: string
          question?: string
          solution_guide?: string | null
          level?: 'recognize' | 'understand' | 'apply'
          short_answer?: string | null
          correct_index?: number | null
          correct_indices?: number[] | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          is_active?: boolean
        }
      }
      question_answers: {
        Row: {
          id: string
          question_id: string
          answer_text: string
          answer_order: number
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          answer_text: string
          answer_order: number
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          answer_text?: string
          answer_order?: number
          created_at?: string
        }
      }
      question_images: {
        Row: {
          id: string
          question_id: string
          image_url: string
          image_name: string | null
          image_label: string | null
          image_order: number
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          image_url: string
          image_name?: string | null
          image_label?: string | null
          image_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          image_url?: string
          image_name?: string | null
          image_label?: string | null
          image_order?: number
          created_at?: string
        }
      }
    }
  }
}
