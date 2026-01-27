-- Adicionar novas colunas para suportar o novo formato de webhook
ALTER TABLE participants
  ADD COLUMN IF NOT EXISTS cpf_cnpj text,
  ADD COLUMN IF NOT EXISTS nome_cracha text,
  ADD COLUMN IF NOT EXISTS tem_socio boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS lucro_liquido text,
  ADD COLUMN IF NOT EXISTS objetivo_evento text,
  ADD COLUMN IF NOT EXISTS maior_dificuldade text,
  ADD COLUMN IF NOT EXISTS external_id text,
  ADD COLUMN IF NOT EXISTS form_name text,
  ADD COLUMN IF NOT EXISTS event_name text,
  ADD COLUMN IF NOT EXISTS registration_status text,
  ADD COLUMN IF NOT EXISTS aceitou_termo_imagem boolean DEFAULT false;

-- Alterar tipo de faturamento para text (para suportar faixas como "Até R$ 5.000,00")
ALTER TABLE participants 
  ALTER COLUMN faturamento TYPE text USING faturamento::text;

-- Criar índice para busca eficiente por external_id
CREATE INDEX IF NOT EXISTS idx_participants_external_id 
  ON participants(external_id);