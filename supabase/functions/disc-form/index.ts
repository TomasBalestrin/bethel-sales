import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// ==========================================
// PARTE 1: PERGUNTAS DE ARQUÉTIPO (10 perguntas × 6 opções)
// ==========================================
const ARCHETYPE_QUESTIONS = [
  {
    id: 1,
    text: "O que mais te motiva na vida?",
    options: [
      { text: "Acreditar que o mundo pode ser melhor", archetype: "Inocente" },
      { text: "Superar desafios e provar meu valor", archetype: "Herói" },
      { text: "Descobrir verdades e entender as coisas", archetype: "Sábio" },
      { text: "Viver experiências novas e únicas", archetype: "Explorador" },
      { text: "Transformar sonhos em realidade", archetype: "Mago" },
      { text: "Cuidar e proteger quem amo", archetype: "Cuidador" }
    ]
  },
  {
    id: 2,
    text: "Em um grupo, você naturalmente:",
    options: [
      { text: "Lidera e organiza", archetype: "Governante" },
      { text: "Conecta as pessoas e cria harmonia", archetype: "Amante" },
      { text: "Questiona regras e propõe mudanças", archetype: "Rebelde" },
      { text: "Traz humor e leveza", archetype: "Bobo da Corte" },
      { text: "Se adapta e busca pertencer", archetype: "Cara Comum" },
      { text: "Cria soluções originais", archetype: "Criador" }
    ]
  },
  {
    id: 3,
    text: "O que as pessoas mais admiram em você?",
    options: [
      { text: "Minha coragem e determinação", archetype: "Herói" },
      { text: "Minha capacidade de transformar situações", archetype: "Mago" },
      { text: "Meu carinho e atenção", archetype: "Cuidador" },
      { text: "Minha autenticidade e originalidade", archetype: "Criador" },
      { text: "Minha sabedoria e profundidade", archetype: "Sábio" },
      { text: "Minha capacidade de liderar", archetype: "Governante" }
    ]
  },
  {
    id: 4,
    text: "Qual seu maior medo?",
    options: [
      { text: "Ser rejeitado ou excluído", archetype: "Cara Comum" },
      { text: "Viver uma vida sem graça ou monótona", archetype: "Explorador" },
      { text: "Não conseguir ajudar quem precisa", archetype: "Cuidador" },
      { text: "Ser controlado ou perder liberdade", archetype: "Rebelde" },
      { text: "Ficar sozinho ou sem conexões", archetype: "Amante" },
      { text: "Ser enganado ou decepcionado", archetype: "Inocente" }
    ]
  },
  {
    id: 5,
    text: "Como você lida com problemas?",
    options: [
      { text: "Enfrento de frente com coragem", archetype: "Herói" },
      { text: "Analiso antes de agir", archetype: "Sábio" },
      { text: "Busco uma solução criativa diferente", archetype: "Criador" },
      { text: "Uso humor para aliviar a tensão", archetype: "Bobo da Corte" },
      { text: "Organizo um plano e executo", archetype: "Governante" },
      { text: "Confio que vai dar certo no final", archetype: "Inocente" }
    ]
  },
  {
    id: 6,
    text: "O que você busca nos relacionamentos?",
    options: [
      { text: "Paixão e conexão profunda", archetype: "Amante" },
      { text: "Lealdade e confiança", archetype: "Cara Comum" },
      { text: "Aventura e novas experiências juntos", archetype: "Explorador" },
      { text: "Parceria para mudar o mundo", archetype: "Rebelde" },
      { text: "Alguém que me apoie e eu possa apoiar", archetype: "Cuidador" },
      { text: "Crescimento e transformação mútua", archetype: "Mago" }
    ]
  },
  {
    id: 7,
    text: "Qual sua maior força?",
    options: [
      { text: "Determinação para vencer obstáculos", archetype: "Herói" },
      { text: "Capacidade de fazer as pessoas rirem", archetype: "Bobo da Corte" },
      { text: "Visão para criar coisas únicas", archetype: "Criador" },
      { text: "Habilidade de liderar e inspirar", archetype: "Governante" },
      { text: "Conhecimento e análise profunda", archetype: "Sábio" },
      { text: "Poder de transformar realidades", archetype: "Mago" }
    ]
  },
  {
    id: 8,
    text: "O que te faz sentir realizado?",
    options: [
      { text: "Ajudar alguém a superar dificuldades", archetype: "Cuidador" },
      { text: "Descobrir algo novo sobre o mundo", archetype: "Explorador" },
      { text: "Criar momentos especiais com pessoas amadas", archetype: "Amante" },
      { text: "Desafiar o sistema e causar mudanças", archetype: "Rebelde" },
      { text: "Ser parte de uma comunidade unida", archetype: "Cara Comum" },
      { text: "Ver o mundo com esperança e otimismo", archetype: "Inocente" }
    ]
  },
  {
    id: 9,
    text: "Qual frase mais combina com você?",
    options: [
      { text: "A vida é uma aventura a ser vivida", archetype: "Explorador" },
      { text: "O riso é o melhor remédio", archetype: "Bobo da Corte" },
      { text: "Juntos somos mais fortes", archetype: "Cara Comum" },
      { text: "Regras foram feitas para serem quebradas", archetype: "Rebelde" },
      { text: "O amor move o mundo", archetype: "Amante" },
      { text: "Tudo é possível se você acreditar", archetype: "Mago" }
    ]
  },
  {
    id: 10,
    text: "Como você quer ser lembrado?",
    options: [
      { text: "Por ter feito grandes conquistas", archetype: "Herói" },
      { text: "Por ter cuidado bem das pessoas", archetype: "Cuidador" },
      { text: "Por ter deixado um legado de conhecimento", archetype: "Sábio" },
      { text: "Por ter criado algo único e original", archetype: "Criador" },
      { text: "Por ter liderado com sabedoria", archetype: "Governante" },
      { text: "Por ter mantido a fé e esperança", archetype: "Inocente" }
    ]
  }
];

