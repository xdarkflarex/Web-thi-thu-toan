-- Migration: Add language column to profiles table
-- This allows storing user's language preference (vi or en)

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'vi' CHECK (language IN ('vi', 'en'));

-- Update existing profiles to have default language
UPDATE public.profiles 
SET language = 'vi' 
WHERE language IS NULL;

