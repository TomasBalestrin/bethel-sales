

# Plano: Reestruturar Formulario para Teste de Autoconhecimento com Arquetipos

## Resumo

Transformar o formulario DISC atual em um "Teste de Autoconhecimento" divertido e envolvente. O participante descobre seus 2 arquetipos predominantes (experiencia positiva), enquanto o sistema mapeia secretamente o perfil DISC para uso interno dos closers.

## Mudancas Principais

### 1. Nova Experiencia do Usuario

```text
FLUXO DO FORMULARIO:

[Tela 1: Boas-vindas]
    |
    v
[Tela 2: Perguntas 1-3]
    |
    v
[Tela 3: Perguntas 4-6]
    |
    v
[Tela 4: Perguntas 7-9]
    |
    v
[Tela 5: Perguntas 10-12]
    |
    v
[Tela 6: Perguntas Abertas (13-14)]
    |
    v
[Tela 7: Animacao de Analise]
    |
    v
[Tela 8: Resultado - Arquetipos]
```

### 2. Perguntas Situacionais (Tom Leve e Divertido)

Todas as 12 perguntas mapeiam simultaneamente:
- **Arquetipos** (mostrar ao participante)
- **DISC** (oculto, para closers)

| Pergunta | Opcao A | Opcao B | Opcao C | Opcao D |
|----------|---------|---------|---------|---------|
| 1: Sabado a noite | I + Cuidador | D + Explorador | S + Sabio | I + Bobo da Corte |
| 2: Ganhou R$50 mil | C + Governante | D + Heroi | S + Cuidador | I + Explorador |
| 3: No grupo de amigos | I + Bobo da Corte | S + Cuidador | D + Criador | C + Sabio |
| 4: O que incomoda | C + Sabio | I + Inocente | D + Heroi | S + Amante |
| 5: Personagem de filme | C + Sabio | D + Heroi | D + Criador | S + Cara Comum |
| 6: Quando quer algo | D + Heroi | C + Governante | S + Inocente | I + Amante |
| 7: O que da satisfacao | D + Criador | S + Cuidador | C + Sabio | I + Explorador |
| 8: Algo da errado | D | C | S | I |
| 9: O que admiram em voce | I + Bobo da Corte | D + Heroi | S + Cuidador | C + Sabio |
| 10: Superpoder | I + Amante | D + Heroi | S + Cuidador | C + Sabio |
| 11: Em discussao | D | S | C | I |
| 12: O que valoriza | D + Rebelde | I + Amante | S + Inocente | C + Sabio |

### 3. Os 12 Arquetipos

Cada arquetipo tem icone, nome e descricao positiva:

| Arquetipo | Emoji | Descricao |
|-----------|-------|-----------|
| Inocente | :sparkles: | Enxerga o mundo com otimismo e acredita no bem |
| Cara Comum | :handshake: | Valoriza conexoes autenticas e pertencimento |
| Heroi | :trophy: | Coragem para enfrentar desafios e determinacao |
| Cuidador | :heart: | Coracao generoso que se realiza ajudando |
| Explorador | :compass: | Busca liberdade e novas experiencias |
| Rebelde | :zap: | Questiona o status quo, nao tem medo de ser diferente |
| Amante | :fire: | Valoriza conexoes profundas e paixao |
| Criador | :art: | Visao artistica e necessidade de expressar |
| Bobo da Corte | :performing_arts: | Traz leveza e alegria por onde passa |
| Sabio | :books: | Busca entender o mundo em profundidade |
| Mago | :crystal_ball: | Acredita em transformacao e faz acontecer |
| Governante | :crown: | Presenca natural e capacidade de organizar |

## Implementacao Tecnica

### Arquivo 1: src/pages/DiscForm.tsx (Reescrever)

Nova estrutura com telas paginadas:

```typescript
// Estados principais
const [currentScreen, setCurrentScreen] = useState<'welcome' | 'questions' | 'open' | 'loading' | 'result'>('welcome');
const [currentBlock, setCurrentBlock] = useState(1); // 1-4 para blocos de perguntas
const [responses, setResponses] = useState<Record<number, string>>({});
const [openAnswers, setOpenAnswers] = useState({ biggest_challenge: '', desired_change: '' });
const [result, setResult] = useState<ArchetypeResult | null>(null);

// Transicoes suaves entre telas
// Animacao de loading estilizada
// Resultado visual com arquetipos
```

**Componentes da Nova UI:**

1. **WelcomeScreen**: Gradiente bonito, titulo "Qual e a sua Essencia?", botao animado
2. **QuestionScreen**: Mostra 3 perguntas por vez, opcoes como cards clicaveis, barra de progresso
3. **OpenQuestionsScreen**: Campos de texto para desafio e mudanca desejada
4. **LoadingScreen**: Animacao de particulas/estrelas, textos que mudam
5. **ResultScreen**: Cards visuais dos 2 arquetipos, descricoes, botao compartilhar

### Arquivo 2: supabase/functions/disc-form/index.ts (Atualizar)

Nova logica de calculo:

