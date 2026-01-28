-- Add new columns for enhanced DISC analysis
ALTER TABLE disc_responses 
ADD COLUMN IF NOT EXISTS approach_tip text,
ADD COLUMN IF NOT EXISTS alerts text[],
ADD COLUMN IF NOT EXISTS disc_label text,
ADD COLUMN IF NOT EXISTS disc_scores jsonb;