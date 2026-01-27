import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

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
      const {
        // Required
        full_name,
        nome,
        name,
        // Optional fields
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
        // Credenciamento
        credenciou_dia1,
        credenciou_dia2,
        credenciou_dia3,
        dia1,
        dia2,
        dia3,
      } = participant;

      const participantName = full_name || nome || name;
      
      if (!participantName) {
        results.push({ error: "Nome é obrigatório", data: participant });
        continue;
      }

      const participantData = {
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
        webhook_data: participant,
      };

      // Check if participant exists by email
      if (participantData.email) {
        const { data: existing } = await supabase
          .from("participants")
          .select("id")
          .eq("email", participantData.email)
          .single();

        if (existing) {
          // Update existing
          const { data, error } = await supabase
            .from("participants")
            .update(participantData)
            .eq("id", existing.id)
            .select()
            .single();

          if (error) {
            console.error("Update error:", error);
            results.push({ error: error.message, email: participantData.email });
          } else {
            results.push({ success: true, action: "updated", id: data.id });
          }
          continue;
        }
      }

      // Insert new
      const { data, error } = await supabase
        .from("participants")
        .insert(participantData)
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
        results.push({ error: error.message, name: participantName });
      } else {
        results.push({ success: true, action: "created", id: data.id });
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
