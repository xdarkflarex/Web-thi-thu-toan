-- Migration: Change categories from name_en/name_vi to single name field
-- First, we'll keep existing data by preserving name_vi as the default name

-- Add new name column
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Migrate existing data: use name_vi as the default name (you may want to review this)
UPDATE public.categories 
SET name = COALESCE(name_vi, name_en, '') 
WHERE name IS NULL;

-- Make name NOT NULL after migration
ALTER TABLE public.categories 
ALTER COLUMN name SET NOT NULL;

-- Drop old columns
ALTER TABLE public.categories 
DROP COLUMN IF EXISTS name_en,
DROP COLUMN IF EXISTS name_vi;

