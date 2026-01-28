
# Plano: Botao para Excluir Participantes (Admin)

## Objetivo

Adicionar um botao para admins excluirem participantes do sistema, tanto individualmente (na pagina de detalhes) quanto em massa (selecionando varios na lista).

## Analise do Banco de Dados

As tabelas relacionadas ja possuem `ON DELETE CASCADE`:

| Tabela | Chave Estrangeira | Comportamento |
|--------|-------------------|---------------|
| `closer_assignments` | `participant_id` | Excluido automaticamente |
| `sales` | `participant_id` | Excluido automaticamente |
| `disc_forms` | `participant_id` | Excluido automaticamente |

A RLS ja permite que admins facam qualquer operacao em participants:
```sql
POLICY "Admins can do anything with participants" 
  FOR ALL USING (is_admin())
```

Nao precisa de Edge Function - podemos excluir diretamente pelo cliente Supabase.

## Implementacao

### 1. Pagina de Detalhes do Participante

Adicionar botao "Excluir" na aba "Acoes" com dialog de confirmacao:

```typescript
// Estado para controle do dialog
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

// Funcao de exclusao
const handleDeleteParticipant = async () => {
  if (!participant) return;
  setIsDeleting(true);
  
  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("id", participant.id);
  
  setIsDeleting(false);
  
  if (error) {
    toast({ variant: "destructive", title: "Erro", description: error.message });
    return;
  }
  
  toast({ title: "Participante excluido" });
  navigate("/participantes");
};
```

### 2. Lista de Participantes - Exclusao em Massa

Adicionar botao de exclusao no `BulkAssignBar` quando participantes estao selecionados:

```typescript
// Novo botao ao lado de "Atribuir"
<Button 
  variant="destructive" 
  onClick={handleBulkDelete}
  disabled={isDeleting}
>
  {isDeleting ? <Loader2 /> : <Trash2 />}
  Excluir ({selectedIds.length})
</Button>
```

### 3. Dialogs de Confirmacao

Usar `AlertDialog` com aviso claro sobre:
- Acao irreversivel
- Dados que serao perdidos (vendas, formularios DISC, atribuicoes)

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/ParticipantDetail.tsx` | Adicionar botao de exclusao na aba Acoes + AlertDialog |
| `src/components/participants/BulkAssignBar.tsx` | Adicionar botao de exclusao em massa + AlertDialog |

## Fluxo de Exclusao Individual

```text
Usuario clica "Excluir Participante"
        ↓
AlertDialog abre com aviso
        ↓
Usuario confirma
        ↓
DELETE FROM participants WHERE id = X
        ↓
(CASCADE exclui automaticamente relacionados)
        ↓
Toast de sucesso
        ↓
Redireciona para /participantes
```

## Fluxo de Exclusao em Massa

```text
Admin seleciona varios participantes
        ↓
Barra de acoes aparece com botao "Excluir"
        ↓
Clica em "Excluir"
        ↓
AlertDialog mostra quantidade
        ↓
Confirma
        ↓
DELETE FROM participants WHERE id IN (...)
        ↓
Toast de sucesso
        ↓
Lista atualiza
```

## Interface na Aba Acoes

```text
+-------------------------------------------+
| Acoes                                      |
+-------------------------------------------+
| [Gerar Formulario DISC]                   |
|                                           |
| [Atribuir Closer]                         |
|                                           |
| [Registrar Venda]                         |
|                                           |
+-------------------------------------------+
| Zona de Perigo                            |
+-------------------------------------------+
| [🗑 Excluir Participante] (vermelho)       |
+-------------------------------------------+
```

## Dialog de Confirmacao

```text
+-------------------------------------------+
| ⚠️ Excluir Participante                   |
+-------------------------------------------+
| Tem certeza que deseja excluir            |
| "Maria Silva"?                            |
|                                           |
| Esta acao ira remover permanentemente:    |
| • Historico de vendas                     |
| • Formulario DISC e respostas             |
| • Atribuicoes de closer                   |
|                                           |
| Esta acao nao pode ser desfeita.          |
|                                           |
|        [Cancelar]  [Excluir]              |
+-------------------------------------------+
```

## Seguranca

- Botao so aparece para admins (`isAdmin`)
- RLS ja protege a operacao no banco
- Confirmacao obrigatoria antes de excluir
- Nao ha como excluir sem ser admin autenticado