// ==========================================
// PARTE 2: PERGUNTAS DISC (10 perguntas × 4 opções)
// ==========================================
const DISC_QUESTIONS = [
  {
    id: 11,
    text: "No trabalho, você prefere:",
    options: [
      { text: "Tomar decisões rápidas e ver resultados", disc: "D" },
      { text: "Trabalhar em equipe e manter harmonia", disc: "S" },
      { text: "Analisar dados antes de agir", disc: "C" },
      { text: "Motivar pessoas e gerar entusiasmo", disc: "I" }
    ]
  },
  {
    id: 12,
    text: "Quando alguém discorda de você:",
    options: [
      { text: "Defendo meu ponto com firmeza", disc: "D" },
      { text: "Busco entender o lado da pessoa", disc: "S" },
      { text: "Peço que me mostre os fatos", disc: "C" },
      { text: "Tento convencer com entusiasmo", disc: "I" }
    ]
  },
  {
    id: 13,
    text: "O que mais te incomoda?",
    options: [
      { text: "Lentidão e falta de ação", disc: "D" },
      { text: "Conflitos e ambiente tenso", disc: "S" },
      { text: "Erros e falta de qualidade", disc: "C" },
      { text: "Rotina e falta de novidade", disc: "I" }
    ]
  },
  {
    id: 14,
    text: "Como você toma decisões importantes?",
    options: [
      { text: "Rápido, confiando no instinto", disc: "D" },
      { text: "Com calma, considerando todos", disc: "S" },
      { text: "Analisando todas as informações", disc: "C" },
      { text: "Conversando com pessoas de confiança", disc: "I" }
    ]
  },
  {
    id: 15,
    text: "O que te motiva no trabalho?",
    options: [
      { text: "Desafios e conquistas", disc: "D" },
      { text: "Estabilidade e segurança", disc: "S" },
      { text: "Qualidade e excelência", disc: "C" },
      { text: "Reconhecimento e interação", disc: "I" }
    ]
  },
  {
    id: 16,
    text: "Em uma reunião, você geralmente:",
    options: [
      { text: "Vai direto ao ponto", disc: "D" },
      { text: "Ouve mais do que fala", disc: "S" },
      { text: "Faz perguntas detalhadas", disc: "C" },
      { text: "Anima a conversa e conecta pessoas", disc: "I" }
    ]
  },
  {
    id: 17,
    text: "Qual seu maior medo profissional?",
    options: [
      { text: "Perder o controle da situação", disc: "D" },
      { text: "Mudanças bruscas e instabilidade", disc: "S" },
      { text: "Cometer erros ou parecer incompetente", disc: "C" },
      { text: "Ser ignorado ou rejeitado", disc: "I" }
    ]
  },
  {
    id: 18,
    text: "Como você prefere receber feedback?",
    options: [
      { text: "Direto e sem rodeios", disc: "D" },
      { text: "Com cuidado e de forma gentil", disc: "S" },
      { text: "Com dados e exemplos específicos", disc: "C" },
      { text: "Com reconhecimento do esforço", disc: "I" }
    ]
  },
  {
    id: 19,
    text: "O que mais valoriza em um líder?",
    options: [
      { text: "Decisão e resultados", disc: "D" },
      { text: "Cuidado com a equipe", disc: "S" },
      { text: "Competência e conhecimento", disc: "C" },
      { text: "Carisma e motivação", disc: "I" }
    ]
  },
  {
    id: 20,
    text: "Sob pressão, você tende a:",
    options: [
      { text: "Assumir o controle e agir", disc: "D" },
      { text: "Manter a calma e apoiar os outros", disc: "S" },
      { text: "Analisar opções com cuidado", disc: "C" },
      { text: "Buscar ajuda e motivar o time", disc: "I" }
    ]
  }
];