```typescript
// Novas perguntas situacionais
const ARCHETYPE_QUESTIONS = [
  {
    id: 1,
    text: "E sabado a noite. O que voce prefere fazer?",
    options: [
      { text: "Organizar um jantar na minha casa e receber os amigos", disc: "I", archetype: "Cuidador" },
      { text: "Ir a um lugar novo que nunca explorei", disc: "D", archetype: "Explorador" },
      { text: "Maratonar uma serie ou ler um bom livro", disc: "S", archetype: "Sabio" },
      { text: "Sair para uma festa ou evento animado", disc: "I", archetype: "Bobo da Corte" }
    ]
  },
  // ... demais 11 perguntas
];

// Calculo duplo: DISC (oculto) + Arquetipos (mostrar)
function calculateProfiles(responses) {
  const discScores = { D: 0, I: 0, S: 0, C: 0 };
  const archetypeScores = {};

  for (const [qId, optionIndex] of Object.entries(responses)) {
    const question = ARCHETYPE_QUESTIONS.find(q => q.id === parseInt(qId));
    const option = question.options[optionIndex];
    
    // Pontuar DISC
    discScores[option.disc]++;
    
    // Pontuar Arquetipo
    if (option.archetype) {
      archetypeScores[option.archetype] = (archetypeScores[option.archetype] || 0) + 1;
    }
  }

  // Determinar perfil DISC
  const discProfile = calculateDiscProfile(discScores);
  
  // Determinar 2 arquetipos principais
  const sortedArchetypes = Object.entries(archetypeScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  return { discProfile, discScores, archetypes: sortedArchetypes };
}
```

**Retorno da API:**

```json
{
  "success": true,
  "archetypes": {
    "primary": {
      "name": "Heroi",
      "emoji": ":trophy:",
      "description": "Voce tem coragem para enfrentar desafios..."
    },
    "secondary": {
      "name": "Criador",
      "emoji": ":art:",
      "description": "Voce tem visao artistica..."
    },
    "combined_insight": "Sua combinacao de Heroi e Criador significa..."
  },
  "disc_profile": "D/I",
  "disc_scores": { "D": 5, "I": 4, "S": 2, "C": 1 }
}
```

### Arquivo 3: Migracao do Banco (Adicionar colunas)

Novos campos na tabela `disc_responses`:

```sql
ALTER TABLE disc_responses 
ADD COLUMN IF NOT EXISTS primary_archetype text,
ADD COLUMN IF NOT EXISTS secondary_archetype text,
ADD COLUMN IF NOT EXISTS open_answers jsonb,
ADD COLUMN IF NOT EXISTS archetype_insight text;
```

## Design Visual

### Paleta de Cores

- Background: Gradiente suave (roxo/rosa/azul pastel)
- Cards: Branco com sombra suave
- Texto: Cinza escuro para legibilidade
- Acentos: Cores vibrantes para arquetipos

### Mobile-First

- Opcoes como cards grandes e tocaveis
- Fonte legivel (min 16px)
- Botoes com area de toque ampla
- Transicoes suaves entre telas

### Animacoes

1. **Entrada**: Fade in + slide up para cada tela
2. **Selecao**: Bounce suave ao selecionar opcao
3. **Loading**: Particulas flutuantes + textos animados
4. **Resultado**: Revelacao gradual dos arquetipos

## Arquivos a Modificar/Criar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/pages/DiscForm.tsx` | Reescrever | Nova UI com telas, animacoes, arquetipos |
| `supabase/functions/disc-form/index.ts` | Atualizar | Novas perguntas, calculo duplo, retorno arquetipos |
| Migracao SQL | Criar | Adicionar colunas para arquetipos |

## Fluxo de Dados

```text
[Participante responde]
        |
        v
[Frontend envia: { token, responses, open_answers }]
        |
        v
[API calcula DISC + Arquetipos]
        |
        v
[Salva no banco: DISC oculto + Arquetipos]
        |
        v
[Retorna para participante: APENAS arquetipos]
        |
        v
[Closer ve no sistema: DISC + Insights de vendas]
```

## Exemplo de Tela de Resultado

```text
+------------------------------------------+
|                                          |
|     :sparkles: Descobrimos sua essencia!        |
|                                          |
|  +------------------------------------+  |
|  |        :trophy: HEROI                 |  |
|  |     Seu Arquetipo Principal        |  |
|  |                                    |  |
|  |  Voce tem coragem para enfrentar   |  |
|  |  desafios e determinacao para      |  |
|  |  vencer. Nao desiste facil.        |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |        :art: CRIADOR                  |  |
|  |      Sua Segunda Essencia          |  |
|  |                                    |  |
|  |  Voce tem visao artistica e        |  |
|  |  necessidade de expressar sua      |  |
|  |  originalidade.                    |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |  :sparkles: O que isso significa?        |  |
|  |                                    |  |
|  |  Sua combinacao unica de Heroi     |  |
|  |  e Criador faz de voce alguem      |  |
|  |  que transforma visao em acao...   |  |
|  +------------------------------------+  |
|                                          |
|  [   Compartilhar meu resultado   ]     |
|  [      Voltar ao evento          ]     |
|                                          |
+------------------------------------------+
```

## Privacidade dos Dados

- **Participante ve**: Arquetipos + descricoes positivas
- **Sistema salva**: Arquetipos + DISC + pontuacoes + respostas abertas
- **Closer ve**: DISC + insights de vendas + objecoes + arquetipos
- **DISC nunca aparece** para o participante

## Proximos Passos Apos Aprovacao

1. Executar migracao SQL para novas colunas
2. Atualizar edge function com novas perguntas e calculo
3. Reescrever frontend com nova UI e animacoes
4. Testar fluxo completo
5. Ajustar visualizacao dos closers para mostrar arquetipos junto com DISC

