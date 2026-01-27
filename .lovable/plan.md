

# Plano: Atribuir Cores Automaticamente por Faturamento

## Resumo

Quando um participante for importado via webhook, sua cor sera automaticamente definida com base na faixa de faturamento informada.

## Mapeamento Cor x Faturamento

| Faturamento | Cor |
|-------------|-----|
| Ate R$ 5.000,00 | Rosa |
| R$ 5.000,00 ate 10.000,00 | Preto |
| R$ 10.000,00 ate 20.000,00 | Azul Claro |
| R$ 20.000,00 ate 50.000,00 | Verde (novo) |
| R$ 50.000,00 ate 100.000,00 | Dourado |
| R$ 100.000,00 ate 250.000,00 | Laranja |
| R$ 250.000,00 ate 500.000,00 | Laranja |
| Acima de R$ 500.000,00 | Laranja |

## Alteracoes Necessarias

### 1. Banco de Dados - Adicionar cor "verde"

O enum `participant_color` atual tem: `rosa`, `preto`, `azul_claro`, `dourado`, `laranja`

Precisa adicionar: `verde`

```sql
ALTER TYPE participant_color ADD VALUE 'verde';
```

### 2. Webhook - Funcao para determinar cor

Adicionar funcao no `webhook-participants/index.ts`:

```typescript
function getColorFromFaturamento(faturamento: string | null): string | null {
  if (!faturamento) return null;
  
  const lower = faturamento.toLowerCase();
  
  if (lower.includes("ate r$ 5.000") || lower.includes("até r$ 5.000")) {
    return "rosa";
  }
  if (lower.includes("5.000,00 ate 10.000") || lower.includes("5.000,00 até 10.000")) {
    return "preto";
  }
  if (lower.includes("10.000,00 ate 20.000") || lower.includes("10.000,00 até 20.000")) {
    return "azul_claro";
  }
  if (lower.includes("20.000,00 ate 50.000") || lower.includes("20.000,00 até 50.000")) {
    return "verde";
  }
  if (lower.includes("50.000,00 ate 100.000") || lower.includes("50.000,00 até 100.000")) {
    return "dourado";
  }
  if (lower.includes("100.000,00 ate") || lower.includes("100.000,00 até") ||
      lower.includes("250.000,00 ate") || lower.includes("250.000,00 até") ||
      lower.includes("acima de")) {
    return "laranja";
  }
  
  return null;
}
```

### 3. Webhook - Aplicar cor na insercao

Modificar a logica de insercao para incluir a cor:

```typescript
participantData = {
  ...extracted,
  cor: getColorFromFaturamento(extracted.faturamento),
  webhook_data: participant,
};
```

### 4. Frontend - Adicionar cor verde

Atualizar os arquivos que definem as cores:

**tailwind.config.ts** - Adicionar cor verde:
```typescript
participant: {
  rosa: "#FF69B4",
  preto: "#1a1a1a", 
  "azul-claro": "#87CEEB",
  dourado: "#FFD700",
  laranja: "#FF8C00",
  verde: "#22C55E", // nova cor
}
```

**src/pages/Participants.tsx** - Adicionar no colorMap:
```typescript
const colorMap: Record<string, string> = {
  rosa: "bg-participant-rosa",
  preto: "bg-participant-preto",
  azul_claro: "bg-participant-azul-claro",
  dourado: "bg-participant-dourado",
  laranja: "bg-participant-laranja",
  verde: "bg-participant-verde", // nova cor
};
```

**src/pages/ParticipantDetail.tsx** - Adicionar na lista de cores:
```typescript
const colors = [
  { value: "rosa", label: "Rosa", class: "bg-participant-rosa" },
  { value: "preto", label: "Preto", class: "bg-participant-preto" },
  { value: "azul_claro", label: "Azul Claro", class: "bg-participant-azul-claro" },
  { value: "verde", label: "Verde", class: "bg-participant-verde" }, // nova cor
  { value: "dourado", label: "Dourado", class: "bg-participant-dourado" },
  { value: "laranja", label: "Laranja", class: "bg-participant-laranja" },
];
```

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| Banco de dados | Adicionar valor `verde` ao enum `participant_color` |
| `supabase/functions/webhook-participants/index.ts` | Adicionar funcao `getColorFromFaturamento` e aplicar na importacao |
| `tailwind.config.ts` | Adicionar cor `participant-verde` |
| `src/pages/Participants.tsx` | Adicionar `verde` no `colorMap` |
| `src/pages/ParticipantDetail.tsx` | Adicionar `verde` na lista de cores |

## Comportamento

1. **Novos participantes**: Cor atribuida automaticamente na importacao
2. **Participantes existentes**: Cor permanece como esta (pode ser alterada manualmente ou via script de atualizacao)
3. **Edicao manual**: O usuario ainda pode alterar a cor manualmente na tela de detalhes

## Opcional - Atualizar Participantes Existentes

Apos a implementacao, executar SQL para atualizar os participantes que ja foram importados:

```sql
UPDATE participants 
SET cor = 'rosa' 
WHERE faturamento ILIKE '%Até R$ 5.000%' AND cor IS NULL;

UPDATE participants 
SET cor = 'preto' 
WHERE faturamento ILIKE '%5.000,00 até 10.000%' AND cor IS NULL;

-- ... continuar para outras faixas
```