// Combinar todas as perguntas para o frontend
const ALL_QUESTIONS = [...ARCHETYPE_QUESTIONS, ...DISC_QUESTIONS];

// ==========================================
// DESCRIÇÕES DOS 12 ARQUÉTIPOS
// ==========================================
const ARCHETYPE_DATA: Record<string, { emoji: string; description: string }> = {
  "Inocente": {
    emoji: "🌟",
    description: "Você enxerga o mundo com otimismo e acredita genuinamente no bem. Sua pureza de intenções inspira as pessoas ao seu redor."
  },
  "Cara Comum": {
    emoji: "🤝",
    description: "Você valoriza conexões autênticas e pertencimento. As pessoas se sentem à vontade com você porque é genuíno e acessível."
  },
  "Herói": {
    emoji: "⚔️",
    description: "Você tem coragem para enfrentar desafios e determinação para vencer. Não desiste fácil e inspira outros com sua força."
  },
  "Cuidador": {
    emoji: "💝",
    description: "Você tem um coração generoso e se realiza ajudando os outros. Sua empatia e cuidado fazem diferença na vida das pessoas."
  },
  "Explorador": {
    emoji: "🧭",
    description: "Você busca liberdade e novas experiências. Sua curiosidade te leva a descobrir caminhos que outros nem imaginam."
  },
  "Rebelde": {
    emoji: "🔥",
    description: "Você questiona o status quo e não tem medo de ser diferente. Sua autenticidade abre portas para mudanças necessárias."
  },
  "Amante": {
    emoji: "❤️",
    description: "Você valoriza conexões profundas e momentos de intimidade. Sua paixão pela vida contagia quem está perto."
  },
  "Criador": {
    emoji: "🎨",
    description: "Você tem visão artística e necessidade de expressar sua originalidade. Suas criações deixam sua marca única no mundo."
  },
  "Bobo da Corte": {
    emoji: "🎭",
    description: "Você traz leveza e alegria por onde passa. Seu humor e espontaneidade tornam a vida mais divertida para todos."
  },
  "Sábio": {
    emoji: "📚",
    description: "Você busca entender o mundo em profundidade. Seu conhecimento e reflexão trazem clareza para situações complexas."
  },
  "Mago": {
    emoji: "✨",
    description: "Você acredita em transformação e faz acontecer. Sua visão de possibilidades transforma sonhos em realidade."
  },
  "Governante": {
    emoji: "👑",
    description: "Você tem presença natural e capacidade de organizar o caos. Sua liderança traz ordem e direção."
  }
};

