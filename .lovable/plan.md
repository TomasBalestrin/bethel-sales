
# Plano: Reestruturar Painel do Participante com Dados Completos

## Contexto

O painel atual do participante exibe apenas alguns campos básicos (email, telefone, faturamento, nicho), mas o JSON do webhook importa muitos dados adicionais que já estão salvos no banco mas não são exibidos:

**Campos importados (atualmente salvos, mas não exibidos):**
- CPF/CNPJ
- Nome para crachá
- Tem sócio?
- Lucro líquido mensal
- Objetivo no evento
- Maior dificuldade no negócio
- Nome do evento
- Status de registro
- Aceitou termo de imagem

---

## Nova Estrutura do Painel

### Aba "Dados" - Reorganização Completa

A aba será dividida em 3 seções claras:

#### Seção 1: Informações de Contato
Card compacto com email, telefone e Instagram (mantém o formato atual)

#### Seção 2: Dados Importados (Somente Leitura)
Card destacado com todos os dados vindos do webhook:

| Campo | Descrição |
|-------|-----------|
| CPF/CNPJ | Documento do participante |
| Nome para Crachá | Nome curto para identificação |
| Evento | Nome do evento inscrito |
| Status do Registro | registered, confirmed, etc. |
| Tem Sócio? | Sim/Não |
| Faturamento | Faixa de faturamento mensal |
| Lucro Líquido | Faixa de lucro mensal |
| Nicho | Área de atuação profissional |
| Objetivo no Evento | Texto longo - o que pretende aprender |
| Maior Dificuldade | Texto longo - desafio atual no negócio |
| Aceitou Termo de Imagem | Sim/Não |

#### Seção 3: Informações Manuais (Editáveis)
Mantém os campos atuais que são preenchidos pelos closers/admins:
- Funil de origem
- Closer que vendeu/convidou
- Mentorado que convidou
- Acompanhante
- É uma oportunidade?
- Quantas vezes foi chamado?
- Cor
- Qualificação (admin only)

---

## Alterações Necessárias

### Arquivo: `src/components/participants/ParticipantPanel.tsx`

1. **Atualizar a interface `Participant`** para incluir os novos campos:
   - `cpf_cnpj`, `nome_cracha`, `tem_socio`, `lucro_liquido`
   - `objetivo_evento`, `maior_dificuldade`
   - `event_name`, `registration_status`, `aceitou_termo_imagem`

2. **Reorganizar a TabsContent "dados"** em 3 seções com Cards separados

3. **Criar componentes visuais apropriados**:
   - Campos de texto longo (objetivo/dificuldade) em cards expansíveis
   - Badges para campos booleanos (tem sócio, aceitou termo)
   - Grid de 2-3 colunas para campos curtos

---

## Layout Visual Proposto

```text
+------------------------------------------+
|  INFORMAÇÕES DE CONTATO                  |
|  [Email] [Telefone] [Instagram]          |
+------------------------------------------+

+------------------------------------------+
|  DADOS DO FORMULÁRIO (importados)        |
+------------------------------------------+
|  CPF/CNPJ         | Nome p/ Crachá       |
|  481.818.328-84   | Sabrina Nogueira     |
+-------------------+----------------------+
|  Evento                                  |
|  Intensivo Da Alta Performance           |
+------------------------------------------+
|  Status          | Tem Sócio?            |
|  [registered]    | [Não]                 |
+-------------------+----------------------+
|  Faturamento     | Lucro Líquido         |
|  Até R$ 5.000    | Até R$ 5.000          |
+-------------------+----------------------+
|  Nicho                                   |
|  Nail Designer                           |
+------------------------------------------+
|  Objetivo no Evento                      |
|  "Aprender estratégias de alta..."       |
+------------------------------------------+
|  Maior Dificuldade                       |
|  "Minha maior dificuldade hoje é..."     |
+------------------------------------------+
|  [x] Aceitou termo de imagem             |
+------------------------------------------+

+------------------------------------------+
|  INFORMAÇÕES MANUAIS (editáveis)         |
+------------------------------------------+
|  [Campos atuais mantidos]                |
+------------------------------------------+
```

---

## Seção Técnica

### Interface Atualizada

```typescript
interface Participant {
  // Campos existentes
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  faturamento: string | null;
  nicho: string | null;
  instagram: string | null;
  credenciou_dia1: boolean;
  credenciou_dia2: boolean;
  credenciou_dia3: boolean;
  funil_origem: string | null;
  closer_vendeu_id: string | null;
  mentorado_convidou: string | null;
  acompanhante: string | null;
  is_oportunidade: boolean;
  vezes_chamado: number;
  cor: string | null;
  qualificacao: string | null;
  
  // Novos campos importados
  cpf_cnpj: string | null;
  nome_cracha: string | null;
  tem_socio: boolean;
  lucro_liquido: string | null;
  objetivo_evento: string | null;
  maior_dificuldade: string | null;
  event_name: string | null;
  registration_status: string | null;
  aceitou_termo_imagem: boolean;
}
```

### Arquivos a Modificar

1. **`src/components/participants/ParticipantPanel.tsx`**
   - Expandir interface Participant
   - Reestruturar aba "Dados" com as 3 seções
   - Adicionar exibição dos novos campos

2. **`src/pages/Participants.tsx`**
   - Atualizar interface Participant para incluir novos campos
   - Garantir que os dados são passados para o ParticipantPanel
