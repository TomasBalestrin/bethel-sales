

# Plano: Permitir Edicao de Todas as Informacoes do Participante

## Resumo

Transformar todos os campos de participantes em editaveis, permitindo que o admin modifique qualquer informacao diretamente na pagina de detalhes do participante.

## Situacao Atual

A pagina de detalhes tem duas secoes:
- **Dados do Formulario**: Campos somente leitura (CPF, cracha, email, telefone, instagram, nicho, faturamento, etc.)
- **Informacoes Manuais**: Campos editaveis (funil, closer, mentorado, acompanhante, oportunidade, vezes_chamado, cor, qualificacao)

## Nova Estrutura

Todos os campos serao editaveis. A organizacao sera reorganizada em cards mais intuitivos.

### Cards de Edicao

```text
+--------------------------------------------------+
| Dados Basicos                                     |
| Nome Completo: [________________]                |
| Nome p/ Cracha: [_______________]                |
| CPF/CNPJ: [_____________________]                |
| Evento: [_______________________]                |
+--------------------------------------------------+

+--------------------------------------------------+
| Contato                                          |
| Email: [________________________]                |
| Telefone: [_____________________]                |
| Instagram: [____________________]                |
+--------------------------------------------------+

+--------------------------------------------------+
| Dados do Negocio                                 |
| Nicho: [________________________]                |
| Faturamento: [Select... v]                       |
| Lucro Liquido: [________________]                |
| Tem Socio: [Switch]                              |
+--------------------------------------------------+

+--------------------------------------------------+
| Objetivos e Desafios                             |
| Objetivo no Evento: [Textarea]                   |
| Maior Dificuldade: [Textarea]                    |
+--------------------------------------------------+

+--------------------------------------------------+
| Informacoes de Venda                             |
| Funil de origem: [______________]                |
| Closer que vendeu: [Select... v]                 |
| Mentorado que convidou: [_______]                |
| Acompanhante: [_________________]                |
| E oportunidade: [Switch]                         |
| Vezes chamado: [Select... v]                     |
| Cor: [Color picker]                              |
| Qualificacao: [Select... v] (admin only)         |
+--------------------------------------------------+

+--------------------------------------------------+
| Credenciamento                                    |
| Dia 1: [Switch]    Dia 2: [Switch]    Dia 3: [Switch] |
| Aceitou termo de imagem: [Switch]                |
| Status: [________________]                       |
+--------------------------------------------------+

               [Salvar Alteracoes]
```

## Campos a Tornar Editaveis

| Campo | Tipo de Input | Estado Atual |
|-------|---------------|--------------|
| full_name | Input text | Somente leitura |
| email | Input email | Somente leitura |
| phone | Input text | Somente leitura |
| instagram | Input text | Somente leitura |
| cpf_cnpj | Input text | Somente leitura |
| nome_cracha | Input text | Somente leitura |
| event_name | Input text | Somente leitura |
| nicho | Input text | Somente leitura |
| faturamento | Select | Somente leitura |
| lucro_liquido | Input text | Somente leitura |
| tem_socio | Switch | Somente leitura |
| objetivo_evento | Textarea | Somente leitura |
| maior_dificuldade | Textarea | Somente leitura |
| credenciou_dia1 | Switch | Somente leitura |
| credenciou_dia2 | Switch | Somente leitura |
| credenciou_dia3 | Switch | Somente leitura |
| aceitou_termo_imagem | Switch | Somente leitura |
| registration_status | Input text | Somente leitura |
| funil_origem | Input text | Ja editavel |
| closer_vendeu_id | Select | Ja editavel |
| mentorado_convidou | Input text | Ja editavel |
| acompanhante | Input text | Ja editavel |
| is_oportunidade | Switch | Ja editavel |
| vezes_chamado | Select | Ja editavel |
| cor | Color picker | Ja editavel |
| qualificacao | Select | Ja editavel |

## Implementacao Tecnica

### 1. Novos Estados para Campos Editaveis

```typescript
// Dados Basicos
const [fullName, setFullName] = useState("");
const [nomeCracha, setNomeCracha] = useState("");
const [cpfCnpj, setCpfCnpj] = useState("");
const [eventName, setEventName] = useState("");

// Contato
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [instagram, setInstagram] = useState("");

// Negocio
const [nicho, setNicho] = useState("");
const [faturamento, setFaturamento] = useState("");
const [lucroLiquido, setLucroLiquido] = useState("");
const [temSocio, setTemSocio] = useState(false);

// Objetivos
const [objetivoEvento, setObjetivoEvento] = useState("");
const [maiorDificuldade, setMaiorDificuldade] = useState("");

// Credenciamento
const [credenciouDia1, setCredenciouDia1] = useState(false);
const [credenciouDia2, setCredenciouDia2] = useState(false);
const [credenciouDia3, setCredenciouDia3] = useState(false);
const [aceitouTermoImagem, setAceitouTermoImagem] = useState(false);
const [registrationStatus, setRegistrationStatus] = useState("");
```