// Insights combinados para pares de arquétipos
const COMBINED_INSIGHTS: Record<string, string> = {
  "Herói+Criador": "Sua combinação única de Herói e Criador faz de você alguém que não apenas sonha, mas transforma visão em ação. Você tem a coragem de criar coisas novas e a determinação de levá-las até o fim.",
  "Herói+Explorador": "Como Herói e Explorador, você é movido por desafios e novas fronteiras. Sua coragem te leva a conquistar territórios inexplorados e superar obstáculos que outros evitariam.",
  "Cuidador+Sábio": "Sua essência de Cuidador e Sábio te torna alguém que oferece não apenas apoio emocional, mas também orientação valiosa. As pessoas confiam em você para momentos importantes.",
  "Explorador+Bobo da Corte": "Como Explorador e Bobo da Corte, você traz alegria e aventura por onde passa. Sua energia contagiante e espírito livre inspiram outros a viverem mais intensamente.",
  "Sábio+Governante": "Sua combinação de Sábio e Governante te dá uma visão estratégica poderosa. Você consegue analisar situações com profundidade e tomar decisões que guiam outros ao sucesso.",
  "Herói+Sábio": "Como Herói e Sábio, você une coragem com sabedoria. Você enfrenta desafios com inteligência e inspira outros com sua determinação estratégica.",
  "Mago+Criador": "Sua combinação de Mago e Criador te permite transformar ideias em realidade de formas surpreendentes. Você vê possibilidades onde outros veem obstáculos.",
  "Cuidador+Amante": "Como Cuidador e Amante, você cultiva relacionamentos profundos e significativos. Sua capacidade de amar e cuidar cria laços duradouros.",
  "Governante+Herói": "Sua essência de Governante e Herói te dá uma presença de liderança inspiradora. Você lidera pelo exemplo e conquista respeito naturalmente.",
  "Rebelde+Explorador": "Como Rebelde e Explorador, você desafia convenções e busca seu próprio caminho. Sua sede de liberdade te leva a criar novas possibilidades.",
  "default": "Sua combinação única de arquétipos revela uma personalidade rica e multifacetada. Você possui qualidades que se complementam e criam um equilíbrio especial em quem você é."
};

function getCombinedInsight(primary: string, secondary: string): string {
  const key1 = `${primary}+${secondary}`;
  const key2 = `${secondary}+${primary}`;
  return COMBINED_INSIGHTS[key1] || COMBINED_INSIGHTS[key2] || COMBINED_INSIGHTS["default"];
}

