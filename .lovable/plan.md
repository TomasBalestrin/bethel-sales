

# Plano: Adicao Manual de Participantes pelo Admin

## Resumo

Adicionar um botao "Novo Participante" na tela de participantes que abre um dialogo/formulario para o admin cadastrar participantes manualmente, sem depender do webhook.

## Interface Proposta

```text
+--------------------------------------------------+
| Participantes                   [+ Novo] [Export]|
| 252 de 252 participantes                         |
+--------------------------------------------------+
| [Buscar...]                                      |
| [Filtros: Funil | Closer | Oportunidade | Venda] |
+--------------------------------------------------+
| [Cards de participantes...]                      |
+--------------------------------------------------+
```

## Campos do Formulario

O formulario de criacao manual tera dois grupos de campos:

### Campos Obrigatorios
| Campo | Tipo | Descricao |
|-------|------|-----------|
| Nome Completo | text | Unico campo obrigatorio no banco |

### Campos Opcionais (Dados Basicos)
| Campo | Tipo | Descricao |
|-------|------|-----------|
| Email | text | Email do participante |
| Telefone | text | Telefone com DDD |
| Instagram | text | Handle do Instagram |
| Nicho | text | Area de atuacao |
| Faturamento | select | Faixa de faturamento (mesmo do webhook) |
| Nome para Cracha | text | Nome a ser usado no cracha |
| CPF/CNPJ | text | Documento |
| Evento | text | Nome do evento |

### Campos Opcionais (Informacoes Adicionais)
| Campo | Tipo | Descricao |
|-------|------|-----------|
| Tem Socio | switch | Se tem socio ou nao |
| Lucro Liquido | text | Faixa de lucro |
| Objetivo no Evento | text | O que espera do evento |
| Maior Dificuldade | text | Principal desafio |

## Logica de Cores Automatica

Ao selecionar o faturamento, a cor sera automaticamente atribuida conforme regras ja implementadas:
- Ate R$ 5.000 → Rosa
- R$ 5.000 a 10.000 → Preto
- R$ 10.000 a 20.000 → Azul Claro
- R$ 20.000 a 50.000 → Verde
- R$ 50.000 a 100.000 → Dourado
- Acima de R$ 100.000 → Laranja

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Participants.tsx` | Adicionar botao "Novo Participante", dialog de criacao e logica de submit |

## Implementacao Tecnica

### 1. Estado do Dialog

```typescript
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
const [isCreating, setIsCreating] = useState(false);

