
# Plano: URLs Amigáveis para o Formulário de Autoconhecimento

## Problema Atual

A URL atual usa um token hexadecimal de 64 caracteres:
```
https://bethel-sales.lovable.app/disc/4d4117fc2908ecb8ede251390e82b3a9ccc59a6d72d721e8e5171709d257c802
```

Isso é:
- Difícil de ler
- Impossível de digitar
- Assustador para quem recebe
- Ruim para compartilhar

## Solução Proposta

Nova URL curta e amigável:
```
https://bethel-sales.lovable.app/teste/ABC123
```

Ou ainda mais curta:
```
https://bethel-sales.lovable.app/t/ABC123
```

## Características do Novo Token

| Aspecto | Atual | Novo |
|---------|-------|------|
| Tamanho | 64 caracteres | 6-8 caracteres |
| Formato | Hexadecimal (0-9, a-f) | Alfanumérico (A-Z, 0-9) |
| Exemplo | 4d4117fc2908ecb8... | XK7P2M |
| Legibilidade | Baixa | Alta |

O novo token será:
- **6 caracteres** alfanuméricos (maiúsculas + números)
- **Sem caracteres ambíguos** (remove O, 0, I, 1, L para evitar confusão)
- **Fácil de ditar** pelo telefone se necessário
- **36^6 = 2 bilhões de combinações** (mais que suficiente)

## Implementação Técnica

### 1. Migração do Banco de Dados

Adicionar coluna `short_code` como alternativa ao `form_token`:

```sql
-- Adicionar coluna para código curto
ALTER TABLE disc_forms 
ADD COLUMN IF NOT EXISTS short_code TEXT UNIQUE;

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_disc_forms_short_code 
ON disc_forms(short_code);

-- Criar função para gerar código curto
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

-- Trigger para gerar código automaticamente
CREATE OR REPLACE FUNCTION set_short_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := generate_short_code();
    SELECT EXISTS(SELECT 1 FROM disc_forms WHERE short_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  NEW.short_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER disc_forms_short_code_trigger
BEFORE INSERT ON disc_forms
FOR EACH ROW
WHEN (NEW.short_code IS NULL)
EXECUTE FUNCTION set_short_code();

-- Atualizar registros existentes
UPDATE disc_forms SET short_code = generate_short_code() 
WHERE short_code IS NULL;
```

### 2. Atualizar Rota do Frontend

Mudar a rota de `/disc/:token` para `/teste/:code`:

```typescript
// src/App.tsx
<Route path="/teste/:code" element={<DiscForm />} />
// Manter rota antiga para compatibilidade
<Route path="/disc/:token" element={<DiscForm />} />
```

### 3. Atualizar Edge Function

Aceitar busca por `short_code` além de `form_token`:

```typescript
// GET - buscar por short_code ou form_token
const code = url.searchParams.get("code") || url.searchParams.get("token");

// Buscar primeiro por short_code, depois por form_token
let form = await supabase
  .from("disc_forms")
  .select("*, participants(full_name, photo_url)")
  .eq("short_code", code)
  .single();

if (!form.data) {
  // Fallback para token antigo
  form = await supabase
    .from("disc_forms")
    .select("*, participants(full_name, photo_url)")
    .eq("form_token", code)
    .single();
}
```

### 4. Atualizar Geração de URL

Nos componentes que geram o link:

```typescript
// Antes
const url = `${window.location.origin}/disc/${data.form_token}`;

// Depois
const url = `${window.location.origin}/teste/${data.short_code}`;
```

### 5. Atualizar DiscForm.tsx

Adaptar para usar o novo parâmetro:

```typescript
// Antes
const { token } = useParams<{ token: string }>();
const response = await fetch(`...?token=${token}`);

// Depois
const { code } = useParams<{ code: string }>();
const response = await fetch(`...?code=${code}`);
```

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| Migração SQL | Adicionar coluna `short_code`, função e trigger |
| `src/App.tsx` | Adicionar nova rota `/teste/:code` |
| `src/pages/DiscForm.tsx` | Usar novo parâmetro `code` |
| `supabase/functions/disc-form/index.ts` | Aceitar busca por `short_code` |
| `src/pages/ParticipantDetail.tsx` | Gerar URL com `short_code` |
| `src/components/participants/ParticipantPanel.tsx` | Gerar URL com `short_code` |

## Resultado Final

**Antes:**
```
https://bethel-sales.lovable.app/disc/4d4117fc2908ecb8ede251390e82b3a9ccc59a6d72d721e8e5171709d257c802
```

**Depois:**
```
https://bethel-sales.lovable.app/teste/XK7P2M
```

## Compatibilidade

- URLs antigas (`/disc/token-longo`) continuarão funcionando
- Novos formulários usarão a URL curta automaticamente
- Formulários existentes receberão um `short_code` via migração

## Benefícios

1. **Compartilhável**: Cabe em uma mensagem de WhatsApp sem quebrar
2. **Legível**: Fácil de ler e confirmar
3. **Profissional**: Parece mais confiável
4. **Ditável**: Pode ser falado por telefone se necessário
