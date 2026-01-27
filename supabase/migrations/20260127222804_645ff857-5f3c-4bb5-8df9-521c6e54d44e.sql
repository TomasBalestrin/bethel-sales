-- Adicionar novas colunas para arquétipos na tabela disc_responses
ALTER TABLE disc_responses 
ADD COLUMN IF NOT EXISTS primary_archetype text,
ADD COLUMN IF NOT EXISTS secondary_archetype text,
ADD COLUMN IF NOT EXISTS open_answers jsonb,
ADD COLUMN IF NOT EXISTS archetype_insight text;