// Form state
const [newName, setNewName] = useState("");
const [newEmail, setNewEmail] = useState("");
const [newPhone, setNewPhone] = useState("");
const [newInstagram, setNewInstagram] = useState("");
const [newNicho, setNewNicho] = useState("");
const [newFaturamento, setNewFaturamento] = useState("");
const [newNomeCracha, setNewNomeCracha] = useState("");
const [newCpfCnpj, setNewCpfCnpj] = useState("");
const [newEventName, setNewEventName] = useState("");
const [newTemSocio, setNewTemSocio] = useState(false);
const [newLucroLiquido, setNewLucroLiquido] = useState("");
const [newObjetivoEvento, setNewObjetivoEvento] = useState("");
const [newMaiorDificuldade, setNewMaiorDificuldade] = useState("");
```

### 2. Opcoes de Faturamento

```typescript
const faturamentoOptions = [
  { value: "Até R$ 5.000,00", label: "Até R$ 5.000,00", cor: "rosa" },
  { value: "R$ 5.000,00 até 10.000,00", label: "R$ 5.000 a R$ 10.000", cor: "preto" },
  { value: "R$ 10.000,00 até 20.000,00", label: "R$ 10.000 a R$ 20.000", cor: "azul_claro" },
  { value: "R$ 20.000,00 até 50.000,00", label: "R$ 20.000 a R$ 50.000", cor: "verde" },
  { value: "R$ 50.000,00 até 100.000,00", label: "R$ 50.000 a R$ 100.000", cor: "dourado" },
  { value: "R$ 100.000,00 até 250.000,00", label: "R$ 100.000 a R$ 250.000", cor: "laranja" },
  { value: "R$ 250.000,00 até 500.000,00", label: "R$ 250.000 a R$ 500.000", cor: "laranja" },
  { value: "Acima de R$ 500.000,00", label: "Acima de R$ 500.000", cor: "laranja" },
];
```

### 3. Funcao de Criacao

```typescript
const handleCreateParticipant = async () => {
  if (!newName.trim()) {
    toast({ variant: "destructive", title: "Nome obrigatorio" });
    return;
  }

  setIsCreating(true);

  const selectedFaturamento = faturamentoOptions.find(f => f.value === newFaturamento);

  const { error } = await supabase.from("participants").insert({
    full_name: newName.trim(),
    email: newEmail || null,
    phone: newPhone || null,
    instagram: newInstagram || null,
    nicho: newNicho || null,
    faturamento: newFaturamento || null,
    cor: selectedFaturamento?.cor || null,
    nome_cracha: newNomeCracha || null,
    cpf_cnpj: newCpfCnpj || null,
    event_name: newEventName || null,
    tem_socio: newTemSocio,
    lucro_liquido: newLucroLiquido || null,
    objetivo_evento: newObjetivoEvento || null,
    maior_dificuldade: newMaiorDificuldade || null,
  });

  setIsCreating(false);

  if (error) {
    toast({ variant: "destructive", title: "Erro", description: error.message });
    return;
  }

  toast({ title: "Participante criado!", description: "O participante foi adicionado com sucesso." });
  resetForm();
  setIsCreateDialogOpen(false);
  fetchParticipants();
};
```

### 4. Botao no Header

```tsx
<div className="flex items-center gap-2">
  {isAdmin && (
    <Button onClick={() => setIsCreateDialogOpen(true)}>
      <Plus className="h-4 w-4 mr-2" />
      Novo Participante
    </Button>
  )}
  <Button variant="outline" onClick={handleExport}>
    <Download className="h-4 w-4 mr-2" />
    Exportar CSV
  </Button>
</div>
```

### 5. Layout do Dialog

O dialog tera duas colunas em telas maiores para organizar os campos de forma mais compacta:

```text
+------------------------------------------------+
| Novo Participante                              |
| Preencha os dados do novo participante.        |
+------------------------------------------------+
| Nome Completo *          | Email               |
| [__________________]     | [_______________]   |
|                          |                     |
| Telefone                 | Instagram           |
| [__________________]     | [_______________]   |
|                          |                     |
| Nicho                    | Faturamento         |
| [__________________]     | [Select... v]       |
|                          |                     |
| Nome para Cracha         | CPF/CNPJ            |
| [__________________]     | [_______________]   |
|                          |                     |
| Evento                   | Tem Socio           |
| [__________________]     | [Switch]            |
|                          |                     |
| Lucro Liquido            | Objetivo no Evento  |
| [__________________]     | [_______________]   |
|                          |                     |
| Maior Dificuldade                              |
| [__________________________________________]   |
+------------------------------------------------+
|                     [Cancelar] [Criar]         |
+------------------------------------------------+
```

## Validacoes

1. **Nome Completo**: Campo obrigatorio, minimo 2 caracteres
2. **Email**: Validacao de formato se preenchido
3. **Telefone**: Apenas numeros se preenchido
4. **Instagram**: Remove @ automaticamente se incluido

## Fluxo do Usuario

1. Admin clica em "Novo Participante"
2. Dialog abre com formulario
3. Preenche os dados (apenas nome e obrigatorio)
4. Ao selecionar faturamento, cor e determinada automaticamente
5. Clica em "Criar"
6. Participante e inserido no banco
7. Lista e atualizada mostrando o novo participante

## Comportamento

- Botao "Novo Participante" visivel apenas para admins (`isAdmin`)
- Participante criado manualmente nao tera `webhook_data` (sera null)
- Campo `imported_at` sera null para diferenciar de importados
- Cor atribuida automaticamente baseada no faturamento selecionado

