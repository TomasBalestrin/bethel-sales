

# Plano: Atualizar Cores de Todos os Participantes Existentes

## Resumo

Executar atualizações SQL no banco de dados para atribuir as cores corretas a todos os 252 participantes com base nas faixas de faturamento.

## Situação Atual

| Faturamento | Quantidade | Cor a Atribuir |
|-------------|------------|----------------|
| Até R$ 5.000,00 | 29 | rosa |
| R$ 5.000,00 até 10.000,00 | 36 | preto |
| R$ 10.000,00 até 20.000,00 | 39 | azul_claro |
| R$ 20.000,00 até 50.000,00 | 38 | verde |
| R$ 50.000,00 até 100.000,00 | 25 | dourado |
| R$ 100.000,00 até 250.000,00 | 22 | laranja |
| R$ 250.000,00 até 500.000,00 | 4 | laranja |
| Acima de R$ 500.000,00 | 4 | laranja |
| Sem faturamento (null) | 55 | (não atribuir) |

**Total: 252 participantes, 197 receberão cores**

## Atualizações a Executar

Serão executados 8 comandos UPDATE no banco de dados:

```sql
-- Rosa: Até R$ 5.000,00
UPDATE participants SET cor = 'rosa' 
WHERE faturamento = 'Até R$ 5.000,00';

-- Preto: R$ 5.000,00 até 10.000,00
UPDATE participants SET cor = 'preto' 
WHERE faturamento = 'R$ 5.000,00 até 10.000,00';

-- Azul Claro: R$ 10.000,00 até 20.000,00
UPDATE participants SET cor = 'azul_claro' 
WHERE faturamento = 'R$ 10.000,00 até 20.000,00';

-- Verde: R$ 20.000,00 até 50.000,00
UPDATE participants SET cor = 'verde' 
WHERE faturamento = 'R$ 20.000,00 até 50.000,00';

-- Dourado: R$ 50.000,00 até 100.000,00
UPDATE participants SET cor = 'dourado' 
WHERE faturamento = 'R$ 50.000,00 até 100.000,00';

-- Laranja: R$ 100.000,00 até 250.000,00
UPDATE participants SET cor = 'laranja' 
WHERE faturamento = 'R$ 100.000,00 até 250.000,00';

-- Laranja: R$ 250.000,00 até 500.000,00
UPDATE participants SET cor = 'laranja' 
WHERE faturamento = 'R$ 250.000,00 até 500.000,00';

-- Laranja: Acima de R$ 500.000,00
UPDATE participants SET cor = 'laranja' 
WHERE faturamento = 'Acima de R$ 500.000,00';
```

## Resultado Esperado

Após a execução:
- 197 participantes terão suas cores definidas automaticamente
- 55 participantes com faturamento null permanecerão sem cor
- As cores aparecerão imediatamente nos cards da listagem de participantes

## Implementação

As atualizações serão feitas via ferramenta de inserção de dados do banco, sem necessidade de modificar código.

