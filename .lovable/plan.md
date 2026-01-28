

# Plano: Reestruturar Formulário com 22 Perguntas

## Resumo da Mudança

O formulário atual tem 12 perguntas com mapeamento duplo (DISC + Arquétipo). A nova estrutura separa completamente:

| Parte | Perguntas | Opções | Objetivo |
|-------|-----------|--------|----------|
| Parte 1: Arquétipos | 10 perguntas (Q1-Q10) | 6 opções cada | Determinar 2 arquétipos principais |
| Parte 2: DISC | 10 perguntas (D1-D10) | 4 opções cada | Perfil comportamental D/I/S/C |
| Parte 3: Abertas | 2 perguntas (A1-A2) | Texto livre | Contexto para closer |

**Total**: 22 perguntas

## Nova Estrutura de Blocos

```text
FLUXO ATUALIZADO:

[Boas-vindas]
    |
[Bloco 1: Q1-Q3 Arquétipos]     ← 3 perguntas × 6 opções
    |
[Bloco 2: Q4-Q6 Arquétipos]     ← 3 perguntas × 6 opções
    |
[Bloco 3: Q7-Q10 Arquétipos]    ← 4 perguntas × 6 opções
    |
[Bloco 4: D1-D3 DISC]           ← 3 perguntas × 4 opções
    |
[Bloco 5: D4-D6 DISC]           ← 3 perguntas × 4 opções
    |
[Bloco 6: D7-D10 DISC]          ← 4 perguntas × 4 opções
    |
[Perguntas Abertas]             ← 2 campos texto
    |
[Animação de Análise]
    |
[Resultado: Arquétipos]
```

## Implementação Técnica

### 1. Edge Function - Novas Perguntas de Arquétipo

```typescript
const ARCHETYPE_QUESTIONS = [
  {
    id: 1,
    text: "O que mais te motiva na vida?",
    options: [
      { text: "Acreditar que o mundo pode ser melhor", archetype: "Inocente" },
      { text: "Superar desafios e provar meu valor", archetype: "Herói" },
      { text: "Descobrir verdades e entender as coisas", archetype: "Sábio" },
      { text: "Viver experiências novas e únicas", archetype: "Explorador" },
      { text: "Transformar sonhos em realidade", archetype: "Mago" },
      { text: "Cuidar e proteger quem amo", archetype: "Cuidador" }
    ]
  },
  {
    id: 2,
    text: "Em um grupo, você naturalmente:",
    options: [
      { text: "Lidera e organiza", archetype: "Governante" },
      { text: "Conecta as pessoas e cria harmonia", archetype: "Amante" },
      { text: "Questiona regras e propõe mudanças", archetype: "Rebelde" },
      { text: "Traz humor e leveza", archetype: "Bobo da Corte" },
      { text: "Se adapta e busca pertencer", archetype: "Cara Comum" },
      { text: "Cria soluções originais", archetype: "Criador" }
    ]
  },
  // ... Q3-Q10 conforme especificado
];
```

### 2. Edge Function - Novas Perguntas DISC

```typescript
const DISC_QUESTIONS = [
  {
    id: 11, // Continua numeração após arquétipos
    text: "No trabalho, você prefere:",
    options: [
      { text: "Tomar decisões rápidas e ver resultados", disc: "D" },
      { text: "Trabalhar em equipe e manter harmonia", disc: "S" },
      { text: "Analisar dados antes de agir", disc: "C" },
      { text: "Motivar pessoas e gerar entusiasmo", disc: "I" }
    ]
  },
  {
    id: 12,
    text: "Quando alguém discorda de você:",
    options: [
      { text: "Defendo meu ponto com firmeza", disc: "D" },
      { text: "Busco entender o lado da pessoa", disc: "S" },
      { text: "Peço que me mostre os fatos", disc: "C" },
      { text: "Tento convencer com entusiasmo", disc: "I" }
    ]
  },
  // ... D3-D10 conforme especificado
];
```

### 3. Cálculo Separado

