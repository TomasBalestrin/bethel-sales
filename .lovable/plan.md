
# 🎯 Bethel Events - Sistema de Acompanhamento de Vendas

Sistema completo para gestão de vendas e participação em eventos, com acompanhamento de closers, análise de perfil DISC via IA, e dashboards em tempo real.

---

## 📱 Configuração Base
- **PWA (Progressive Web App)** - Instalável no celular como aplicativo
- **Design Moderno/Minimalista** - Interface limpa com bastante espaço em branco e cores suaves
- **Responsivo** - Funciona perfeitamente em desktop e mobile

---

## 🔐 Autenticação e Permissões

### Sistema de Login
- Tela de login elegante com a marca Bethel
- Recuperação de senha via email

### Roles e Permissões
- **Admin** - Acesso completo a todos os módulos
- **Closer** - Acesso restrito aos seus participantes e métricas pessoais

---

## 👤 Painel Admin (CRUD de Usuários)

### Funcionalidades
- Criar novos usuários (Admins e Closers)
- Editar dados: nome, email, senha, role
- Upload de foto do usuário
- Ativar/desativar usuários
- Excluir usuários

---

## 👥 Módulo Participantes

### Recebimento via Webhook
- Endpoint seguro para receber dados do seu sistema próprio
- Validação e armazenamento automático
- Suporte a dados de credenciamento (Dia 1, 2, 3)

### Card do Participante
- Foto, Nome, Faturamento, Nicho
- Indicador de cor (Rosa, Preto, Azul claro, Dourado, Laranja)
- Link clicável para Instagram

### Painel do Participante (ao clicar)
**Dados automáticos (webhook):**
- Todas as informações importadas
- Status de credenciamento por dia

**Dados manuais:**
- De qual funil veio?
- Qual Closer vendeu/convidou?
- Qual Mentorado convidou?
- Quem é o acompanhante?
- É uma oportunidade? (Sim/Não)
- Quantas vezes foi chamado? (0-4)
- Seleção de cor

**Ações especiais:**
- Botão "Atribuir Closer" (lista de closers disponíveis)
- Botão "Venda Realizada" (popup com produto, valor, entrada, negociação)
- Botão "Gerar Formulário" (formulário único para análise DISC)

### Filtros (Admin)
- Funil de origem
- Vendedor que convidou
- É oportunidade?
- Teve venda?

### Filtros (Closer)
- Mesmos filtros, exceto "qual vendedor"

---

## 📋 Formulário DISC + IA

### Perguntas do Formulário
Modelo sugerido com ~15 perguntas situacionais para identificar perfil DISC (Dominância, Influência, Estabilidade, Conformidade)

### Análise por IA (OpenAI GPT)
- Identificação do perfil predominante
- Descrição do perfil comportamental
- Insights personalizados para venda
- Principais objeções previstas
- Técnicas de contorno de objeções
- Exemplos práticos para fechamento

---

## 🎯 Módulo Closers

### Card do Closer
- Foto e Nome
- Oportunidades comparecidas
- Quantidade de vendas
- Taxa de conversão
- Valor total de vendas
- Valor de entradas

### Painel do Closer (ao clicar)
- Participantes atribuídos
- Filtros por dia de comparecimento
- Oportunidades totais por dia
- **Exclusivo Admin:** Qualificação de oportunidades (Super/Médio/Baixo)

---

## 📊 Dashboard Admin

### Bloco 1 - Participantes
- Total de participantes
- Credenciados Dia 1, 2, 3 (quantidade + % do total)

### Bloco 2 - Oportunidades
- Total de oportunidades
- Credenciadas Dia 1, 2, 3 (quantidade + % do total)

### Blocos de Qualificação
- 🟢 **Super qualificadas** - Vendas, conversão, valores
- 🔵 **Médio qualificadas** - Vendas, conversão, valores
- 🔴 **Baixo qualificadas** - Vendas, conversão, valores

### TOP 3 Closers
- Pódio visual com fotos
- Quantidade e valor de vendas
- Valor de entradas

---

## 📊 Dashboard Closer

### Métricas Pessoais
- Participantes que compareceram
- Oportunidades que compareceram
- Quantidade de vendas
- Taxa de conversão
- Valor de vendas
- Valor de entrada

### TOP 3 Closers
- Mesmo pódio visual do admin

---

## 🗄️ Backend (Lovable Cloud + Supabase)

### Tabelas
- users (autenticação)
- user_roles (admin/closer)
- profiles (dados do usuário)
- participants (participantes)
- closers_assignments (atribuições)
- sales (vendas realizadas)
- disc_forms (formulários gerados)
- disc_responses (respostas + análise IA)
- products (produtos vendidos)

### Edge Functions
- Webhook receptor de participantes
- Webhook receptor de credenciamento
- Análise DISC via OpenAI GPT
- Geração de insights de vendas

### Segurança
- RLS (Row Level Security) para separar dados por role
- Closers só veem seus participantes
- Admins veem tudo

---

## 🔄 Fases de Implementação

### Fase 1 - Base
Autenticação, roles, painel admin de usuários

### Fase 2 - Participantes
Webhook, listagem, cards, painel detalhado

### Fase 3 - Vendas e Closers
Sistema de vendas, atribuições, módulo closers

### Fase 4 - IA e Formulários
Formulário DISC, integração OpenAI, insights

### Fase 5 - Dashboards
Dashboard admin, dashboard closer, TOP 3

### Fase 6 - PWA
Configuração final para instalação mobile

