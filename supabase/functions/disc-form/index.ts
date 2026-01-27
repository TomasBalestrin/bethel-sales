import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// ==========================================
// PERGUNTAS SITUACIONAIS COM MAPEAMENTO DUPLO
// ==========================================
const ARCHETYPE_QUESTIONS = [
  {
    id: 1,
    text: "É sábado à noite. O que você prefere fazer?",
    options: [
      { text: "Organizar um jantar na minha casa e receber os amigos", disc: "I", archetype: "Cuidador" },
      { text: "Ir a um lugar novo que nunca explorei", disc: "D", archetype: "Explorador" },
      { text: "Maratonar uma série ou ler um bom livro", disc: "S", archetype: "Sábio" },
      { text: "Sair para uma festa ou evento animado", disc: "I", archetype: "Bobo da Corte" }
    ]
  },
  {
    id: 2,
    text: "Você ganhou R$50 mil inesperados. Qual seu primeiro pensamento?",
    options: [
      { text: "Vou investir e fazer esse dinheiro crescer", disc: "C", archetype: "Governante" },
      { text: "Vou realizar aquele sonho que sempre adiei", disc: "D", archetype: "Herói" },
      { text: "Vou ajudar pessoas que precisam", disc: "S", archetype: "Cuidador" },
      { text: "Vou viajar e viver experiências incríveis", disc: "I", archetype: "Explorador" }
    ]
  },
  {
    id: 3,
    text: "Em um grupo de amigos, você geralmente é...",
    options: [
      { text: "Quem faz todo mundo rir", disc: "I", archetype: "Bobo da Corte" },
      { text: "Quem as pessoas procuram para desabafar", disc: "S", archetype: "Cuidador" },
      { text: "Quem tem as ideias mais criativas", disc: "D", archetype: "Criador" },
      { text: "Quem pesquisa e traz informações úteis", disc: "C", archetype: "Sábio" }
    ]
  },
  {
    id: 4,
    text: "O que mais te incomoda nas pessoas?",
    options: [
      { text: "Quando são falsas ou desonestas", disc: "C", archetype: "Sábio" },
      { text: "Quando são negativas e reclamam de tudo", disc: "I", archetype: "Inocente" },
      { text: "Quando são lentas e enrolam demais", disc: "D", archetype: "Herói" },
      { text: "Quando são frias e não se importam com os outros", disc: "S", archetype: "Amante" }
    ]
  },
  {
    id: 5,
    text: "Se você fosse um personagem de filme, seria...",
    options: [
      { text: "O mentor sábio que guia o herói", disc: "C", archetype: "Sábio" },
      { text: "O herói corajoso que salva o dia", disc: "D", archetype: "Herói" },
      { text: "O artista incompreendido com visão única", disc: "D", archetype: "Criador" },
      { text: "O amigo leal que está sempre presente", disc: "S", archetype: "Cara Comum" }
    ]
  },
  {
    id: 6,
    text: "Quando você quer algo, você...",
    options: [
      { text: "Vai atrás até conseguir, custe o que custar", disc: "D", archetype: "Herói" },
      { text: "Planeja com calma cada passo", disc: "C", archetype: "Governante" },
      { text: "Espera o momento certo aparecer", disc: "S", archetype: "Inocente" },
      { text: "Conversa com pessoas para conseguir apoio", disc: "I", archetype: "Amante" }
    ]
  },
  {
    id: 7,
    text: "O que te dá mais satisfação?",
    options: [
      { text: "Criar algo do zero e ver funcionando", disc: "D", archetype: "Criador" },
      { text: "Ajudar alguém a superar um problema", disc: "S", archetype: "Cuidador" },
      { text: "Aprender algo novo e profundo", disc: "C", archetype: "Sábio" },
      { text: "Viver momentos intensos e memoráveis", disc: "I", archetype: "Explorador" }
    ]
  },
  {
    id: 8,
    text: "Como você lida quando algo dá errado?",
    options: [
      { text: "Fico bravo mas logo busco a solução", disc: "D", archetype: null },
      { text: "Analiso o que aconteceu para não repetir", disc: "C", archetype: null },
      { text: "Fico chateado mas aceito e sigo em frente", disc: "S", archetype: null },
      { text: "Desabafo com alguém e me recomponho", disc: "I", archetype: null }
    ]
  },
  {
    id: 9,
    text: "O que as pessoas mais admiram em você?",
    options: [
      { text: "Minha energia e entusiasmo", disc: "I", archetype: "Bobo da Corte" },
      { text: "Minha determinação e força", disc: "D", archetype: "Herói" },
      { text: "Minha calma e paciência", disc: "S", archetype: "Cuidador" },
      { text: "Minha inteligência e conhecimento", disc: "C", archetype: "Sábio" }
    ]
  },
  {
    id: 10,
    text: "Se pudesse escolher um superpoder, seria...",
    options: [
      { text: "Ler mentes para entender as pessoas", disc: "I", archetype: "Amante" },
      { text: "Força sobre-humana para proteger quem amo", disc: "D", archetype: "Herói" },
      { text: "Curar pessoas com o toque", disc: "S", archetype: "Cuidador" },
      { text: "Conhecimento infinito sobre tudo", disc: "C", archetype: "Sábio" }
    ]
  },
  {
    id: 11,
    text: "Em uma discussão, você tende a...",
    options: [
      { text: "Defender seu ponto com firmeza", disc: "D", archetype: null },
      { text: "Tentar entender o lado do outro", disc: "S", archetype: null },
      { text: "Usar argumentos lógicos e dados", disc: "C", archetype: null },
      { text: "Usar humor para desarmar a tensão", disc: "I", archetype: null }
    ]
  },
  {
    id: 12,
    text: "O que você mais valoriza na vida?",
    options: [
      { text: "Liberdade para fazer o que quiser", disc: "D", archetype: "Rebelde" },
      { text: "Conexões verdadeiras com pessoas", disc: "I", archetype: "Amante" },
      { text: "Paz e tranquilidade", disc: "S", archetype: "Inocente" },
      { text: "Conhecimento e sabedoria", disc: "C", archetype: "Sábio" }
    ]
  }
];

