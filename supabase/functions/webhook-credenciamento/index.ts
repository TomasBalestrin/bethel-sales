import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
    console.log("Credenciamento webhook received:", JSON.stringify(body));

    const updates = Array.isArray(body) ? body : [body];
    const results = [];

    for (const update of updates) {
      const { email, participant_id, dia1, dia2, dia3, credenciou_dia1, credenciou_dia2, credenciou_dia3 } = update;

      if (!email && !participant_id) {
        results.push({ error: "Email ou participant_id é obrigatório" });
        continue;
      }

      const updateData: Record<string, boolean> = {};
      
      if (dia1 !== undefined || credenciou_dia1 !== undefined) {
        updateData.credenciou_dia1 = dia1 ?? credenciou_dia1;
      }
      if (dia2 !== undefined || credenciou_dia2 !== undefined) {
        updateData.credenciou_dia2 = dia2 ?? credenciou_dia2;
      }
      if (dia3 !== undefined || credenciou_dia3 !== undefined) {
        updateData.credenciou_dia3 = dia3 ?? credenciou_dia3;
      }

      let query = supabase.from("participants").update(updateData);
      
      if (participant_id) {
        query = query.eq("id", participant_id);
      } else {
        query = query.eq("email", email);
      }

      const { data, error } = await query.select().single();

      if (error) {
        console.error("Update error:", error);
        results.push({ error: error.message, identifier: participant_id || email });
      } else {
        results.push({ success: true, id: data.id });
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Credenciamento error:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao processar credenciamento" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
