

# Plano: Reorganizar Layout dos Cards de Qualificação

## Situação Atual

Cada card de qualificação mostra os indicadores em lista vertical:

```text
+---------------------------+
| Super Qualificadas        |
+---------------------------+
| Quantidade          0     |
| Vendas              0     |
| Conversão          0.0%   |
| Valor Vendas    R$ 0,00   |
| Valor Entradas  R$ 0,00   |
+---------------------------+
```

## Novo Layout Proposto

Cada card terá o título da qualificação no topo e os indicadores dispostos horizontalmente:

```text
+-----------------------------------------------------------+
| Super Qualificadas                                        |
+-----------------------------------------------------------+
| Qtd     Vendas    Conversão   Valor Vendas   Entradas     |
|  0        0         0.0%       R$ 0,00       R$ 0,00      |
+-----------------------------------------------------------+
```

## Implementação

Modificar a seção de Qualificação (linhas 263-298) no arquivo `src/pages/Dashboard.tsx`:

### De:
```typescript
<CardContent className="space-y-2">
  <div className="flex justify-between">
    <span>Quantidade</span>
    <span>{item.data.count}</span>
  </div>
  <div className="flex justify-between">
    <span>Vendas</span>
    <span>{item.data.vendas}</span>
  </div>
  ...
</CardContent>
```

### Para:
```typescript
<CardContent>
  <div className="grid grid-cols-5 gap-4 text-center">
    <div>
      <p className="text-xs text-muted-foreground">Quantidade</p>
      <p className="text-lg font-bold">{item.data.count}</p>
    </div>
    <div>
      <p className="text-xs text-muted-foreground">Vendas</p>
      <p className="text-lg font-bold">{item.data.vendas}</p>
    </div>
    <div>
      <p className="text-xs text-muted-foreground">Conversão</p>
      <p className="text-lg font-bold">{item.data.conversao.toFixed(1)}%</p>
    </div>
    <div>
      <p className="text-xs text-muted-foreground">Valor Vendas</p>
      <p className="text-lg font-bold">{formatCurrency(item.data.valorVendas)}</p>
    </div>
    <div>
      <p className="text-xs text-muted-foreground">Entradas</p>
      <p className="text-lg font-bold">{formatCurrency(item.data.valorEntradas)}</p>
    </div>
  </div>
</CardContent>
```

## Responsividade

Para telas menores (mobile), os indicadores se ajustarão automaticamente com `flex-wrap` ou grid responsivo para evitar quebra de layout.

## Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Dashboard.tsx` | Reorganizar CardContent da seção de Qualificação (linhas 274-295) |

## Resultado Visual

Cada card de qualificação terá:
- Título colorido no topo (Super/Médio/Baixo Qualificadas)
- 5 indicadores dispostos lado a lado horizontalmente
- Rótulo pequeno em cima, valor grande embaixo
- Mantém as cores de fundo e borda por qualificação

