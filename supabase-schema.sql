-- Create the questions table
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('multiple-choice', 'multiple-select', 'short-answer')),
  category VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  solution_guide TEXT,
  level VARCHAR(20) NOT NULL CHECK (level IN ('recognize', 'understand', 'apply')),
  short_answer TEXT, -- Only used for short-answer type
  correct_index INTEGER, -- Only used for multiple-choice type
  correct_indices INTEGER[], -- Only used for multiple-select type
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true
);

-- Create the question_answers table
CREATE TABLE question_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  answer_order INTEGER NOT NULL, -- To maintain order (A, B, C, D...)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the question_images table
CREATE TABLE question_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL, -- Supabase Storage URL
  image_name VARCHAR(255),
  image_label VARCHAR(255),
  image_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_questions_level ON questions(level);
CREATE INDEX idx_questions_created_by ON questions(created_by);
CREATE INDEX idx_questions_is_active ON questions(is_active);
CREATE INDEX idx_question_answers_question_id ON question_answers(question_id);
CREATE INDEX idx_question_images_question_id ON question_images(question_id);

-- Enable Row Level Security
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow everyone to read active questions
CREATE POLICY "Anyone can view active questions" ON questions
  FOR SELECT USING (is_active = true);

-- Allow authenticated users to create questions
CREATE POLICY "Authenticated users can create questions" ON questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own questions
CREATE POLICY "Users can update their own questions" ON questions
  FOR UPDATE USING (auth.uid() = created_by);

-- Allow users to delete their own questions (soft delete by setting is_active = false)
CREATE POLICY "Users can delete their own questions" ON questions
  FOR UPDATE USING (auth.uid() = created_by);

-- Allow reading answers for active questions
CREATE POLICY "Anyone can view answers for active questions" ON question_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = question_answers.question_id 
      AND questions.is_active = true
    )
  );

-- Allow authenticated users to create answers
CREATE POLICY "Authenticated users can create answers" ON question_answers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update answers for their own questions
CREATE POLICY "Users can update answers for their own questions" ON question_answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = question_answers.question_id 
      AND questions.created_by = auth.uid()
    )
  );

-- Allow reading images for active questions
CREATE POLICY "Anyone can view images for active questions" ON question_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = question_images.question_id 
      AND questions.is_active = true
    )
  );

-- Allow authenticated users to create images
CREATE POLICY "Authenticated users can create images" ON question_images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update images for their own questions
CREATE POLICY "Users can update images for their own questions" ON question_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = question_images.question_id 
      AND questions.created_by = auth.uid()
    )
  );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_questions_updated_at 
    BEFORE UPDATE ON questions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Roles & Profiles (RBAC) and tightened policies
-- =============================================

-- Create enum for roles (idempotent-safe pattern)
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('admin', 'teacher', 'student');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'student',
  full_name text,
  language VARCHAR(5) DEFAULT 'vi' CHECK (language IN ('vi', 'en')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Ensure created_by defaults to the current auth user
ALTER TABLE public.questions
  ALTER COLUMN created_by SET DEFAULT auth.uid();

-- Helper function to check role from profiles
CREATE OR REPLACE FUNCTION public.has_role(check_role public.user_role)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = check_role
  );
$$;

-- RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: read own, admin read all
DO $$ BEGIN
  DROP POLICY IF EXISTS "read own profile" ON public.profiles;
  DROP POLICY IF EXISTS "admin read profiles" ON public.profiles;
  DROP POLICY IF EXISTS "self update profile" ON public.profiles;
  DROP POLICY IF EXISTS "admin update profiles" ON public.profiles;
  DROP POLICY IF EXISTS "admin insert profiles" ON public.profiles;
EXCEPTION WHEN undefined_table THEN NULL; END $$;

CREATE POLICY "read own profile" ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "admin read profiles" ON public.profiles
  FOR SELECT
  USING (public.has_role('admin'));

CREATE POLICY "admin insert profiles" ON public.profiles
  FOR INSERT
  WITH CHECK (public.has_role('admin'));

CREATE POLICY "admin update profiles" ON public.profiles
  FOR UPDATE
  USING (public.has_role('admin'))
  WITH CHECK (public.has_role('admin'));

-- Allow users to update their own non-privileged fields; role changes enforced via trigger
CREATE POLICY "self update profile" ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Prevent non-admins from changing role via a trigger
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.has_role('admin') THEN
      RAISE EXCEPTION 'Only admin can change roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, language)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NULL), 'vi')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tighten policies: restrict writes to teacher/admin, keep public reads to active

-- Questions
DROP POLICY IF EXISTS "Authenticated users can create questions" ON public.questions;
CREATE POLICY "Teachers/Admins can create questions" ON public.questions
  FOR INSERT
  WITH CHECK (public.has_role('teacher') OR public.has_role('admin'));

DROP POLICY IF EXISTS "Users can update their own questions" ON public.questions;
CREATE POLICY "Owner teacher or admin can update questions" ON public.questions
  FOR UPDATE
  USING ((created_by = auth.uid() AND public.has_role('teacher')) OR public.has_role('admin'))
  WITH CHECK ((created_by = auth.uid() AND public.has_role('teacher')) OR public.has_role('admin'));

DROP POLICY IF EXISTS "Users can delete their own questions" ON public.questions;
CREATE POLICY "Owner teacher or admin can soft delete" ON public.questions
  FOR UPDATE
  USING ((created_by = auth.uid() AND public.has_role('teacher')) OR public.has_role('admin'))
  WITH CHECK ((created_by = auth.uid() AND public.has_role('teacher')) OR public.has_role('admin'));

-- Answers mirror parent ownership visibility
DROP POLICY IF EXISTS "Authenticated users can create answers" ON public.question_answers;
CREATE POLICY "Teachers/Admins can create answers" ON public.question_answers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.questions q
      WHERE q.id = question_id
        AND ((q.created_by = auth.uid() AND public.has_role('teacher')) OR public.has_role('admin'))
    )
  );

DROP POLICY IF EXISTS "Users can update answers for their own questions" ON public.question_answers;
CREATE POLICY "Owner teacher or admin can update answers" ON public.question_answers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.questions q
      WHERE q.id = question_id
        AND ((q.created_by = auth.uid() AND public.has_role('teacher')) OR public.has_role('admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.questions q
      WHERE q.id = question_id
        AND ((q.created_by = auth.uid() AND public.has_role('teacher')) OR public.has_role('admin'))
    )
  );

-- Images mirror parent ownership visibility
DROP POLICY IF EXISTS "Authenticated users can create images" ON public.question_images;
CREATE POLICY "Teachers/Admins can create images" ON public.question_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.questions q
      WHERE q.id = question_id
        AND ((q.created_by = auth.uid() AND public.has_role('teacher')) OR public.has_role('admin'))
    )
  );

DROP POLICY IF EXISTS "Users can update images for their own questions" ON public.question_images;
CREATE POLICY "Owner teacher or admin can update images" ON public.question_images
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.questions q
      WHERE q.id = question_id
        AND ((q.created_by = auth.uid() AND public.has_role('teacher')) OR public.has_role('admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.questions q
      WHERE q.id = question_id
        AND ((q.created_by = auth.uid() AND public.has_role('teacher')) OR public.has_role('admin'))
    )
  );