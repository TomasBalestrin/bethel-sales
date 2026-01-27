

# Plano: Adicionar Funcionalidade de Excluir Usuario

## Visao Geral

Implementar um botao de exclusao de usuario na tabela do Painel Admin, com confirmacao antes de excluir. Criar uma Edge Function `delete-user` que remove o usuario completamente do sistema (Auth, profiles e user_roles).

## Arquitetura da Solucao

```text
+------------------+      +------------------+      +------------------+
|   AdminPanel     | ---> |   delete-user    | ---> |    Supabase      |
|   (Frontend)     |      |  Edge Function   |      |                  |
+------------------+      +------------------+      +------------------+
        |                         |                        |
   1. Clique no                2. Verifica se          3. Deleta:
      botao Trash2                e admin                 - user_roles
        |                         |                       - profiles
   4. Confirma                 5. Deleta usuario          - auth.users
      exclusao                    via Admin API
```

## Mudancas a Implementar

### 1. Criar Edge Function `delete-user`

**Arquivo:** `supabase/functions/delete-user/index.ts`

A funcao ira:
- Validar autenticacao (token JWT)
- Verificar se o usuario logado e admin
- Impedir que o admin exclua a si mesmo
- Deletar registros na ordem correta:
  1. `user_roles` (para evitar FK constraint)
  2. `profiles` (cascade pode ajudar, mas garantir)
  3. `auth.users` (via Admin API)
- Retornar sucesso ou erro apropriado

Estrutura da funcao:
- CORS headers padronizados (como nas outras funcoes)
- Validacao de admin usando `user_roles`
- Uso do `adminClient` com `SUPABASE_SERVICE_ROLE_KEY`
- Metodo: `adminClient.auth.admin.deleteUser(userId)`

### 2. Atualizar AdminPanel.tsx

**Arquivo:** `src/pages/AdminPanel.tsx`

Adicionar:
- Estado para dialog de confirmacao (`isDeleteDialogOpen`)
- Estado para usuario sendo excluido (`deletingUser`)
- Funcao `handleDeleteUser` que:
  - Chama `supabase.functions.invoke("delete-user", { body: { userId } })`
  - Mostra toast de sucesso/erro
  - Atualiza lista de usuarios
- Dialog de confirmacao com AlertDialog
- Botao de lixeira (Trash2) na coluna de acoes
  - Desabilitado para o proprio usuario logado

### 3. Atualizar config.toml

**Arquivo:** `supabase/config.toml`

Adicionar configuracao da nova funcao:
```toml
[functions.delete-user]
verify_jwt = false
```

## Detalhes de Implementacao

### Edge Function delete-user

```text
Fluxo:
1. Recebe POST com { userId: string }
2. Valida Authorization header
3. Busca role do usuario logado
4. Se nao for admin -> 403
5. Se userId == usuario logado -> 400 (nao pode se auto-excluir)
6. Deleta de user_roles
7. Deleta de profiles  
8. Deleta via auth.admin.deleteUser()
9. Retorna { success: true }
```

### Interface do Usuario

- Botao com icone Trash2 (ja importado no componente)
- Cor vermelha (text-destructive)
- Desabilitado quando `user.user_id === profile?.user_id`
- Ao clicar: abre AlertDialog de confirmacao
- AlertDialog com:
  - Titulo: "Excluir Usuario"
  - Descricao: "Tem certeza que deseja excluir {nome}? Esta acao nao pode ser desfeita."
  - Botoes: Cancelar / Excluir (vermelho)

## Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `supabase/functions/delete-user/index.ts` | Criar | Edge Function para deletar usuario |
| `src/pages/AdminPanel.tsx` | Modificar | Adicionar botao, dialog e handler |
| `supabase/config.toml` | Modificar | Adicionar config da nova funcao |

## Validacoes de Seguranca

1. **Autenticacao obrigatoria**: Token JWT validado
2. **Autorizacao admin**: Apenas admins podem excluir usuarios
3. **Protecao contra auto-exclusao**: Admin nao pode excluir a si mesmo
4. **Cascade seguro**: Deleta dependencias antes do usuario principal
5. **Logging**: Registra exclusoes para auditoria

## Testes Recomendados

1. Excluir usuario closer -> deve funcionar
2. Excluir usuario admin (por outro admin) -> deve funcionar
3. Tentar excluir a si mesmo -> botao desabilitado + backend retorna erro
4. Verificar se usuario sumiu das tabelas profiles e user_roles
5. Verificar se usuario nao consegue mais fazer login

