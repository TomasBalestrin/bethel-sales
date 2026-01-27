import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DISC_QUESTIONS = [
  { id: 1, text: "Quando enfrento um desafio, eu prefiro:", options: ["Agir rapidamente e assumir o controle", "Conversar com outros e buscar apoio", "Analisar cuidadosamente antes de agir", "Seguir um plano estabelecido"] },
  { id: 2, text: "Em reuniões, eu geralmente:", options: ["Lidero a discussão e tomo decisões", "Animo o grupo e trago energia", "Ouço mais do que falo", "Faço perguntas detalhadas"] },
  { id: 3, text: "Quando tenho um prazo apertado:", options: ["Fico focado e pressiono para resultados", "Mantenho o otimismo e motivo a equipe", "Trabalho de forma constante e organizada", "Verifico todos os detalhes antes de entregar"] },
  { id: 4, text: "Meus colegas me descreveriam como:", options: ["Determinado e direto", "Entusiasta e comunicativo", "Calmo e confiável", "Preciso e analítico"] },
  { id: 5, text: "Ao tomar decisões importantes:", options: ["Decido rapidamente com base na intuição", "Consulto pessoas de confiança", "Penso no impacto a longo prazo", "Analiso todos os dados disponíveis"] },
  { id: 6, text: "Em situações de conflito:", options: ["Enfrento diretamente o problema", "Tento mediar e manter a harmonia", "Evito confrontos e busco estabilidade", "Busco fatos para resolver logicamente"] },
  { id: 7, text: "O que mais me motiva é:", options: ["Conquistar resultados e vencer", "Reconhecimento e interação social", "Ambiente estável e harmonioso", "Qualidade e excelência no trabalho"] },
  { id: 8, text: "Quando aprendo algo novo:", options: ["Quero aplicar imediatamente", "Prefiro discutir com outros", "Gosto de praticar no meu ritmo", "Preciso entender todos os detalhes"] },
  { id: 9, text: "Meu maior medo profissional é:", options: ["Perder o controle da situação", "Ser ignorado ou rejeitado", "Mudanças bruscas e instabilidade", "Cometer erros ou ser criticado"] },
  { id: 10, text: "Em um projeto em equipe:", options: ["Assumo a liderança naturalmente", "Mantenho todos motivados e conectados", "Apoio o time e garanto a continuidade", "Cuido da qualidade e dos processos"] },
  { id: 11, text: "Quando recebo feedback negativo:", options: ["Respondo defendendo minha posição", "Fico afetado emocionalmente", "Aceito e processo internamente", "Peço exemplos específicos para entender"] },
  { id: 12, text: "Minha abordagem para metas é:", options: ["Ambiciosa e focada em resultados rápidos", "Flexível e adaptável às circunstâncias", "Consistente e de longo prazo", "Detalhada com métricas claras"] },
  { id: 13, text: "Em uma negociação:", options: ["Vou direto ao ponto e busco fechar", "Construo relacionamento antes de negociar", "Busco um acordo que satisfaça todos", "Analiso todas as condições antes de decidir"] },
  { id: 14, text: "O que mais me irrita é:", options: ["Lentidão e falta de ação", "Frieza e falta de entusiasmo", "Conflitos e pressão excessiva", "Desorganização e falta de lógica"] },
  { id: 15, text: "Meu estilo de comunicação é:", options: ["Direto e objetivo", "Expressivo e persuasivo", "Paciente e acolhedor", "Preciso e fundamentado"] }
];

const DISC_MAPPING = {
  0: "D", // Dominância
  1: "I", // Influência
  2: "S", // Estabilidade
  3: "C", // Conformidade
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // GET questions
    if (req.method === "GET" && path === "questions") {
      return new Response(
        JSON.stringify({ questions: DISC_QUESTIONS }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
        .select("id")
        .eq("form_id", form.id)
        .single();

      if (existingResponse) {
        return new Response(
          JSON.stringify({ error: "Formulário já foi respondido" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          form: { id: form.id, participant_name: form.participants?.full_name },
          questions: DISC_QUESTIONS 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST submit responses
    if (req.method === "POST") {
      const { form_id, token, responses } = await req.json();

      // Verify form
      const { data: form, error: formError } = await supabase
        .from("disc_forms")
        .select("*, participants(*)")
        .eq(token ? "form_token" : "id", token || form_id)
        .single();

      if (formError || !form) {
        return new Response(
          JSON.stringify({ error: "Formulário não encontrado" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Calculate DISC profile
      const scores = { D: 0, I: 0, S: 0, C: 0 };
      for (const [questionId, answerIndex] of Object.entries(responses)) {
        const profile = DISC_MAPPING[answerIndex as unknown as keyof typeof DISC_MAPPING];
        if (profile) scores[profile as keyof typeof scores]++;
      }

      const maxScore = Math.max(...Object.values(scores));
      const dominantProfiles = Object.entries(scores)
        .filter(([_, score]) => score === maxScore)
        .map(([profile]) => profile);
      
      const discProfile = dominantProfiles.join("/");

      // Get participant data for AI analysis
      const participant = form.participants;

      // Call AI for analysis
      const aiPrompt = `Você é um especialista em perfil comportamental DISC e vendas.

O participante "${participant.full_name}" respondeu um formulário DISC e seu perfil predominante é: ${discProfile}

Pontuação DISC:
- Dominância (D): ${scores.D}/15
- Influência (I): ${scores.I}/15
- Estabilidade (S): ${scores.S}/15
- Conformidade (C): ${scores.C}/15

Dados adicionais do participante:
- Faturamento: ${participant.faturamento ? `R$ ${participant.faturamento}` : "Não informado"}
- Nicho: ${participant.nicho || "Não informado"}

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
          
          // Parse JSON from response
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

      // Save response
      const { data: savedResponse, error: saveError } = await supabase
        .from("disc_responses")
        .insert({
          form_id: form.id,
          responses,
          disc_profile: discProfile,
          ...aiAnalysis,
          analyzed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (saveError) {
        console.error("Save error:", saveError);
        return new Response(
          JSON.stringify({ error: "Erro ao salvar respostas" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          disc_profile: discProfile,
          scores,
          analysis: aiAnalysis
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Método não permitido" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("DISC error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
