
# Plano: Redesenhar UX da Aba DISC com Visual Aprimorado

## Objetivo

Transformar a exibicao atual (cards simples com texto) em um layout visual moderno e intuitivo, similar as imagens de referencia fornecidas:

1. **Perfil de Arquetipo** com ranking visual e pontuacoes
2. **Perfil DISC** com barras de progresso coloridas
3. **Dicas de Abordagem e Alertas** destacados

## Novo Layout Proposto

```text
+----------------------------------------------------------+
| Perfil de Arquetipo                                       |
| Avaliacao em DD/MM/YYYY                                   |
+----------------------------------------------------------+
| [1o] Heroi ⚔️                                        [15] |
| [2o] Governante 👑                                   [15] |
| [3o] Sabio 📚                                        [14] |
+----------------------------------------------------------+
| Todos os Arquetipos (grid 2 colunas)                     |
| Heroi          15  |  Governante      15                 |
| Sabio          14  |  Mago            14                 |
| Inocente       14  |  Explorador      12                 |
| Cuidador       11  |  Criador         11                 |
| Amante         11  |  Bobo da Corte    9                 |
| Cara Comum      9  |  Rebelde          7                 |
+----------------------------------------------------------+

+----------------------------------------------------------+
| Perfil DISC                                               |
+----------------------------------------------------------+
| [ I ]     [Badge: Influencia]                            |
| Comunicador Expressivo                                    |
+----------------------------------------------------------+
| D - Dominancia      [========----]              50%      |
| I - Influencia      [============]              75%      |
| S - Estabilidade    [==----------]              13%      |
| C - Conformidade    [==========--]              63%      |
+----------------------------------------------------------+

+----------------------------------------------------------+
| 💡 Dica de Abordagem (fundo amarelo claro)               |
| Use entusiasmo, construa rapport, seja caloroso          |
+----------------------------------------------------------+
| ⚠️ Alertas (fundo amarelo)                               |
| Baixa paciencia: seja direto                              |
+----------------------------------------------------------+

+----------------------------------------------------------+
| Insights para Venda (expansivel)                          |
+----------------------------------------------------------+
| Possiveis Objecoes (expansivel)                           |
+----------------------------------------------------------+
| Como Contornar (expansivel)                               |
+----------------------------------------------------------+
| Exemplos de Fechamento (expansivel)                       |
+----------------------------------------------------------+
```

## Implementacao Tecnica

### 1. Calcular Pontuacoes dos Arquetipos a partir das Respostas

O campo `responses` ja contem as respostas do usuario. Precisamos calcular os scores de cada arquetipo baseado nas perguntas 1-10:

```typescript
const calculateArchetypeScores = (responses: Record<string, number>) => {
  const ARCHETYPE_MAP = {
    1: ["Inocente", "Heroi", "Sabio", "Explorador", "Mago", "Cuidador"],
    2: ["Governante", "Amante", "Rebelde", "Bobo da Corte", "Cara Comum", "Criador"],
    // ... Q3-Q10
  };
  
  const scores: Record<string, number> = {};
  // Calcular pontuacao de cada arquetipo
  return Object.entries(scores).sort((a,b) => b[1] - a[1]);
};
```

### 2. Calcular Porcentagens DISC

O perfil DISC vem das perguntas 11-20 (10 perguntas total):

```typescript
const calculateDiscPercentages = (responses: Record<string, number>) => {
  const discScores = { D: 0, I: 0, S: 0, C: 0 };
  // Contar respostas 11-20
  const total = 10; // 10 perguntas DISC
  return {
    D: (discScores.D / total) * 100,
    I: (discScores.I / total) * 100,
    S: (discScores.S / total) * 100,
    C: (discScores.C / total) * 100
  };
};
```

### 3. Criar Componente de Barra de Progresso Colorida

```typescript
const DiscBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span className="font-medium">{value}%</span>
    </div>
    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all" 
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  </div>
);
```

### 4. Cores das Barras DISC

| Perfil | Cor | Hex |
|--------|-----|-----|
| D - Dominancia | Vermelho | #EF4444 |
| I - Influencia | Amarelo | #EAB308 |
| S - Estabilidade | Verde | #22C55E |
| C - Conformidade | Azul | #3B82F6 |

### 5. Gerar Dica de Abordagem e Alertas

Baseado no perfil DISC dominante, gerar dicas especificas:

```typescript
const DISC_TIPS: Record<string, { tip: string; alerts: string[] }> = {
  D: {
    tip: "Seja direto, foque em resultados e nao enrole",
    alerts: ["Impaciente com detalhes", "Quer controle da situacao"]
  },
  I: {
    tip: "Use entusiasmo, construa rapport, seja caloroso",
    alerts: ["Baixa paciencia: seja direto", "Precisa de reconhecimento"]
  },
  S: {
    tip: "Seja paciente, construa confianca, de seguranca",
    alerts: ["Resiste a mudancas bruscas", "Precisa de tempo para decidir"]
  },
  C: {
    tip: "Apresente dados, seja preciso, responda com fatos",
    alerts: ["Analisa muito antes de decidir", "Desconfia de promessas vagas"]
  }
};
```

### 6. Estrutura do Novo Componente