// ==========================================
// DESCRIÇÕES DOS 12 ARQUÉTIPOS
// ==========================================
const ARCHETYPE_DATA: Record<string, { emoji: string; description: string }> = {
  "Inocente": {
    emoji: "✨",
    description: "Você enxerga o mundo com otimismo e acredita genuinamente no bem. Sua pureza de intenções inspira as pessoas ao seu redor."
  },
  "Cara Comum": {
    emoji: "🤝",
    description: "Você valoriza conexões autênticas e pertencimento. As pessoas se sentem à vontade com você porque é genuíno e acessível."
  },
  "Herói": {
    emoji: "🏆",
    description: "Você tem coragem para enfrentar desafios e determinação para vencer. Não desiste fácil e inspira outros com sua força."
  },
  "Cuidador": {
    emoji: "❤️",
    description: "Você tem um coração generoso e se realiza ajudando os outros. Sua empatia e cuidado fazem diferença na vida das pessoas."
  },
  "Explorador": {
    emoji: "🧭",
    description: "Você busca liberdade e novas experiências. Sua curiosidade te leva a descobrir caminhos que outros nem imaginam."
  },
  "Rebelde": {
    emoji: "⚡",
    description: "Você questiona o status quo e não tem medo de ser diferente. Sua autenticidade abre portas para mudanças necessárias."
  },
  "Amante": {
    emoji: "🔥",
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
    emoji: "🔮",
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
  const discScores = { D: 0, I: 0, S: 0, C: 0 };
  const archetypeScores: Record<string, number> = {};

  for (const [questionId, optionIndex] of Object.entries(responses)) {
    const question = ARCHETYPE_QUESTIONS.find(q => q.id === parseInt(questionId));
    if (!question) continue;

    const option = question.options[optionIndex];
    if (!option) continue;

    // Pontuar DISC
    discScores[option.disc as keyof typeof discScores]++;

    // Pontuar Arquétipo (se existir)
    if (option.archetype) {
      archetypeScores[option.archetype] = (archetypeScores[option.archetype] || 0) + 1;
    }
  }

  // Calcular perfil DISC
  const maxDiscScore = Math.max(...Object.values(discScores));
  const dominantProfiles = Object.entries(discScores)
    .filter(([_, score]) => score >= maxDiscScore - 1) // Incluir perfis próximos
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([profile]) => profile);
  const discProfile = dominantProfiles.join("/");

  // Determinar 2 arquétipos principais
  const sortedArchetypes = Object.entries(archetypeScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  const primaryArchetype = sortedArchetypes[0]?.[0] || "Herói";
  const secondaryArchetype = sortedArchetypes[1]?.[0] || "Sábio";

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

    // GET form by token
    if (req.method === "GET") {
      const token = url.searchParams.get("token");
      if (!token) {
        return new Response(
          JSON.stringify({ error: "Token obrigatório" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: form, error } = await supabase
        .from("disc_forms")
        .select("*, participants(full_name, photo_url)")
        .eq("form_token", token)
        .single();

      if (error || !form) {
        console.log("Form not found for token:", token, error);
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

      // Retornar perguntas para formulário novo
      const questionsForFrontend = ARCHETYPE_QUESTIONS.map(q => ({
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

    // POST submit responses
    if (req.method === "POST") {
      const { token, responses, open_answers } = await req.json();

      console.log("Received submission:", { token, responses: Object.keys(responses || {}).length, open_answers });

      if (!token || !responses) {
        return new Response(
          JSON.stringify({ error: "Token e respostas são obrigatórios" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify form
      const { data: form, error: formError } = await supabase
        .from("disc_forms")
        .select("*, participants(*)")
        .eq("form_token", token)
        .single();

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

      // Calculate DISC + Archetypes
      const { discProfile, discScores, primaryArchetype, secondaryArchetype } = calculateProfiles(responses);
      const combinedInsight = getCombinedInsight(primaryArchetype, secondaryArchetype);

      const participant = form.participants;

      // Call AI for DISC analysis (oculto para closers)
      const aiPrompt = `Você é um especialista em perfil comportamental DISC e vendas.

O participante "${participant.full_name}" respondeu um formulário e seu perfil DISC predominante é: ${discProfile}

Pontuação DISC:
- Dominância (D): ${discScores.D}/12
- Influência (I): ${discScores.I}/12
- Estabilidade (S): ${discScores.S}/12
- Conformidade (C): ${discScores.C}/12

Arquétipos identificados: ${primaryArchetype} (principal) e ${secondaryArchetype} (secundário)

Dados adicionais do participante:
- Faturamento: ${participant.faturamento ? `R$ ${participant.faturamento}` : "Não informado"}
- Nicho: ${participant.nicho || "Não informado"}
- Maior desafio: ${open_answers?.biggest_challenge || "Não informado"}
- Mudança desejada: ${open_answers?.desired_change || "Não informado"}

Por favor, forneça uma análise completa em formato JSON com os seguintes campos:
1. "disc_description": Descrição comportamental do perfil (2-3 parágrafos)
2. "sales_insights": Insights específicos para vender para esta pessoa (3-4 pontos)
3. "objecoes": Principais objeções de compra previstas (3-4 objeções)
4. "contorno_objecoes": Como contornar cada objeção listada
5. "exemplos_fechamento": 2-3 exemplos práticos de frases/abordagens para fechar a venda

Responda APENAS com o JSON, sem texto adicional.`;

      let aiAnalysis = {
        disc_description: "",
        sales_insights: "",
        objecoes: "",
        contorno_objecoes: "",
        exemplos_fechamento: ""
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
            };
          }
        }
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
      }

      // Save response with all data
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
          ...aiAnalysis,
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
