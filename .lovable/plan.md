
# Plano: Atualizar Webhook de Participantes

## Contexto

O sistema externo envia dados em uma estrutura diferente da esperada pelo webhook atual. Os dados chegam com campos aninhados dentro de um objeto `fields`, usando chaves descritivas em português.

### JSON Recebido do Sistema Externo
```json
{
  "participant_id": "a7a39a5f-4643-49bf-93f0-b4e69aa70684",
  "form_name": "Participante - Standard",
  "event_name": "Intensivo Da Alta Performance",
  "status": "registered",
  "created_at": "2026-01-27T15:58:20.33569+00:00",
  "fields": {
    "nome_completo": "Sabrina Alice Nogueira Brito",
    "digite_seu_melhor_email": "sabrinaalicenb@gmail.com",
    "digite_seu_whatsapp": "(11) 96742-8879",
    "qual_seu_do_instagram": "sabrinalice_",
    "digite_o_seu_cpf_ou_cnpj": "481.818.328-84",
    "nome_para_cracha": "Sabrina Nogueira",
    "voce_tem_socio": "Não",
    "qual_sua_area_de_atuacao_profissional": "Nail Designer",
    "o_que_pretende_aprender_no_intensivo...": "...",
    "qual_sua_maior_dificuldade_no_seu_negocio...": "...",
    "quanto_voce_fatura_por_mes": "Até R$ 5.000,00",
    "qual_seu_lucro_liquido_mensal": "Até R$ 5.000,00",
    "termo_de_uso_de_imagem_e_responsabilidade": "true",
    "qual_sua_melhor_foto_de_perfil...": "https://..."
  }
}
```

---

## Etapa 1: Adicionar Novas Colunas no Banco de Dados

Criar migração SQL para adicionar os campos identificados:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `cpf_cnpj` | `text` | CPF ou CNPJ do participante |
| `nome_cracha` | `text` | Nome para crachá do evento |
| `tem_socio` | `boolean` | Se possui sócio no negócio |
| `lucro_liquido` | `text` | Faixa de lucro líquido mensal |
| `objetivo_evento` | `text` | O que pretende aprender |
| `maior_dificuldade` | `text` | Maior dificuldade no negócio |
| `external_id` | `text` | ID do participante no sistema externo |
| `form_name` | `text` | Nome do formulário de origem |
| `event_name` | `text` | Nome do evento |
| `registration_status` | `text` | Status do registro |
| `aceitou_termo_imagem` | `boolean` | Aceite do termo de imagem |

---

## Etapa 2: Atualizar o Webhook

### 2.1 Detectar Estrutura do JSON
O webhook precisa identificar se os dados estão no formato antigo (campos na raiz) ou no novo formato (campos dentro de `fields`).

### 2.2 Mapeamento de Campos
Criar função de extração que mapeia os campos descritivos:

| Campo Recebido | Campo no Banco |
|----------------|----------------|
| `fields.nome_completo` | `full_name` |
| `fields.digite_seu_melhor_email` | `email` |
| `fields.digite_seu_whatsapp` | `phone` |
| `fields.qual_seu_do_instagram` | `instagram` |
| `fields.digite_o_seu_cpf_ou_cnpj` | `cpf_cnpj` |
| `fields.nome_para_cracha` | `nome_cracha` |
| `fields.voce_tem_socio` | `tem_socio` (converter para boolean) |
| `fields.qual_sua_area_de_atuacao_profissional` | `nicho` |
| `fields.quanto_voce_fatura_por_mes` | `faturamento` (manter como texto) |
| `fields.qual_seu_lucro_liquido_mensal` | `lucro_liquido` |
| `fields.o_que_pretende_aprender...` | `objetivo_evento` |
| `fields.qual_sua_maior_dificuldade...` | `maior_dificuldade` |
| `fields.qual_sua_melhor_foto_de_perfil...` | `photo_url` |
| `fields.termo_de_uso_de_imagem...` | `aceitou_termo_imagem` (converter para boolean) |
| `participant_id` (raiz) | `external_id` |
| `form_name` (raiz) | `form_name` |
| `event_name` (raiz) | `event_name` |
| `status` (raiz) | `registration_status` |

### 2.3 Lógica de Upsert Melhorada
- Verificar existência por `email` OU `external_id`
- Priorizar atualização se já existir
- Manter compatibilidade com formato antigo

---

## Etapa 3: Conversões de Dados

### Faturamento
Manter como texto para preservar as faixas originais:
- "Até R$ 5.000,00"
- "De R$ 5.000 a R$ 10.000"
- etc.

A coluna `faturamento` será alterada de `numeric` para `text`.

### Campos Boolean
Converter strings para boolean:
- `"true"`, `"Sim"`, `"sim"` → `true`
- `"false"`, `"Não"`, `"não"` → `false`

---

## Etapa 4: Atualizar Types (Automático)

Após a migração, os types do Supabase serão atualizados automaticamente para refletir as novas colunas.

---

## Resumo das Alterações

### Arquivos a Modificar
1. **Banco de Dados**: Migração SQL com 11 novas colunas + alteração do tipo de `faturamento`
2. **`supabase/functions/webhook-participants/index.ts`**: Nova lógica de parsing e mapeamento

### Compatibilidade
- Webhook continuará aceitando formato antigo (campos na raiz)
- Novo formato com `fields` será detectado automaticamente
- Dados brutos sempre salvos em `webhook_data` para referência

---

## Seção Técnica

### SQL da Migração
```sql
-- Adicionar novas colunas
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

-- Alterar tipo de faturamento para text (para suportar faixas)
ALTER TABLE participants 
  ALTER COLUMN faturamento TYPE text USING faturamento::text;

-- Criar índice para busca por external_id
CREATE INDEX IF NOT EXISTS idx_participants_external_id 
  ON participants(external_id);
```

### Estrutura do Novo Webhook
```typescript
// Função para extrair dados do novo formato
function extractFromFields(participant: any) {
  const fields = participant.fields || {};
  
  return {
    full_name: fields.nome_completo || null,
    email: fields.digite_seu_melhor_email || null,
    phone: fields.digite_seu_whatsapp || null,
    instagram: fields.qual_seu_do_instagram || null,
    cpf_cnpj: fields.digite_o_seu_cpf_ou_cnpj || null,
    nome_cracha: fields.nome_para_cracha || null,
    tem_socio: parseBoolean(fields.voce_tem_socio),
    nicho: fields.qual_sua_area_de_atuacao_profissional || null,
    faturamento: fields.quanto_voce_fatura_por_mes || null,
    lucro_liquido: fields.qual_seu_lucro_liquido_mensal || null,
    objetivo_evento: findFieldByPartialKey(fields, 'pretende_aprender'),
    maior_dificuldade: findFieldByPartialKey(fields, 'maior_dificuldade'),
    photo_url: findFieldByPartialKey(fields, 'foto_de_perfil'),
    aceitou_termo_imagem: parseBoolean(
      fields.termo_de_uso_de_imagem_e_responsabilidade
    ),
    // Metadados do registro
    external_id: participant.participant_id || null,
    form_name: participant.form_name || null,
    event_name: participant.event_name || null,
    registration_status: participant.status || null,
  };
}

// Função para buscar campos por chave parcial
function findFieldByPartialKey(fields: any, partial: string): string | null {
  const key = Object.keys(fields).find(k => 
    k.toLowerCase().includes(partial.toLowerCase())
  );
  return key ? fields[key] : null;
}

// Função para converter string em boolean
function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', 'sim', '1'].includes(value.toLowerCase());
  }
  return false;
}
```
