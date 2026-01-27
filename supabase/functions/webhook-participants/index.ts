import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret, x-supabase-client-platform",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Helper to convert string to boolean
function parseBoolean(value: any): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return ["true", "sim", "1"].includes(value.toLowerCase());
  }
  return false;
}

// Determine participant color based on faturamento (revenue) range
function getColorFromFaturamento(faturamento: string | null): string | null {
  if (!faturamento) return null;
  
  const lower = faturamento.toLowerCase();
  
  // Até R$ 5.000,00 = Rosa
  if (lower.includes("até r$ 5.000") || lower.includes("ate r$ 5.000")) {
    return "rosa";
  }
  // R$ 5.000,00 até 10.000,00 = Preto
  if (lower.includes("5.000,00 até 10.000") || lower.includes("5.000,00 ate 10.000") ||
      lower.includes("r$ 5.000,00 até r$ 10.000") || lower.includes("r$ 5.000,00 ate r$ 10.000")) {
    return "preto";
  }
  // R$ 10.000,00 até 20.000,00 = Azul Claro
  if (lower.includes("10.000,00 até 20.000") || lower.includes("10.000,00 ate 20.000") ||
      lower.includes("r$ 10.000,00 até r$ 20.000") || lower.includes("r$ 10.000,00 ate r$ 20.000")) {
    return "azul_claro";
  }
  // R$ 20.000,00 até 50.000,00 = Verde
  if (lower.includes("20.000,00 até 50.000") || lower.includes("20.000,00 ate 50.000") ||
      lower.includes("r$ 20.000,00 até r$ 50.000") || lower.includes("r$ 20.000,00 ate r$ 50.000")) {
    return "verde";
  }
  // R$ 50.000,00 até 100.000,00 = Dourado
  if (lower.includes("50.000,00 até 100.000") || lower.includes("50.000,00 ate 100.000") ||
      lower.includes("r$ 50.000,00 até r$ 100.000") || lower.includes("r$ 50.000,00 ate r$ 100.000")) {
    return "dourado";
  }
  // R$ 100.000,00+ = Laranja (todas as faixas acima)
  if (lower.includes("100.000,00 até") || lower.includes("100.000,00 ate") ||
      lower.includes("250.000,00 até") || lower.includes("250.000,00 ate") ||
      lower.includes("acima de") || lower.includes("r$ 100.000") ||
      lower.includes("r$ 250.000") || lower.includes("r$ 500.000")) {
    return "laranja";
  }
  
  return null;
}

// Helper to find field by partial key match
function findFieldByPartialKey(fields: Record<string, any>, partial: string): string | null {
  const key = Object.keys(fields).find((k) =>
    k.toLowerCase().includes(partial.toLowerCase())
  );
  return key ? fields[key] : null;
}

// Check if payload has the new nested fields structure
function hasFieldsStructure(participant: any): boolean {
  return participant.fields && typeof participant.fields === "object";
}

// Extract data from new format (fields structure)
function extractFromFields(participant: any) {
  const fields = participant.fields || {};

  return {
    full_name: fields.nome_completo || null,
    email: fields.digite_seu_melhor_email || null,
    phone: fields.digite_seu_whatsapp || null,
    instagram: fields.qual_seu_do_instagram || null,
    cpf_cnpj: fields.digite_o_seu_cpf_ou_cnpj || null,
    nome_cracha: fields.nome_para_cracha || null,
    tem_socio: parseBoolean(fields.voce_tem_socio),
    nicho: fields.qual_sua_area_de_atuacao_profissional || null,
    faturamento: fields.quanto_voce_fatura_por_mes || null,
    lucro_liquido: fields.qual_seu_lucro_liquido_mensal || null,
    objetivo_evento: findFieldByPartialKey(fields, "pretende_aprender"),
    maior_dificuldade: findFieldByPartialKey(fields, "maior_dificuldade"),
    photo_url: findFieldByPartialKey(fields, "foto_de_perfil"),
    aceitou_termo_imagem: parseBoolean(
      fields.termo_de_uso_de_imagem_e_responsabilidade
    ),
    // Root-level metadata
    external_id: participant.participant_id || null,
    form_name: participant.form_name || null,
    event_name: participant.event_name || null,
    registration_status: participant.status || null,
  };
}

// Extract data from legacy format (fields at root level)
function extractFromRoot(participant: any) {
  const {
    full_name,
    nome,
    name,
    email,
    phone,
    telefone,
    photo_url,
    foto,
    faturamento,
    revenue,
    nicho,
    niche,
    instagram,
    credenciou_dia1,
    credenciou_dia2,
    credenciou_dia3,
    dia1,
    dia2,
    dia3,
  } = participant;

  const participantName = full_name || nome || name;

  return {
    full_name: participantName,
    email: email || null,
    phone: phone || telefone || null,
    photo_url: photo_url || foto || null,
    faturamento: faturamento || revenue || null,
    nicho: nicho || niche || null,
    instagram: instagram || null,
    credenciou_dia1: credenciou_dia1 ?? dia1 ?? false,
    credenciou_dia2: credenciou_dia2 ?? dia2 ?? false,
    credenciou_dia3: credenciou_dia3 ?? dia3 ?? false,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    // Handle both single participant and array
    const participants = Array.isArray(body) ? body : [body];

    const results = [];

    for (const participant of participants) {
      let participantData: Record<string, any>;

      // Detect format and extract accordingly
      if (hasFieldsStructure(participant)) {
        console.log("Detected new format with fields structure");
        const extracted = extractFromFields(participant);

        if (!extracted.full_name) {
          results.push({ error: "Nome é obrigatório", data: participant });
          continue;
        }

        participantData = {
          ...extracted,
          cor: getColorFromFaturamento(extracted.faturamento),
          webhook_data: participant,
        };
      } else {
        console.log("Detected legacy format with root-level fields");
        const extracted = extractFromRoot(participant);

        if (!extracted.full_name) {
          results.push({ error: "Nome é obrigatório", data: participant });
          continue;
        }

        participantData = {
          ...extracted,
          cor: getColorFromFaturamento(extracted.faturamento),
          webhook_data: participant,
        };
      }

      // Try to find existing participant by email OR external_id
      let existingId: string | null = null;

      if (participantData.email) {
        const { data: existingByEmail } = await supabase
          .from("participants")
          .select("id")
          .eq("email", participantData.email)
          .single();

        if (existingByEmail) {
          existingId = existingByEmail.id;
        }
      }

      if (!existingId && participantData.external_id) {
        const { data: existingByExternalId } = await supabase
          .from("participants")
          .select("id")
          .eq("external_id", participantData.external_id)
          .single();

        if (existingByExternalId) {
          existingId = existingByExternalId.id;
        }
      }

      if (existingId) {
        // Update existing participant
        const { data, error } = await supabase
          .from("participants")
          .update(participantData)
          .eq("id", existingId)
          .select()
          .single();

        if (error) {
          console.error("Update error:", error);
          results.push({ error: error.message, email: participantData.email });
        } else {
          console.log("Updated participant:", data.id);
          results.push({ success: true, action: "updated", id: data.id });
        }
      } else {
        // Insert new participant
        const { data, error } = await supabase
          .from("participants")
          .insert(participantData)
          .select()
          .single();

        if (error) {
          console.error("Insert error:", error);
          results.push({ error: error.message, name: participantData.full_name });
        } else {
          console.log("Created participant:", data.id);
          results.push({ success: true, action: "created", id: data.id });
        }
      }
    }

    console.log("Webhook results:", results);

    return new Response(
      JSON.stringify({ results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao processar webhook" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