### 2. Carregar Dados nos Estados

No `fetchParticipant`, inicializar todos os novos estados:

```typescript
setFullName(data.full_name || "");
setNomeCracha(data.nome_cracha || "");
setCpfCnpj(data.cpf_cnpj || "");
setEventName(data.event_name || "");
setEmail(data.email || "");
setPhone(data.phone || "");
setInstagram(data.instagram || "");
setNicho(data.nicho || "");
setFaturamento(data.faturamento || "");
setLucroLiquido(data.lucro_liquido || "");
setTemSocio(data.tem_socio || false);
setObjetivoEvento(data.objetivo_evento || "");
setMaiorDificuldade(data.maior_dificuldade || "");
setCredenciouDia1(data.credenciou_dia1 || false);
setCredenciouDia2(data.credenciou_dia2 || false);
setCredenciouDia3(data.credenciou_dia3 || false);
setAceitouTermoImagem(data.aceitou_termo_imagem || false);
setRegistrationStatus(data.registration_status || "");
```

### 3. Atualizar Funcao handleSave

Incluir todos os campos no update:

```typescript
const handleSave = async () => {
  if (!participant) return;
  
  // Validacao do nome
  if (!fullName.trim() || fullName.trim().length < 2) {
    toast({ variant: "destructive", title: "Nome obrigatorio" });
    return;
  }
  
  setIsSaving(true);

  // Determinar cor automatica se faturamento mudou
  const selectedFaturamento = faturamentoOptions.find(f => f.value === faturamento);
  const autoColor = selectedFaturamento?.cor || cor || null;

  const updateData = {
    full_name: fullName.trim(),
    nome_cracha: nomeCracha || null,
    cpf_cnpj: cpfCnpj || null,
    event_name: eventName || null,
    email: email || null,
    phone: phone || null,
    instagram: instagram ? instagram.replace("@", "").trim() : null,
    nicho: nicho || null,
    faturamento: faturamento || null,
    cor: autoColor,
    lucro_liquido: lucroLiquido || null,
    tem_socio: temSocio,
    objetivo_evento: objetivoEvento || null,
    maior_dificuldade: maiorDificuldade || null,
    credenciou_dia1: credenciouDia1,
    credenciou_dia2: credenciouDia2,
    credenciou_dia3: credenciouDia3,
    aceitou_termo_imagem: aceitouTermoImagem,
    registration_status: registrationStatus || null,
    funil_origem: funilOrigem || null,
    closer_vendeu_id: closerVendeuId || null,
    mentorado_convidou: mentoradoConvidou || null,
    acompanhante: acompanhante || null,
    is_oportunidade: isOportunidade,
    vezes_chamado: vezesChamado,
    qualificacao: isAdmin && qualificacao ? qualificacao : participant.qualificacao,
  };

  const { error } = await supabase
    .from("participants")
    .update(updateData)
    .eq("id", participant.id);

  // ... tratamento de erro e sucesso
};
```

### 4. Opcoes de Faturamento

Reutilizar o mesmo mapeamento do CreateParticipantDialog:

```typescript
const faturamentoOptions = [
  { value: "Até R$ 5.000,00", label: "Até R$ 5.000", cor: "rosa" },
  { value: "R$ 5.000,00 até 10.000,00", label: "R$ 5.000 a R$ 10.000", cor: "preto" },
  { value: "R$ 10.000,00 até 20.000,00", label: "R$ 10.000 a R$ 20.000", cor: "azul_claro" },
  { value: "R$ 20.000,00 até 50.000,00", label: "R$ 20.000 a R$ 50.000", cor: "verde" },
  { value: "R$ 50.000,00 até 100.000,00", label: "R$ 50.000 a R$ 100.000", cor: "dourado" },
  { value: "R$ 100.000,00 até 250.000,00", label: "R$ 100.000 a R$ 250.000", cor: "laranja" },
  { value: "R$ 250.000,00 até 500.000,00", label: "R$ 250.000 a R$ 500.000", cor: "laranja" },
  { value: "Acima de R$ 500.000,00", label: "Acima de R$ 500.000", cor: "laranja" },
];
```

## Arquivo a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/ParticipantDetail.tsx` | Adicionar estados para todos os campos, reorganizar UI com campos editaveis, atualizar funcao handleSave |

## Comportamento

1. Ao abrir a pagina de detalhes, todos os campos sao carregados nos estados editaveis
2. O usuario pode modificar qualquer campo
3. Ao clicar em "Salvar Alteracoes", todos os campos sao atualizados no banco
4. A cor e atualizada automaticamente quando o faturamento e alterado
5. Validacao basica: nome obrigatorio com minimo 2 caracteres

## Restricoes de Acesso

- Closers podem editar participantes atribuidos a eles (ja existe RLS)
- Admins podem editar qualquer participante (ja existe RLS)
- Campo "Qualificacao" continua visivel apenas para admins

