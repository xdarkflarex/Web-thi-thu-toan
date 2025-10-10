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