// ==========================================
// FUNÇÕES DE CÁLCULO
// ==========================================
function calculateProfiles(responses: Record<string, number>) {
  const archetypeScores: Record<string, number> = {};
  const discScores = { D: 0, I: 0, S: 0, C: 0 };

  for (const [questionId, optionIndex] of Object.entries(responses)) {
    const qId = parseInt(questionId);
    
    // Perguntas 1-10: Arquétipos
    if (qId <= 10) {
      const question = ARCHETYPE_QUESTIONS.find(q => q.id === qId);
      if (question) {
        const option = question.options[optionIndex];
        if (option?.archetype) {
          archetypeScores[option.archetype] = (archetypeScores[option.archetype] || 0) + 1;
        }
      }
    }
    // Perguntas 11-20: DISC
    else if (qId <= 20) {
      const question = DISC_QUESTIONS.find(q => q.id === qId);
      if (question) {
        const option = question.options[optionIndex];
        if (option?.disc) {
          discScores[option.disc as keyof typeof discScores]++;
        }
      }
    }
  }

  // Determinar 2 arquétipos principais (das perguntas 1-10)
  const sortedArchetypes = Object.entries(archetypeScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  const primaryArchetype = sortedArchetypes[0]?.[0] || "Herói";
  const secondaryArchetype = sortedArchetypes[1]?.[0] || "Sábio";

  // Calcular perfil DISC (das perguntas 11-20)
  const maxDiscScore = Math.max(...Object.values(discScores));
  const dominantProfiles = Object.entries(discScores)
    .filter(([_, score]) => score >= maxDiscScore - 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([profile]) => profile);
  const discProfile = dominantProfiles.join("/");

  return { 
    discProfile, 
    discScores, 
    primaryArchetype,
    secondaryArchetype,
    archetypeScores
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // GET form by token or short_code
    if (req.method === "GET") {
      const code = url.searchParams.get("code") || url.searchParams.get("token");
      if (!code) {
        return new Response(
          JSON.stringify({ error: "Código obrigatório" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Try to find by short_code first (new format), then by form_token (legacy)
      let form = null;
      let error = null;

      // Try short_code first (6 chars, alphanumeric uppercase)
      const isShortCode = code.length <= 8 && /^[A-Z0-9]+$/.test(code);
      
      if (isShortCode) {
        const result = await supabase
          .from("disc_forms")
          .select("*, participants(full_name, photo_url)")
          .eq("short_code", code)
          .maybeSingle();
        form = result.data;
        error = result.error;
      }

      // Fallback to form_token if not found
      if (!form) {
        const result = await supabase
          .from("disc_forms")
          .select("*, participants(full_name, photo_url)")
          .eq("form_token", code)
          .maybeSingle();
        form = result.data;
        error = result.error;
      }

      if (error || !form) {
        console.log("Form not found for code:", code, error);
        return new Response(
          JSON.stringify({ error: "Formulário não encontrado" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (new Date(form.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: "Formulário expirado" }),
          { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if already answered
      const { data: existingResponse } = await supabase
        .from("disc_responses")
        .select("id, primary_archetype, secondary_archetype, archetype_insight")
        .eq("form_id", form.id)
        .single();

      if (existingResponse) {
        // Se já foi respondido, retornar o resultado
        const primary = existingResponse.primary_archetype || "Herói";
        const secondary = existingResponse.secondary_archetype || "Sábio";
        
        return new Response(
          JSON.stringify({ 
            already_answered: true,
            archetypes: {
              primary: {
                name: primary,
                emoji: ARCHETYPE_DATA[primary]?.emoji || "✨",
                description: ARCHETYPE_DATA[primary]?.description || ""
              },
              secondary: {
                name: secondary,
                emoji: ARCHETYPE_DATA[secondary]?.emoji || "🎭",
                description: ARCHETYPE_DATA[secondary]?.description || ""
              },
              combined_insight: existingResponse.archetype_insight || getCombinedInsight(primary, secondary)
            }
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Retornar todas as 20 perguntas para o frontend
      const questionsForFrontend = ALL_QUESTIONS.map(q => ({
        id: q.id,
        text: q.text,
        options: q.options.map(o => o.text)
      }));

      return new Response(
        JSON.stringify({ 
          form: { id: form.id, participant_name: form.participants?.full_name },
          questions: questionsForFrontend
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST submit responses OR reprocess
    if (req.method === "POST") {
      const body = await req.json();
      
      // Handle reprocess action
      if (body.action === "reprocess") {
        const { participant_id } = body;
        
        if (!participant_id) {
          return new Response(
            JSON.stringify({ error: "participant_id é obrigatório" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        console.log("Reprocessing analysis for participant:", participant_id);
        
        // Get participant with disc_form and disc_response
        const { data: participant, error: partError } = await supabase
          .from("participants")
          .select("*")
          .eq("id", participant_id)
          .single();
        
        if (partError || !participant) {
          return new Response(
            JSON.stringify({ error: "Participante não encontrado" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Get disc_form
        const { data: discForm, error: formError } = await supabase
          .from("disc_forms")
          .select("id")
          .eq("participant_id", participant_id)
          .single();
        
        if (formError || !discForm) {
          return new Response(
            JSON.stringify({ error: "Formulário DISC não encontrado" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Get disc_response
        const { data: discResponse, error: respError } = await supabase
          .from("disc_responses")
          .select("*")
          .eq("form_id", discForm.id)
          .single();
        
        if (respError || !discResponse) {
          return new Response(
            JSON.stringify({ error: "Resposta DISC não encontrada" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const discScores = discResponse.disc_scores || { D: 0, I: 0, S: 0, C: 0 };
        const discProfile = discResponse.disc_profile || "D";
        const primaryArchetype = discResponse.primary_archetype || "Herói";
        const secondaryArchetype = discResponse.secondary_archetype || "Sábio";
        const open_answers = discResponse.open_answers;
        
        // Call AI for DISC analysis
        const aiPrompt = `Você é um especialista em perfil comportamental DISC, arquétipos e vendas consultivas.

O participante "${participant.full_name}" respondeu um formulário completo de autoconhecimento.

=== PERFIL DISC (das 10 perguntas situacionais) ===
Perfil predominante: ${discProfile}
Pontuação detalhada:
- Dominância (D): ${discScores.D}/10 (${discScores.D * 10}%)
- Influência (I): ${discScores.I}/10 (${discScores.I * 10}%)
- Estabilidade (S): ${discScores.S}/10 (${discScores.S * 10}%)
- Conformidade (C): ${discScores.C}/10 (${discScores.C * 10}%)

=== ARQUÉTIPOS IDENTIFICADOS ===
- Arquétipo principal: ${primaryArchetype}
- Arquétipo secundário: ${secondaryArchetype}

=== DADOS DO PARTICIPANTE ===
- Faturamento: ${participant.faturamento || "Não informado"}
- Lucro líquido: ${participant.lucro_liquido || "Não informado"}
- Nicho de atuação: ${participant.nicho || "Não informado"}
- Objetivo no evento: ${participant.objetivo_evento || "Não informado"}
- Maior dificuldade atual: ${participant.maior_dificuldade || "Não informado"}

=== RESPOSTAS ABERTAS DO FORMULÁRIO ===
- Maior desafio declarado: ${open_answers?.biggest_challenge || "Não informado"}
- Mudança mais desejada: ${open_answers?.desired_change || "Não informado"}

Com base em TODOS esses dados, forneça uma análise profunda e personalizada em formato JSON:

{
  "disc_description": "Descrição comportamental detalhada combinando o perfil DISC com os arquétipos. Explique como essa pessoa pensa, decide e se comporta em situações de compra. 2-3 parágrafos bem elaborados.",
  
  "disc_label": "Um rótulo descritivo do perfil combinado (ex: 'Líder Visionário', 'Comunicador Estratégico', 'Analítico Cuidadoso', 'Executor Determinado')",
  
  "approach_tip": "Uma dica específica e prática de como abordar esta pessoa na venda. Seja direto e acionável (1-2 frases).",
  
  "alerts": ["Alerta 1 sobre o que evitar", "Alerta 2 sobre comportamento", "Alerta 3 sobre armadilhas comuns"],
  
  "sales_insights": "Insights específicos para vender para esta pessoa, considerando seu perfil DISC, arquétipos, nicho e desafios declarados. Liste 4-5 pontos estratégicos formatados com bullet points.",
  
  "objecoes": "Principais objeções de compra previstas para ESTE perfil específico, considerando os desafios que declarou. Liste 4-5 objeções prováveis.",
  
  "contorno_objecoes": "Como contornar cada objeção listada, com scripts específicos para o perfil DISC desta pessoa. Seja prático e direto.",
  
  "exemplos_fechamento": "3-4 exemplos de frases/abordagens de fechamento personalizadas para este perfil. Inclua gatilhos mentais adequados ao perfil."
}

IMPORTANTE: 
- Personalize TUDO com base nos dados fornecidos
- Use o nicho e desafios declarados para tornar a análise relevante
- Considere a combinação DISC + Arquétipo para insights únicos
- Responda APENAS com o JSON, sem texto adicional`;

        let aiAnalysis = {
          disc_description: "",
          sales_insights: "",
          objecoes: "",
          contorno_objecoes: "",
          exemplos_fechamento: "",
          approach_tip: "",
          alerts: [] as string[],
          disc_label: "",
        };

        try {
          console.log("Calling AI for reprocessing...");
          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: "Você é um especialista em DISC e vendas. Responda sempre em português brasileiro." },
                { role: "user", content: aiPrompt }
              ],
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const content = aiData.choices?.[0]?.message?.content || "";
            console.log("AI response received, parsing...");
            
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              aiAnalysis = {
                disc_description: parsed.disc_description || "",
                sales_insights: typeof parsed.sales_insights === "string" ? parsed.sales_insights : JSON.stringify(parsed.sales_insights),
                objecoes: typeof parsed.objecoes === "string" ? parsed.objecoes : JSON.stringify(parsed.objecoes),
                contorno_objecoes: typeof parsed.contorno_objecoes === "string" ? parsed.contorno_objecoes : JSON.stringify(parsed.contorno_objecoes),
                exemplos_fechamento: typeof parsed.exemplos_fechamento === "string" ? parsed.exemplos_fechamento : JSON.stringify(parsed.exemplos_fechamento),
                approach_tip: parsed.approach_tip || "",
                alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
                disc_label: parsed.disc_label || "",
              };
              console.log("AI analysis parsed successfully");
            }
          } else {
            console.error("AI response not ok:", await aiResponse.text());
          }
        } catch (aiError) {
          console.error("AI analysis error:", aiError);
        }

        // Update disc_response with new AI analysis
        const { error: updateError } = await supabase
          .from("disc_responses")
          .update({
            disc_description: aiAnalysis.disc_description,
            sales_insights: aiAnalysis.sales_insights,
            objecoes: aiAnalysis.objecoes,
            contorno_objecoes: aiAnalysis.contorno_objecoes,
            exemplos_fechamento: aiAnalysis.exemplos_fechamento,
            approach_tip: aiAnalysis.approach_tip,
            alerts: aiAnalysis.alerts,
            disc_label: aiAnalysis.disc_label,
            analyzed_at: new Date().toISOString(),
          })
          .eq("id", discResponse.id);

        if (updateError) {
          console.error("Update error:", updateError);
          return new Response(
            JSON.stringify({ error: "Erro ao atualizar análise" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("Reprocessing completed successfully");
        return new Response(
          JSON.stringify({ success: true, message: "Análise reprocessada com sucesso" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Original form submission logic
      const { token, responses, open_answers } = body;
      const code = token; // Can be either short_code or form_token

      console.log("Received submission:", { code, responses: Object.keys(responses || {}).length, open_answers });

      if (!code || !responses) {
        return new Response(
          JSON.stringify({ error: "Código e respostas são obrigatórios" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Try to find by short_code first, then by form_token
      let form = null;
      let formError = null;

      const isShortCode = code.length <= 8 && /^[A-Z0-9]+$/.test(code);
      
      if (isShortCode) {
        const result = await supabase
          .from("disc_forms")
          .select("*, participants(*)")
          .eq("short_code", code)
          .maybeSingle();
        form = result.data;
        formError = result.error;
      }

      if (!form) {
        const result = await supabase
          .from("disc_forms")
          .select("*, participants(*)")
          .eq("form_token", code)
          .maybeSingle();
        form = result.data;
        formError = result.error;
      }

      if (formError || !form) {
        console.log("Form not found:", formError);
        return new Response(
          JSON.stringify({ error: "Formulário não encontrado" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if already answered
      const { data: existingResponse } = await supabase
        .from("disc_responses")
        .select("id")
        .eq("form_id", form.id)
        .single();

      if (existingResponse) {
        return new Response(
          JSON.stringify({ error: "Formulário já foi respondido" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Calculate Archetypes (from questions 1-10) and DISC (from questions 11-20)
      const { discProfile, discScores, primaryArchetype, secondaryArchetype } = calculateProfiles(responses);
      const combinedInsight = getCombinedInsight(primaryArchetype, secondaryArchetype);

      const participant = form.participants;

      // Call AI for DISC analysis (oculto para closers)
      const aiPrompt = `Você é um especialista em perfil comportamental DISC, arquétipos e vendas consultivas.

O participante "${participant.full_name}" respondeu um formulário completo de autoconhecimento.

=== PERFIL DISC (das 10 perguntas situacionais) ===
Perfil predominante: ${discProfile}
Pontuação detalhada:
- Dominância (D): ${discScores.D}/10 (${discScores.D * 10}%)
- Influência (I): ${discScores.I}/10 (${discScores.I * 10}%)
- Estabilidade (S): ${discScores.S}/10 (${discScores.S * 10}%)
- Conformidade (C): ${discScores.C}/10 (${discScores.C * 10}%)

=== ARQUÉTIPOS IDENTIFICADOS ===
- Arquétipo principal: ${primaryArchetype}
- Arquétipo secundário: ${secondaryArchetype}
Esta combinação revela uma personalidade que busca ${primaryArchetype === "Herói" ? "desafios e conquistas" : primaryArchetype === "Sábio" ? "conhecimento e verdade" : primaryArchetype === "Cuidador" ? "ajudar e proteger" : primaryArchetype === "Criador" ? "originalidade e expressão" : primaryArchetype === "Governante" ? "controle e liderança" : primaryArchetype === "Explorador" ? "liberdade e descoberta" : primaryArchetype === "Mago" ? "transformação e possibilidades" : primaryArchetype === "Amante" ? "conexão e intimidade" : primaryArchetype === "Rebelde" ? "mudança e autenticidade" : primaryArchetype === "Bobo da Corte" ? "diversão e leveza" : primaryArchetype === "Cara Comum" ? "pertencimento e autenticidade" : "equilíbrio"}.

=== DADOS DO PARTICIPANTE ===
- Faturamento: ${participant.faturamento || "Não informado"}
- Lucro líquido: ${participant.lucro_liquido || "Não informado"}
- Nicho de atuação: ${participant.nicho || "Não informado"}
- Objetivo no evento: ${participant.objetivo_evento || "Não informado"}
- Maior dificuldade atual: ${participant.maior_dificuldade || "Não informado"}

=== RESPOSTAS ABERTAS DO FORMULÁRIO ===
- Maior desafio declarado: ${open_answers?.biggest_challenge || "Não informado"}
- Mudança mais desejada: ${open_answers?.desired_change || "Não informado"}

Com base em TODOS esses dados, forneça uma análise profunda e personalizada em formato JSON:

{
  "disc_description": "Descrição comportamental detalhada combinando o perfil DISC com os arquétipos. Explique como essa pessoa pensa, decide e se comporta em situações de compra. 2-3 parágrafos bem elaborados.",
  
  "disc_label": "Um rótulo descritivo do perfil combinado (ex: 'Líder Visionário', 'Comunicador Estratégico', 'Analítico Cuidadoso', 'Executor Determinado')",
  
  "approach_tip": "Uma dica específica e prática de como abordar esta pessoa na venda. Seja direto e acionável (1-2 frases).",
  
  "alerts": ["Alerta 1 sobre o que evitar", "Alerta 2 sobre comportamento", "Alerta 3 sobre armadilhas comuns"],
  
  "sales_insights": "Insights específicos para vender para esta pessoa, considerando seu perfil DISC, arquétipos, nicho e desafios declarados. Liste 4-5 pontos estratégicos formatados com bullet points.",
  
  "objecoes": "Principais objeções de compra previstas para ESTE perfil específico, considerando os desafios que declarou. Liste 4-5 objeções prováveis.",
  
  "contorno_objecoes": "Como contornar cada objeção listada, com scripts específicos para o perfil DISC desta pessoa. Seja prático e direto.",
  
  "exemplos_fechamento": "3-4 exemplos de frases/abordagens de fechamento personalizadas para este perfil. Inclua gatilhos mentais adequados ao perfil."
}

IMPORTANTE: 
- Personalize TUDO com base nos dados fornecidos
- Use o nicho e desafios declarados para tornar a análise relevante
- Considere a combinação DISC + Arquétipo para insights únicos
- Responda APENAS com o JSON, sem texto adicional`;

      let aiAnalysis = {
        disc_description: "",
        sales_insights: "",
        objecoes: "",
        contorno_objecoes: "",
        exemplos_fechamento: "",
        approach_tip: "",
        alerts: [] as string[],
        disc_label: "",
      };

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "Você é um especialista em DISC e vendas. Responda sempre em português brasileiro." },
              { role: "user", content: aiPrompt }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            aiAnalysis = {
              disc_description: parsed.disc_description || "",
              sales_insights: typeof parsed.sales_insights === "string" ? parsed.sales_insights : JSON.stringify(parsed.sales_insights),
              objecoes: typeof parsed.objecoes === "string" ? parsed.objecoes : JSON.stringify(parsed.objecoes),
              contorno_objecoes: typeof parsed.contorno_objecoes === "string" ? parsed.contorno_objecoes : JSON.stringify(parsed.contorno_objecoes),
              exemplos_fechamento: typeof parsed.exemplos_fechamento === "string" ? parsed.exemplos_fechamento : JSON.stringify(parsed.exemplos_fechamento),
              approach_tip: parsed.approach_tip || "",
              alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
              disc_label: parsed.disc_label || "",
            };
          }
        }
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
      }

      // Save response with all data including new fields
      const { error: saveError } = await supabase
        .from("disc_responses")
        .insert({
          form_id: form.id,
          responses,
          disc_profile: discProfile,
          primary_archetype: primaryArchetype,
          secondary_archetype: secondaryArchetype,
          archetype_insight: combinedInsight,
          open_answers: open_answers || null,
          disc_description: aiAnalysis.disc_description,
          sales_insights: aiAnalysis.sales_insights,
          objecoes: aiAnalysis.objecoes,
          contorno_objecoes: aiAnalysis.contorno_objecoes,
          exemplos_fechamento: aiAnalysis.exemplos_fechamento,
          approach_tip: aiAnalysis.approach_tip,
          alerts: aiAnalysis.alerts,
          disc_label: aiAnalysis.disc_label,
          disc_scores: discScores,
          analyzed_at: new Date().toISOString(),
        });

      if (saveError) {
        console.error("Save error:", saveError);
        return new Response(
          JSON.stringify({ error: "Erro ao salvar respostas" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Retornar APENAS arquétipos para o participante (DISC fica oculto)
      return new Response(
        JSON.stringify({ 
          success: true,
          archetypes: {
            primary: {
              name: primaryArchetype,
              emoji: ARCHETYPE_DATA[primaryArchetype]?.emoji || "✨",
              description: ARCHETYPE_DATA[primaryArchetype]?.description || ""
            },
            secondary: {
              name: secondaryArchetype,
              emoji: ARCHETYPE_DATA[secondaryArchetype]?.emoji || "🎭",
              description: ARCHETYPE_DATA[secondaryArchetype]?.description || ""
            },
            combined_insight: combinedInsight
          }
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Método não permitido" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("DISC form error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
