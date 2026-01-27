
# Plano de Correção: Edge Function `create-user`

## Problema Identificado

A Edge Function `create-user` está retornando erro 500 porque está usando uma variável de ambiente que não existe:

- **Código atual usa**: `SUPABASE_PUBLISHABLE_KEY` (linha 27)
- **Nome correto**: `SUPABASE_ANON_KEY`

O Lovable Cloud configura automaticamente os seguintes secrets:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`  
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

Quando a funcao tenta acessar `SUPABASE_PUBLISHABLE_KEY`, ela recebe `undefined` e falha ao criar o cliente Supabase.

## Solucao

### Etapa 1: Corrigir a variavel de ambiente

Editar `supabase/functions/create-user/index.ts`:

```typescript
// Linha 27 - ANTES:
const supabaseAnonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

// DEPOIS:
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
```

### Etapa 2: Adicionar logging para debug

Adicionar mais logs na funcao para facilitar diagnostico de problemas futuros:

```typescript
console.log("Starting create-user function");
console.log("User requesting:", currentUser?.email);
```

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/create-user/index.ts` | Corrigir nome da variavel de `SUPABASE_PUBLISHABLE_KEY` para `SUPABASE_ANON_KEY` |

---

## Detalhes Tecnicos

A funcao usa dois clientes Supabase:
1. **userClient**: Com a anon key + token do usuario (para verificar se e admin)
2. **adminClient**: Com a service role key (para criar usuarios via API admin)

O problema ocorre no userClient porque `SUPABASE_PUBLISHABLE_KEY` retorna `undefined`, causando falha na inicializacao do cliente.

Apos a correcao, a funcao funcionara corretamente pois `SUPABASE_ANON_KEY` esta configurada automaticamente pelo Lovable Cloud.
