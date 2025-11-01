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
          category_id: string | null
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
          category_id?: string | null
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
          category_id?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          parent_id: string | null
          slug: string
          name_en: string
          name_vi: string
          description: string | null
          icon: string | null
          color: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          parent_id?: string | null
          slug: string
          name_en: string
          name_vi: string
          description?: string | null
          icon?: string | null
          color?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          parent_id?: string | null
          slug?: string
          name_en?: string
          name_vi?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
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
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'teacher' | 'student'
          full_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'teacher' | 'student'
          full_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'teacher' | 'student'
          full_name?: string | null
          created_at?: string
        }
      }
    }
  }
}
