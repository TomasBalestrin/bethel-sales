
# Plano: Corrigir Visualização DISC e Reprocessar Análises

## Problema 1: Percentuais DISC Incorretos

### Causa Raiz
O campo `disc_scores` no banco armazena **contagens absolutas** (ex: `{D:6, I:0, S:3, C:1}`), mas o componente `DiscProfileDisplay` está exibindo esses valores diretamente como percentuais.

### Dados Reais do Participante
| Letra | Contagem | Percentual Correto |
|-------|----------|-------------------|
| D     | 6        | 60%               |
| I     | 0        | 0%                |
| S     | 3        | 30%               |
| C     | 1        | 10%               |

### Solução
Modificar o `DiscProfileDisplay.tsx` para converter corretamente:

```typescript
// Atual (errado):
const discPercentages = discResponse.disc_scores || calculateDiscPercentages(responses);

// Corrigido:
const rawScores = discResponse.disc_scores || calculateDiscScoresFromResponses(responses);
const total = rawScores.D + rawScores.I + rawScores.S + rawScores.C;
const discPercentages = {
  D: Math.round((rawScores.D / Math.max(total, 1)) * 100),
  I: Math.round((rawScores.I / Math.max(total, 1)) * 100),
  S: Math.round((rawScores.S / Math.max(total, 1)) * 100),
  C: Math.round((rawScores.C / Math.max(total, 1)) * 100),
};
```

## Problema 2: Análises de IA Vazias

### Causa Raiz
Os campos no banco de dados estão vazios:
- `sales_insights`: vazio
- `objecoes`: vazio  
- `contorno_objecoes`: vazio
- `exemplos_fechamento`: vazio
- `approach_tip`: vazio
- `alerts`: array vazio `[]`

A análise da IA não foi salva corretamente quando o formulário foi respondido.

### Solução
Adicionar um botão "Reprocessar Análise" na aba DISC que:
1. Chama a Edge Function com os dados do participante
2. Regenera a análise da IA
3. Atualiza o registro no banco

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/participants/DiscProfileDisplay.tsx` | Corrigir cálculo de percentuais |
| `src/pages/ParticipantDetail.tsx` | Adicionar botão "Reprocessar Análise" |
| `supabase/functions/disc-form/index.ts` | Adicionar endpoint para reprocessar análise |

## Implementação Detalhada

### 1. Corrigir DiscProfileDisplay.tsx

```typescript
// Função para converter scores absolutos em percentuais
function scoresToPercentages(scores: { D: number; I: number; S: number; C: number }) {
  const total = scores.D + scores.I + scores.S + scores.C;
  if (total === 0) return { D: 0, I: 0, S: 0, C: 0 };
  return {
    D: Math.round((scores.D / total) * 100),
    I: Math.round((scores.I / total) * 100),
    S: Math.round((scores.S / total) * 100),
    C: Math.round((scores.C / total) * 100),
  };
}

// No componente:
const rawScores = discResponse.disc_scores || calculateRawScores(responses);
const discPercentages = scoresToPercentages(rawScores);
```

### 2. Botão Reprocessar no ParticipantDetail.tsx

```typescript
// Novo estado
const [isReprocessing, setIsReprocessing] = useState(false);

// Função
const handleReprocessAnalysis = async () => {
  setIsReprocessing(true);
  
  const { error } = await supabase.functions.invoke("disc-form", {
    body: { 
      action: "reprocess",
      participant_id: participant.id
    }
  });
  
  if (!error) {
    toast({ title: "Análise reprocessada!" });
    // Refetch data
  }
  setIsReprocessing(false);
};

// Na UI, junto ao card DISC:
{!discResponse?.sales_insights && (
  <Button onClick={handleReprocessAnalysis} disabled={isReprocessing}>
    <RefreshCcw className="h-4 w-4 mr-2" />
    Reprocessar Análise IA
  </Button>
)}
```

### 3. Edge Function - Endpoint de Reprocessamento

Adicionar handler para reprocessar análise de um participante específico:

```typescript
// POST com action: "reprocess"
if (action === "reprocess") {
  const { participant_id } = body;
  
  // Buscar participante e disc_response existente
  const { data: participant } = await supabase
    .from("participants")
    .select("*, disc_forms(disc_responses(*))")
    .eq("id", participant_id)
    .single();
  
  // Chamar IA novamente
  // Atualizar disc_responses
}
```

## Resultado Esperado

### Antes (Atual)
```text
Dominância:    6%   ████░░░░░░░░░░░░░░░░
Influência:    0%   ░░░░░░░░░░░░░░░░░░░░
Estabilidade:  3%   ███░░░░░░░░░░░░░░░░░
Conformidade:  1%   █░░░░░░░░░░░░░░░░░░░
```

### Depois (Correto)
```text
Dominância:   60%   ████████████░░░░░░░░
Influência:    0%   ░░░░░░░░░░░░░░░░░░░░
Estabilidade: 30%   ██████░░░░░░░░░░░░░░
Conformidade: 10%   ██░░░░░░░░░░░░░░░░░░
```

E com análises da IA visíveis nas seções colapsáveis.
