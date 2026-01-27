

# Plano Completo: Implementar Funcionalidades Faltantes do PRD

## Visao Geral

Este plano implementa todas as funcionalidades identificadas como faltantes ou parciais no sistema Bethel Events:
1. Historico de Vendas com visualizacao/edicao/exclusao
2. Atribuicao em massa de participantes para closers
3. Pagina de Relatorios com graficos e exportacao
4. Icones PWA para instalacao mobile

---

## Modulo 1: Historico de Vendas

### Objetivo
Criar uma aba "Vendas" no painel do participante e uma pagina dedicada para visualizar, editar e excluir vendas.

### Arquivos a modificar/criar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/components/participants/ParticipantPanel.tsx` | Modificar | Adicionar aba "Vendas" com lista e acoes |
| `src/pages/Sales.tsx` | Criar | Pagina dedicada para listar todas as vendas |
| `src/App.tsx` | Modificar | Adicionar rota `/vendas` |
| `src/components/layout/Sidebar.tsx` | Modificar | Adicionar link para Vendas no menu |

### Detalhes tecnicos

**ParticipantPanel - Nova aba Vendas:**
```text
TabsContent value="vendas"
  - Lista de vendas do participante
  - Cada venda mostra: produto, valor total, entrada, data, forma negociacao
  - Botoes de edicao e exclusao por venda
  - Total de vendas calculado no rodape
```

**Pagina Sales.tsx:**
```text
- Tabela com todas as vendas
- Filtros: periodo, closer, produto
- Colunas: participante, produto, valor, entrada, closer, data
- Acoes: editar, excluir
- Totalizadores no topo
```

---

## Modulo 2: Atribuicao em Massa

### Objetivo
Permitir que admins selecionem multiplos participantes e atribuam a um closer de uma vez.

### Arquivos a modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/pages/Participants.tsx` | Modificar | Adicionar modo de selecao multipla e botao de atribuicao em massa |

### Detalhes tecnicos

```text
Interface atualizada:
1. Checkbox em cada card de participante (visivel apenas para admin)
2. Barra de acoes flutuante quando ha selecao:
   - "X selecionados"
   - Dropdown para escolher closer
   - Botao "Atribuir"
   - Botao "Cancelar selecao"
3. Logica de atribuicao em massa:
   - Loop pelos participantes selecionados
   - Remove atribuicao anterior
   - Cria nova atribuicao
   - Atualiza lista
```

---

## Modulo 3: Pagina de Relatorios

### Objetivo
Dashboard analitico com graficos e exportacao de dados.

### Arquivos a criar/modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/pages/Reports.tsx` | Criar | Pagina com graficos e metricas |
| `src/App.tsx` | Modificar | Adicionar rota `/relatorios` |
| `src/components/layout/Sidebar.tsx` | Modificar | Adicionar link para Relatorios (admin only) |
| `src/lib/export.ts` | Criar | Funcoes utilitarias para exportar CSV |

### Graficos planejados (usando recharts ja instalado)

```text
1. Vendas por Periodo (BarChart)
   - Eixo X: dias/semanas
   - Eixo Y: valor vendas + quantidade
   
2. Performance de Closers (BarChart horizontal)
   - Closers ordenados por valor de vendas
   - Mostra vendas e taxa de conversao
   
3. Distribuicao por Qualificacao (PieChart)
   - Super, Medio, Baixo qualificados
   - Com percentual de conversao cada
   
4. Credenciamento por Dia (LineChart)
   - Dia 1, 2, 3
   - Participantes vs Oportunidades
```

### Exportacao CSV

```text
Botoes de exportacao:
- Exportar Participantes
- Exportar Vendas
- Exportar Performance Closers

Formato CSV com colunas relevantes
Download automatico via Blob
```

---

## Modulo 4: Icones PWA

### Objetivo
Adicionar icones necessarios para instalacao correta em dispositivos moveis.

### Arquivos a criar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `public/icon-192.png` | Criar | Icone 192x192px |
| `public/icon-512.png` | Criar | Icone 512x512px |
| `public/manifest.json` | Modificar | Atualizar referencias de icones |

### Detalhes

- Criar icones com tema da marca Bethel Events
- Cor primaria azul (#3B82F6)
- Fundo transparente ou branco
- Formato PNG com bordas arredondadas

---

## Fluxo de Implementacao

```text
Fase 1: Historico de Vendas
   +-------------------+     +-------------------+     +-------------------+
   | Aba Vendas no     | --> | Pagina Sales.tsx  | --> | Rotas e Sidebar   |
   | ParticipantPanel  |     | com tabela        |     |                   |
   +-------------------+     +-------------------+     +-------------------+

Fase 2: Atribuicao em Massa
   +-------------------+     +-------------------+
   | Checkboxes nos    | --> | Barra de acoes    |
   | cards             |     | e logica          |
   +-------------------+     +-------------------+

Fase 3: Relatorios
   +-------------------+     +-------------------+     +-------------------+
   | Pagina Reports    | --> | Graficos          | --> | Exportacao CSV    |
   | com layout        |     | recharts          |     |                   |
   +-------------------+     +-------------------+     +-------------------+

Fase 4: PWA
   +-------------------+     +-------------------+
   | Criar icones      | --> | Atualizar         |
   |                   |     | manifest.json     |
   +-------------------+     +-------------------+
```

---

## Resumo de Arquivos

### Novos arquivos (4)
- `src/pages/Sales.tsx`
- `src/pages/Reports.tsx`
- `src/lib/export.ts`
- `public/icon-192.png`, `public/icon-512.png`

### Arquivos modificados (5)
- `src/components/participants/ParticipantPanel.tsx`
- `src/pages/Participants.tsx`
- `src/App.tsx`
- `src/components/layout/Sidebar.tsx`
- `public/manifest.json`

---

## Consideracoes de Seguranca

1. **RLS**: Vendas ja possuem RLS configurado - closers veem apenas suas vendas
2. **Atribuicao em massa**: Apenas admins podem usar (verificacao via isAdmin)
3. **Relatorios**: Pagina restrita a admins (AdminRoute wrapper)
4. **Exclusao de vendas**: Confirmacao obrigatoria via AlertDialog

---

## Estimativa de Componentes por Modulo

| Modulo | Componentes/Estados | Complexidade |
|--------|---------------------|--------------|
| Vendas | Dialog edicao, lista, handlers CRUD | Media |
| Atribuicao em massa | Selecao, barra flutuante, batch insert | Media |
| Relatorios | 4 graficos, 3 exportacoes, filtros | Alta |
| PWA | 2 icones, manifest | Baixa |

