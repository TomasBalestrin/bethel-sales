

# Plano: Simplificar Dashboard com Filtros

## Situacao Atual

O dashboard mostra:
- Participantes: Total + Dia 1, 2, 3 (4 cards)
- Oportunidades: Total + Dia 1, 2, 3 (4 cards)
- Qualificacao: 3 cards coloridos (Super/Medio/Baixo)
- TOP 3 Closers

**Problema**: Muita informacao espalhada, dificil comparar

## Novo Layout Proposto

```text
+------------------------------------------------------------------+
| Dashboard                                                         |
| Bem-vindo, Tomas Balestrin! (Administrador)                       |
+------------------------------------------------------------------+
| Filtros:  [Todos | Dia 1 | Dia 2 | Dia 3]  [Todas | Super | Medio | Baixo] |
+------------------------------------------------------------------+
|                                                                   |
| +-------------+ +-------------+ +-------------+                   |
| | Participan. | | Oportunid.  | | Vendas      |                   |
| |     254     | |     45      | |     12      |                   |
| +-------------+ +-------------+ +-------------+                   |
|                                                                   |
| +-------------+ +-------------+ +-------------+                   |
| | Conversao   | | Valor Vendas| | Entradas    |                   |
| |    26.7%    | | R$ 150.000  | | R$ 45.000   |                   |
| +-------------+ +-------------+ +-------------+                   |
|                                                                   |
+------------------------------------------------------------------+
| TOP 3 Closers (mantido igual)                                     |
+------------------------------------------------------------------+
```

## Logica dos Filtros

### Filtro de Credenciamento (Dia)
| Valor | Filtra participantes que... |
|-------|----------------------------|
| Todos | Todos os participantes |
| Dia 1 | `credenciou_dia1 = true` |
| Dia 2 | `credenciou_dia2 = true` |
| Dia 3 | `credenciou_dia3 = true` |

### Filtro de Qualificacao
| Valor | Filtra oportunidades que... |
|-------|----------------------------|
| Todas | Todas as oportunidades |
| Super | `qualificacao = 'super'` |
| Medio | `qualificacao = 'medio'` |
| Baixo | `qualificacao = 'baixo'` |

### Calculo dos KPIs com Filtros

```typescript
// Aplicar filtro de dia
let filteredParticipants = allParticipants;
if (diaFilter !== "todos") {
  filteredParticipants = allParticipants.filter(p => {
    if (diaFilter === "dia1") return p.credenciou_dia1;
    if (diaFilter === "dia2") return p.credenciou_dia2;
    if (diaFilter === "dia3") return p.credenciou_dia3;
    return true;
  });
}

// Aplicar filtro de qualificacao
let filteredOportunidades = filteredParticipants.filter(p => p.is_oportunidade);
if (qualFilter !== "todas") {
  filteredOportunidades = filteredOportunidades.filter(p => p.qualificacao === qualFilter);
}

// Calcular KPIs
const totalParticipantes = filteredParticipants.length;
const totalOportunidades = filteredOportunidades.length;
const filteredSales = allSales.filter(s => 
  filteredOportunidades.some(p => p.id === s.participant_id)
);
const totalVendas = filteredSales.length;
const taxaConversao = totalOportunidades > 0 
  ? (totalVendas / totalOportunidades) * 100 
  : 0;
const valorVendas = filteredSales.reduce((sum, s) => sum + Number(s.valor_total), 0);
const valorEntradas = filteredSales.reduce((sum, s) => sum + Number(s.valor_entrada), 0);
```

## Implementacao Tecnica

### 1. Novos Estados para Filtros

```typescript
const [diaFilter, setDiaFilter] = useState<"todos" | "dia1" | "dia2" | "dia3">("todos");
const [qualFilter, setQualFilter] = useState<"todas" | "super" | "medio" | "baixo">("todas");
```

### 2. Interface de Filtros (ToggleGroup)

```typescript
<div className="flex flex-wrap gap-4 items-center">
  <div className="flex items-center gap-2">
    <Calendar className="h-4 w-4 text-muted-foreground" />
    <ToggleGroup type="single" value={diaFilter} onValueChange={setDiaFilter}>
      <ToggleGroupItem value="todos">Todos</ToggleGroupItem>
      <ToggleGroupItem value="dia1">Dia 1</ToggleGroupItem>
      <ToggleGroupItem value="dia2">Dia 2</ToggleGroupItem>
      <ToggleGroupItem value="dia3">Dia 3</ToggleGroupItem>
    </ToggleGroup>
  </div>
  
  <div className="flex items-center gap-2">
    <Target className="h-4 w-4 text-muted-foreground" />
    <ToggleGroup type="single" value={qualFilter} onValueChange={setQualFilter}>
      <ToggleGroupItem value="todas">Todas</ToggleGroupItem>
      <ToggleGroupItem value="super" className="text-qualification-super">Super</ToggleGroupItem>
      <ToggleGroupItem value="medio" className="text-qualification-medio">Medio</ToggleGroupItem>
      <ToggleGroupItem value="baixo" className="text-qualification-baixo">Baixo</ToggleGroupItem>
    </ToggleGroup>
  </div>
</div>
```

### 3. Grid de 6 KPIs

```typescript
<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
        <Users className="h-4 w-4" /> Participantes
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{filteredStats.totalParticipantes}</div>
    </CardContent>
  </Card>
  
  {/* Oportunidades, Vendas, Conversao, Valor Vendas, Valor Entradas */}
</div>
```

### 4. Recalcular ao Mudar Filtros

```typescript
// Usar useMemo para recalcular stats baseado nos filtros
const filteredStats = useMemo(() => {
  // ... logica de filtragem
  return { totalParticipantes, totalOportunidades, totalVendas, taxaConversao, valorVendas, valorEntradas };
}, [allParticipants, allSales, diaFilter, qualFilter]);
```

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Dashboard.tsx` | Adicionar filtros, simplificar KPIs para 6 cards, recalcular baseado em filtros |

## Estrutura Final da Interface

```text
+-- Titulo e Boas-vindas --+
|                          |
+-- Filtros (2 grupos) ----+
| [Todos|D1|D2|D3]         |
| [Todas|Super|Medio|Baixo]|
+-- 6 KPIs em Grid --------+
| Part | Oport | Vendas    |
| Conv | V.Vnd | Entradas  |
+--------------------------+
+-- TOP 3 Closers ---------+
| (mantido igual)          |
+--------------------------+
```

## Beneficios

1. **Menos poluicao visual**: 6 cards em vez de 11
2. **Mais flexibilidade**: Filtros permitem analise especifica
3. **Comparacao facil**: Muda o filtro e ve os numeros atualizarem
4. **Responsivo**: Grid de 6 se adapta a telas menores