Criar novo componente `DiscProfileDisplay.tsx`:

```typescript
interface DiscProfileDisplayProps {
  discResponse: {
    disc_profile: string;
    disc_description: string;
    sales_insights: string;
    objecoes: string;
    contorno_objecoes: string;
    exemplos_fechamento: string;
    responses: Record<string, number>;
    primary_archetype: string;
    secondary_archetype: string;
    archetype_insight: string;
    analyzed_at: string;
  };
}
```

### 7. Aprofundar Analise AI

Atualizar o prompt da Edge Function para incluir mais detalhes com as novas perguntas:

```typescript
const aiPrompt = `...
Adicione tambem:
6. "approach_tip": Uma dica curta de como abordar este cliente (1 frase)
7. "alerts": Lista de 2-3 alertas importantes sobre o que evitar com este cliente
8. "disc_label": Um rotulo descritivo do perfil (ex: "Comunicador Expressivo", "Lider Analitico")
...`;
```

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/participants/ParticipantPanel.tsx` | Redesenhar TabsContent "disc" com novo layout visual |
| `src/components/participants/DiscProfileDisplay.tsx` | **CRIAR** - Novo componente para exibicao visual |
| `supabase/functions/disc-form/index.ts` | Aprofundar prompt AI para incluir approach_tip, alerts, disc_label |

## Estrutura Visual Detalhada

### Card Perfil de Arquetipo

```typescript
<Card>
  <CardHeader className="pb-2">
    <div className="flex items-center gap-2">
      <Sparkles className="h-5 w-5 text-purple-500" />
      <CardTitle className="text-base">Perfil de Arquetipo</CardTitle>
    </div>
    <p className="text-xs text-muted-foreground">Avaliacao em {formatDate}</p>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Top 3 Arquetipos com badges numerados */}
    <div className="space-y-2">
      {top3.map((arch, i) => (
        <div key={arch.name} className={cn(
          "flex items-center justify-between p-3 rounded-lg",
          i === 0 && "bg-purple-100 border-l-4 border-purple-500",
          i === 1 && "bg-gray-50 border-l-4 border-gray-400",
          i === 2 && "bg-gray-50 border-l-4 border-gray-300"
        )}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">{i+1}o</span>
            <span className="font-medium">{arch.emoji} {arch.name}</span>
          </div>
          <span className="font-bold text-purple-600">{arch.score}</span>
        </div>
      ))}
    </div>
    
    {/* Grid todos arquetipos */}
    <Collapsible>
      <CollapsibleTrigger>Todos os Arquetipos</CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {allArchetypes.map(arch => (
            <div className="flex justify-between">
              <span>{arch.name}</span>
              <span>{arch.score}</span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  </CardContent>
</Card>
```

### Card Perfil DISC

```typescript
<Card>
  <CardHeader>
    <div className="flex items-center gap-2">
      <Target className="h-5 w-5" />
      <CardTitle>Perfil DISC</CardTitle>
    </div>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Letra dominante + Badge + Label */}
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
      <span className="text-4xl font-bold">{dominantLetter}</span>
      <Badge className="ml-2 bg-yellow-400 text-yellow-900">{discName}</Badge>
      <p className="text-sm text-muted-foreground mt-1">{discLabel}</p>
    </div>
    
    {/* Barras de progresso */}
    <div className="space-y-3">
      <DiscBar label="D - Dominancia" value={50} color="#EF4444" />
      <DiscBar label="I - Influencia" value={75} color="#EAB308" />
      <DiscBar label="S - Estabilidade" value={13} color="#22C55E" />
      <DiscBar label="C - Conformidade" value={63} color="#3B82F6" />
    </div>
  </CardContent>
</Card>
```

### Cards de Dica e Alerta

```typescript
{/* Dica de Abordagem */}
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
  <div className="flex items-center gap-2 mb-1">
    <Lightbulb className="h-4 w-4 text-yellow-600" />
    <span className="font-medium text-sm">Dica de Abordagem</span>
  </div>
  <p className="text-sm">{approachTip}</p>
</div>

{/* Alertas */}
<div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
  <div className="flex items-center gap-2 mb-1">
    <AlertTriangle className="h-4 w-4 text-amber-600" />
    <span className="font-medium text-sm">Alertas</span>
  </div>
  <ul className="text-sm list-disc list-inside">
    {alerts.map(alert => <li key={alert}>{alert}</li>)}
  </ul>
</div>
```

## Migracao de Dados

Precisamos adicionar campos ao banco para armazenar os novos dados da AI:

```sql
ALTER TABLE disc_responses 
ADD COLUMN IF NOT EXISTS approach_tip text,
ADD COLUMN IF NOT EXISTS alerts text[],
ADD COLUMN IF NOT EXISTS disc_label text,
ADD COLUMN IF NOT EXISTS disc_scores jsonb;
```

## Beneficios

1. **Visual mais intuitivo**: Barras de progresso e rankings visuais
2. **Informacao rapida**: Dica de abordagem em destaque
3. **Alertas visiveis**: Closer sabe o que evitar
4. **Dados completos**: Todos os arquetipos visiveis em grid expansivel
5. **UX moderna**: Layout similar a apps de personalidade populares
