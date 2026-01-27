-- Adicionar coluna para código curto
ALTER TABLE disc_forms 
ADD COLUMN IF NOT EXISTS short_code TEXT UNIQUE;

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_disc_forms_short_code 
ON disc_forms(short_code);

-- Criar função para gerar código curto (sem caracteres ambíguos)
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar código automaticamente em novos registros
CREATE OR REPLACE FUNCTION set_short_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  IF NEW.short_code IS NULL THEN
    LOOP
      new_code := generate_short_code();
      SELECT EXISTS(SELECT 1 FROM disc_forms WHERE short_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    NEW.short_code := new_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS disc_forms_short_code_trigger ON disc_forms;
CREATE TRIGGER disc_forms_short_code_trigger
BEFORE INSERT ON disc_forms
FOR EACH ROW
EXECUTE FUNCTION set_short_code();

-- Atualizar registros existentes que não têm short_code
DO $$
DECLARE
  rec RECORD;
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  FOR rec IN SELECT id FROM disc_forms WHERE short_code IS NULL LOOP
    LOOP
      new_code := generate_short_code();
      SELECT EXISTS(SELECT 1 FROM disc_forms WHERE short_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    UPDATE disc_forms SET short_code = new_code WHERE id = rec.id;
  END LOOP;
END $$;