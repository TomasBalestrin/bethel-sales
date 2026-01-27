

# Plano: Evitar Duplicacoes e Completar Dados Faltantes no Webhook

## Resumo

Modificar a logica do webhook para que, ao receber dados de um participante existente, apenas complete os campos que estao vazios no banco de dados. Se todos os campos ja estiverem preenchidos, o webhook sera ignorado.

## Comportamento Atual vs Novo

| Situacao | Comportamento Atual | Novo Comportamento |
|----------|--------------------|--------------------|
| Participante novo | Cria registro | Cria registro (sem mudanca) |
| Participante existente | Sobrescreve todos os dados | Preenche apenas campos vazios |
| Participante existente sem campos vazios | Sobrescreve | Ignora o webhook |

## Logica de Merge

```text
Para cada campo do webhook:
  Se campo_existente == null E campo_webhook != null:
    Atualizar campo
  Senao:
    Manter valor existente
```

### Campos a Verificar para Merge

- full_name (manter existente se preenchido)
- email
- phone
- instagram
- cpf_cnpj
- nome_cracha
- nicho
- faturamento (e cor associada)
- lucro_liquido
- objetivo_evento
- maior_dificuldade
- photo_url
- tem_socio
- aceitou_termo_imagem
- external_id
- form_name
- event_name
- registration_status

## Implementacao Tecnica

### 1. Buscar Dados Completos do Participante Existente

Ao encontrar um participante existente, buscar todos os seus dados atuais:

```typescript
// Ao inves de buscar apenas o ID
const { data: existingParticipant } = await supabase
  .from("participants")
  .select("*")  // Buscar todos os campos
  .eq("email", participantData.email)
  .single();
```

### 2. Nova Funcao de Merge

Criar funcao que compara dados existentes com novos e retorna apenas o que precisa ser atualizado:

```typescript
function mergeParticipantData(
  existing: Record<string, any>,
  incoming: Record<string, any>
): Record<string, any> | null {
  const fieldsToMerge = [
    'full_name', 'email', 'phone', 'instagram', 'cpf_cnpj',
    'nome_cracha', 'nicho', 'faturamento', 'lucro_liquido',
    'objetivo_evento', 'maior_dificuldade', 'photo_url',
    'external_id', 'form_name', 'event_name', 'registration_status'
  ];

  const updates: Record<string, any> = {};
  let hasUpdates = false;

  for (const field of fieldsToMerge) {
    const existingValue = existing[field];
    const incomingValue = incoming[field];

    // Se campo existente esta vazio e novo tem valor
    if (
      (existingValue === null || existingValue === undefined || existingValue === '') &&
      incomingValue !== null && incomingValue !== undefined && incomingValue !== ''
    ) {
      updates[field] = incomingValue;
      hasUpdates = true;
    }
  }

  // Campos booleanos - so atualizar se ainda estiver false
  if (!existing.tem_socio && incoming.tem_socio) {
    updates.tem_socio = true;
    hasUpdates = true;
  }
  if (!existing.aceitou_termo_imagem && incoming.aceitou_termo_imagem) {
    updates.aceitou_termo_imagem = true;
    hasUpdates = true;
  }

  // Se faturamento foi atualizado, recalcular cor
  if (updates.faturamento) {
    updates.cor = getColorFromFaturamento(updates.faturamento);
  }

  // Sempre atualizar webhook_data para manter historico
  if (hasUpdates) {
    updates.webhook_data = incoming.webhook_data;
  }

  return hasUpdates ? updates : null;
}
```

### 3. Fluxo Atualizado

```typescript
if (existingParticipant) {
  // Fazer merge dos dados
  const updates = mergeParticipantData(existingParticipant, participantData);

  if (updates === null) {
    // Nada para atualizar - ignorar
    console.log("Participante existente sem campos para completar:", existingParticipant.id);
    results.push({ 
      success: true, 
      action: "skipped", 
      id: existingParticipant.id,
      reason: "Todos os campos ja preenchidos"
    });
  } else {
    // Atualizar apenas campos vazios
    const { data, error } = await supabase
      .from("participants")
      .update(updates)
      .eq("id", existingParticipant.id)
      .select()
      .single();

    if (error) {
      results.push({ error: error.message });
    } else {
      console.log("Campos completados:", Object.keys(updates));
      results.push({ 
        success: true, 
        action: "merged", 
        id: data.id,
        fields_updated: Object.keys(updates).filter(k => k !== 'webhook_data')
      });
    }
  }
} else {
  // Inserir novo participante (sem mudanca)
}
```

## Arquivo a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/webhook-participants/index.ts` | Adicionar funcao de merge e modificar fluxo de update |

## Resultados do Webhook

O webhook retornara diferentes acoes:

| Acao | Significado |
|------|-------------|
| `created` | Novo participante inserido |
| `merged` | Campos vazios foram preenchidos |
| `skipped` | Participante existente sem campos para completar |
| `error` | Erro no processamento |

## Exemplo de Resposta

```json
{
  "results": [
    { "success": true, "action": "created", "id": "uuid-1" },
    { "success": true, "action": "merged", "id": "uuid-2", "fields_updated": ["phone", "instagram"] },
    { "success": true, "action": "skipped", "id": "uuid-3", "reason": "Todos os campos ja preenchidos" }
  ]
}
```

## Beneficios

1. **Sem duplicacoes**: Participantes existentes nao serao duplicados
2. **Dados preservados**: Informacoes ja preenchidas nao serao sobrescritas
3. **Completamento automatico**: Campos faltantes serao preenchidos quando disponiveis
4. **Rastreabilidade**: O log mostra exatamente quais campos foram atualizados

