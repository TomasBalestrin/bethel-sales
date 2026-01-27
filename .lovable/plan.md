
# Plano: Converter Painéis Laterais em Paginas Completas

## Resumo

Transformar o CloserPanel e ParticipantPanel de paineis laterais (Sheet) em paginas completas dedicadas, acessadas atraves de rotas dinamicas.

## Mudanca Visual

```text
ANTES (Sheet lateral)                    DEPOIS (Pagina completa)
+----------------+--------+              +---------------------------+
|   Lista de     | Sheet  |              |   Detalhes do Closer      |
|   Closers      | Panel  |      ->      |   (pagina inteira)        |
|                |        |              |                           |
+----------------+--------+              +---------------------------+
```

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/CloserDetail.tsx` | Pagina completa de detalhes do closer |
| `src/pages/ParticipantDetail.tsx` | Pagina completa de detalhes do participante |

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/App.tsx` | Adicionar rotas `/closers/:id` e `/participantes/:id` |
| `src/pages/Closers.tsx` | Navegar para rota ao clicar (remover Sheet) |
| `src/pages/Participants.tsx` | Navegar para rota ao clicar (remover Sheet) |

## Detalhes Tecnicos

### 1. Nova Rota: CloserDetail (`/closers/:id`)

```tsx
// src/pages/CloserDetail.tsx
// - Buscar closer pelo ID da URL usando useParams
// - Layout em pagina completa com botao de voltar
// - Reutilizar toda a logica existente do CloserPanel
// - Design responsivo: cards de metricas em grid
// - Lista de participantes atribuidos com scroll
```

### 2. Nova Rota: ParticipantDetail (`/participantes/:id`)

```tsx
// src/pages/ParticipantDetail.tsx
// - Buscar participante pelo ID da URL usando useParams
// - Layout em pagina completa com botao de voltar
// - Manter todas as abas (Dados, Vendas, DISC, Acoes)
// - Formulario de edicao em tela cheia
// - Dialogos de venda e atribuicao mantidos
```

### 3. Atualizacao de Rotas (`src/App.tsx`)

```tsx
// Adicionar dentro do AppLayout:
<Route path="/closers/:id" element={<CloserDetail />} />
<Route path="/participantes/:id" element={<ParticipantDetail />} />
```

### 4. Navegacao nas Listagens

```tsx
// Closers.tsx - ao clicar no card:
onClick={() => navigate(`/closers/${closer.id}`)}

// Participants.tsx - ao clicar no card:
onClick={() => navigate(`/participantes/${participant.id}`)}
```

## Layout das Novas Paginas

### CloserDetail

```text
+-------------------------------------------+
| <- Voltar    Closers / Deyvid             |
+-------------------------------------------+
| [Avatar] Deyvid                           |
|          Closer                           |
+-------------------------------------------+
| Oportunidades | Vendas | Conversao | Valor|
|      0        |   0    |   0.0%    | R$ 0 |
+-------------------------------------------+
| Valor de Entradas: R$ 0,00                |
+-------------------------------------------+
| Participantes Atribuidos     [Filtro: v]  |
| +---------------------------------------+ |
| | Nome do Participante    [D1][D2][Opp] | |
| | Nome do Participante 2  [D1]          | |
| +---------------------------------------+ |
+-------------------------------------------+
```

### ParticipantDetail

```text
+-------------------------------------------+
| <- Voltar    Participantes / Joao Silva   |
+-------------------------------------------+
| [Avatar] Joao Silva                       |
|          [Dia 1] [Dia 2]                  |
+-------------------------------------------+
| [Dados] [Vendas] [DISC] [Acoes]           |
+-------------------------------------------+
| Conteudo da aba selecionada em tela cheia |
| com mais espaco para formularios          |
| e visualizacao de dados                   |
+-------------------------------------------+
```

## Beneficios

1. Mais espaco para visualizacao de dados
2. Melhor experiencia mobile
3. URLs compartilhaveis para closers/participantes especificos
4. Navegacao mais intuitiva com botao voltar
5. Melhor organizacao visual dos formularios

## Componentes Reutilizados

- Avatar, Badge, Card, Tabs (UI components)
- SalesTab (aba de vendas do participante)
- Toda logica de fetch e update dos dados
- Dialogos de venda e atribuicao

## Ordem de Implementacao

1. Criar `CloserDetail.tsx` (converter CloserPanel para pagina)
2. Criar `ParticipantDetail.tsx` (converter ParticipantPanel para pagina)
3. Atualizar `App.tsx` com novas rotas
4. Atualizar `Closers.tsx` para navegar via useNavigate
5. Atualizar `Participants.tsx` para navegar via useNavigate
6. Remover imports dos Panels antigos (opcional - podem ser deletados)