```typescript
function calculateProfiles(responses: Record<string, number>) {
  // Separar respostas por tipo
  const archetypeResponses = Object.entries(responses)
    .filter(([id]) => parseInt(id) <= 10);
  
  const discResponses = Object.entries(responses)
    .filter(([id]) => parseInt(id) > 10);

  // Calcular arquétipos (das 10 primeiras perguntas)
  const archetypeScores: Record<string, number> = {};
  for (const [qId, optionIndex] of archetypeResponses) {
    const question = ARCHETYPE_QUESTIONS.find(q => q.id === parseInt(qId));
    const option = question?.options[optionIndex];
    if (option?.archetype) {
      archetypeScores[option.archetype] = (archetypeScores[option.archetype] || 0) + 1;
    }
  }

  // Calcular DISC (das perguntas 11-20)
  const discScores = { D: 0, I: 0, S: 0, C: 0 };
  for (const [qId, optionIndex] of discResponses) {
    const question = DISC_QUESTIONS.find(q => q.id === parseInt(qId));
    const option = question?.options[optionIndex];
    if (option?.disc) {
      discScores[option.disc as keyof typeof discScores]++;
    }
  }

  // Determinar top 2 arquétipos
  const sortedArchetypes = Object.entries(archetypeScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  // Determinar perfil DISC dominante
  const maxDisc = Math.max(...Object.values(discScores));
  const dominantDisc = Object.entries(discScores)
    .filter(([_, score]) => score >= maxDisc - 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([profile]) => profile)
    .join("/");

  return { 
    primaryArchetype: sortedArchetypes[0]?.[0] || "Herói",
    secondaryArchetype: sortedArchetypes[1]?.[0] || "Sábio",
    discProfile: dominantDisc,
    discScores,
    archetypeScores
  };
}
```

### 4. Frontend - Ajustar Blocos

```typescript
// src/pages/DiscForm.tsx

const QUESTIONS_PER_BLOCK = 3;  // Para blocos 1-2 e 4-5
const LAST_BLOCK_QUESTIONS = 4; // Para blocos 3 e 6
const TOTAL_BLOCKS = 6;         // Agora são 6 blocos de perguntas

// Lógica para determinar quantas perguntas por bloco
const getQuestionsPerBlock = (block: number) => {
  return (block === 3 || block === 6) ? 4 : 3;
};

// Calcular índices de início e fim
const getCurrentBlockQuestions = () => {
  let start = 0;
  for (let i = 1; i < currentBlock; i++) {
    start += getQuestionsPerBlock(i);
  }
  const count = getQuestionsPerBlock(currentBlock);
  return questions.slice(start, start + count);
};
```

### 5. Perguntas Abertas (mantidas)

```typescript
const OPEN_QUESTIONS = [
  "Qual o maior desafio que você enfrenta hoje no seu negócio/vida?",
  "Se pudesse mudar uma coisa na sua situação atual, o que seria?"
];
```

## Matriz de Cobertura dos Arquétipos

| Arquétipo | Aparições | Perguntas |
|-----------|-----------|-----------|
| Inocente | 5 | Q1, Q4, Q5, Q8, Q10 |
| Cara Comum | 5 | Q2, Q4, Q8, Q9 |
| Herói | 5 | Q1, Q3, Q5, Q7, Q10 |
| Cuidador | 5 | Q1, Q3, Q4, Q8, Q10 |
| Explorador | 5 | Q1, Q4, Q6, Q8, Q9 |
| Rebelde | 5 | Q2, Q4, Q6, Q8, Q9 |
| Amante | 5 | Q2, Q6, Q8, Q9 |
| Criador | 5 | Q2, Q3, Q5, Q7, Q10 |
| Bobo da Corte | 5 | Q2, Q5, Q7, Q9 |
| Sábio | 5 | Q1, Q3, Q5, Q7, Q10 |
| Mago | 5 | Q1, Q3, Q6, Q7, Q9 |
| Governante | 5 | Q2, Q3, Q5, Q7, Q10 |

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/disc-form/index.ts` | Novas perguntas separadas (Arquétipos + DISC), novo cálculo |
| `src/pages/DiscForm.tsx` | Ajustar lógica de blocos para 6 blocos, progresso atualizado |
| `src/components/disc-form/QuestionBlock.tsx` | Suportar 4-6 opções por pergunta |

## Resultado Final

- **Participante responde**: 20 perguntas objetivas + 2 abertas
- **Sistema calcula separadamente**: Arquétipos (Q1-Q10) e DISC (D1-D10)
- **Participante vê**: Apenas seus 2 arquétipos com descrições positivas
- **Closer vê**: Perfil DISC + insights de vendas + arquétipos

