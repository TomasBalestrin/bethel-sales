import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sparkles,
  Target,
  Lightbulb,
  AlertTriangle,
  ChevronDown,
  TrendingUp,
  MessageSquare,
  RefreshCcw,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Archetype emojis and data
const ARCHETYPE_DATA: Record<string, { emoji: string }> = {
  Inocente: { emoji: "🌟" },
  "Cara Comum": { emoji: "🤝" },
  Herói: { emoji: "⚔️" },
  Cuidador: { emoji: "💝" },
  Explorador: { emoji: "🧭" },
  Rebelde: { emoji: "🔥" },
  Amante: { emoji: "❤️" },
  Criador: { emoji: "🎨" },
  "Bobo da Corte": { emoji: "🎭" },
  Sábio: { emoji: "📚" },
  Mago: { emoji: "✨" },
  Governante: { emoji: "👑" },
};

// DISC Profile full names and colors
const DISC_INFO: Record<string, { name: string; color: string; bgColor: string; borderColor: string }> = {
  D: { name: "Dominância", color: "#EF4444", bgColor: "bg-red-50", borderColor: "border-red-200" },
  I: { name: "Influência", color: "#EAB308", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
  S: { name: "Estabilidade", color: "#22C55E", bgColor: "bg-green-50", borderColor: "border-green-200" },
  C: { name: "Conformidade", color: "#3B82F6", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
};

// Default approach tips based on DISC profile
const DISC_TIPS: Record<string, { tip: string; alerts: string[] }> = {
  D: {
    tip: "Seja direto, foque em resultados e não enrole. Mostre como você pode ajudá-lo a atingir seus objetivos rapidamente.",
    alerts: ["Impaciente com detalhes", "Quer controle da situação", "Evite rodeios e enrolação"],
  },
  I: {
    tip: "Use entusiasmo, construa rapport, seja caloroso e amigável. Deixe-o falar e elogie suas ideias.",
    alerts: ["Baixa paciência para análises longas", "Precisa de reconhecimento", "Evite ser muito formal"],
  },
  S: {
    tip: "Seja paciente, construa confiança, dê segurança e garantias. Não pressione por decisões rápidas.",
    alerts: ["Resiste a mudanças bruscas", "Precisa de tempo para decidir", "Evite pressão excessiva"],
  },
  C: {
    tip: "Apresente dados, seja preciso, responda com fatos e evidências. Esteja preparado para perguntas detalhadas.",
    alerts: ["Analisa muito antes de decidir", "Desconfia de promessas vagas", "Evite exageros e imprecisões"],
  },
};

// Archetype questions mapping (1-10)
const ARCHETYPE_QUESTIONS: Record<number, string[]> = {
  1: ["Inocente", "Herói", "Sábio", "Explorador", "Mago", "Cuidador"],
  2: ["Governante", "Amante", "Rebelde", "Bobo da Corte", "Cara Comum", "Criador"],
  3: ["Herói", "Mago", "Cuidador", "Criador", "Sábio", "Governante"],
  4: ["Cara Comum", "Explorador", "Cuidador", "Rebelde", "Amante", "Inocente"],
  5: ["Herói", "Sábio", "Criador", "Bobo da Corte", "Governante", "Inocente"],
  6: ["Amante", "Cara Comum", "Explorador", "Rebelde", "Cuidador", "Mago"],
  7: ["Herói", "Bobo da Corte", "Criador", "Governante", "Sábio", "Mago"],
  8: ["Cuidador", "Explorador", "Amante", "Rebelde", "Cara Comum", "Inocente"],
  9: ["Explorador", "Bobo da Corte", "Cara Comum", "Rebelde", "Amante", "Mago"],
  10: ["Herói", "Cuidador", "Sábio", "Criador", "Governante", "Inocente"],
};

// DISC questions mapping (11-20)
const DISC_QUESTIONS: Record<number, string[]> = {
  11: ["D", "S", "C", "I"],
  12: ["D", "S", "C", "I"],
  13: ["D", "S", "C", "I"],
  14: ["D", "S", "C", "I"],
  15: ["D", "S", "C", "I"],
  16: ["D", "S", "C", "I"],
  17: ["D", "S", "C", "I"],
  18: ["D", "S", "C", "I"],
  19: ["D", "S", "C", "I"],
  20: ["D", "S", "C", "I"],
};

interface DiscProfileDisplayProps {
  discResponse: {
    disc_profile: string;
    disc_description: string | null;
    sales_insights: string | null;
    objecoes: string | null;
    contorno_objecoes: string | null;
    exemplos_fechamento: string | null;
    responses: Record<string, number>;
    primary_archetype: string | null;
    secondary_archetype: string | null;
    archetype_insight: string | null;
    analyzed_at: string | null;
    approach_tip?: string | null;
    alerts?: string[] | null;
    disc_label?: string | null;
    disc_scores?: { D: number; I: number; S: number; C: number } | null;
  };
}

interface ArchetypeScore {
  name: string;
  emoji: string;
  score: number;
}

// Calculate archetype scores from responses
function calculateArchetypeScores(responses: Record<string, number>): ArchetypeScore[] {
  const scores: Record<string, number> = {};

  for (const [questionId, optionIndex] of Object.entries(responses)) {
    const qId = parseInt(questionId);
    if (qId >= 1 && qId <= 10) {
      const archetypeOptions = ARCHETYPE_QUESTIONS[qId];
      if (archetypeOptions && archetypeOptions[optionIndex]) {
        const archetype = archetypeOptions[optionIndex];
        scores[archetype] = (scores[archetype] || 0) + 1;
      }
    }
  }

  // Ensure all archetypes are present
  Object.keys(ARCHETYPE_DATA).forEach((arch) => {
    if (!scores[arch]) scores[arch] = 0;
  });

  return Object.entries(scores)
    .map(([name, score]) => ({
      name,
      emoji: ARCHETYPE_DATA[name]?.emoji || "✨",
      score,
    }))
    .sort((a, b) => b.score - a.score);
}

// Calculate DISC percentages from responses
function calculateDiscPercentages(responses: Record<string, number>): { D: number; I: number; S: number; C: number } {
  const scores = { D: 0, I: 0, S: 0, C: 0 };
  let totalDiscQuestions = 0;

  for (const [questionId, optionIndex] of Object.entries(responses)) {
    const qId = parseInt(questionId);
    if (qId >= 11 && qId <= 20) {
      const discOptions = DISC_QUESTIONS[qId];
      if (discOptions && discOptions[optionIndex]) {
        const discLetter = discOptions[optionIndex] as keyof typeof scores;
        scores[discLetter]++;
        totalDiscQuestions++;
      }
    }
  }

  // Convert to percentages
  const total = Math.max(totalDiscQuestions, 1);
  return {
    D: Math.round((scores.D / total) * 100),
    I: Math.round((scores.I / total) * 100),
    S: Math.round((scores.S / total) * 100),
    C: Math.round((scores.C / total) * 100),
  };
}

// DISC Progress Bar Component
function DiscBar({ label, letter, value, color }: { label: string; letter: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {letter}
          </span>
          <span className="text-muted-foreground">{label}</span>
        </span>
        <span className="font-semibold" style={{ color }}>
          {value}%
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-4 h-auto hover:bg-muted/50">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{title}</span>
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4">
        <div className="text-sm whitespace-pre-wrap text-muted-foreground">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Convert raw absolute scores to percentages
function scoresToPercentages(scores: { D: number; I: number; S: number; C: number }) {
  const total = scores.D + scores.I + scores.S + scores.C;
  if (total === 0) return { D: 0, I: 0, S: 0, C: 0 };
  return {
    D: Math.round((scores.D / total) * 100),
    I: Math.round((scores.I / total) * 100),
    S: Math.round((scores.S / total) * 100),
    C: Math.round((scores.C / total) * 100),
  };
}

// Calculate raw DISC scores (counts, not percentages) from responses
function calculateRawDiscScores(responses: Record<string, number>): { D: number; I: number; S: number; C: number } {
  const scores = { D: 0, I: 0, S: 0, C: 0 };

  for (const [questionId, optionIndex] of Object.entries(responses)) {
    const qId = parseInt(questionId);
    if (qId >= 11 && qId <= 20) {
      const discOptions = DISC_QUESTIONS[qId];
      if (discOptions && discOptions[optionIndex]) {
        const discLetter = discOptions[optionIndex] as keyof typeof scores;
        scores[discLetter]++;
      }
    }
  }

  return scores;
}

export function DiscProfileDisplay({ discResponse }: DiscProfileDisplayProps) {
  const responses = (discResponse.responses || {}) as Record<string, number>;
  const archetypeScores = calculateArchetypeScores(responses);
  const top3Archetypes = archetypeScores.slice(0, 3);
  
  // Get raw scores (absolute counts) - either from database or calculate from responses
  const rawScores = discResponse.disc_scores 
    ? discResponse.disc_scores as { D: number; I: number; S: number; C: number }
    : calculateRawDiscScores(responses);
  
  // Convert raw scores to percentages for display
  const discPercentages = scoresToPercentages(rawScores);
  
  // Determine dominant DISC letter based on percentages
  const dominantLetter = discResponse.disc_profile?.charAt(0) || 
    Object.entries(discPercentages).sort((a, b) => b[1] - a[1])[0][0];
  
  const discInfo = DISC_INFO[dominantLetter] || DISC_INFO.D;
  const discTips = DISC_TIPS[dominantLetter] || DISC_TIPS.D;
  
  // Use stored tips/alerts or fallback to defaults
  const approachTip = discResponse.approach_tip || discTips.tip;
  const alerts = discResponse.alerts || discTips.alerts;
  const discLabel = discResponse.disc_label || `Perfil ${discInfo.name}`;

  const formattedDate = discResponse.analyzed_at
    ? format(new Date(discResponse.analyzed_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null;

  const [showAllArchetypes, setShowAllArchetypes] = useState(false);

  return (
    <div className="space-y-4">
      {/* Archetype Profile Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-base">Perfil de Arquétipo</CardTitle>
          </div>
          {formattedDate && (
            <p className="text-xs text-muted-foreground">Avaliação em {formattedDate}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Top 3 Archetypes */}
          <div className="space-y-2">
            {top3Archetypes.map((arch, i) => (
              <div
                key={arch.name}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg transition-all",
                  i === 0 && "bg-purple-100 border-l-4 border-purple-500",
                  i === 1 && "bg-muted/50 border-l-4 border-muted-foreground/40",
                  i === 2 && "bg-muted/30 border-l-4 border-muted-foreground/20"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center",
                    i === 0 && "bg-purple-500 text-white",
                    i === 1 && "bg-muted-foreground/40 text-white",
                    i === 2 && "bg-muted-foreground/20 text-muted-foreground"
                  )}>
                    {i + 1}
                  </span>
                  <span className="text-xl">{arch.emoji}</span>
                  <span className="font-medium">{arch.name}</span>
                </div>
                <span className={cn(
                  "font-bold text-lg",
                  i === 0 && "text-purple-600"
                )}>
                  {arch.score}
                </span>
              </div>
            ))}
          </div>

          {/* Archetype Insight */}
          {discResponse.archetype_insight && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm text-purple-800">O que isso significa?</span>
              </div>
              <p className="text-sm text-purple-900/80">{discResponse.archetype_insight}</p>
            </div>
          )}

          {/* Expandable all archetypes */}
          <Collapsible open={showAllArchetypes} onOpenChange={setShowAllArchetypes}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground">
                <ChevronDown className={cn("h-4 w-4 mr-2 transition-transform", showAllArchetypes && "rotate-180")} />
                Todos os Arquétipos
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                {archetypeScores.map((arch) => (
                  <div
                    key={arch.name}
                    className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2"
                  >
                    <span className="flex items-center gap-2">
                      <span>{arch.emoji}</span>
                      <span className="text-muted-foreground">{arch.name}</span>
                    </span>
                    <span className="font-medium">{arch.score}</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* DISC Profile Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Perfil DISC</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dominant Letter Display */}
          <div className={cn("rounded-lg p-4 text-center border", discInfo.bgColor, discInfo.borderColor)}>
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-4xl font-bold" style={{ color: discInfo.color }}>
                {dominantLetter}
              </span>
              <Badge className="text-white" style={{ backgroundColor: discInfo.color }}>
                {discInfo.name}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{discLabel}</p>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3">
            <DiscBar label="Dominância" letter="D" value={discPercentages.D} color={DISC_INFO.D.color} />
            <DiscBar label="Influência" letter="I" value={discPercentages.I} color={DISC_INFO.I.color} />
            <DiscBar label="Estabilidade" letter="S" value={discPercentages.S} color={DISC_INFO.S.color} />
            <DiscBar label="Conformidade" letter="C" value={discPercentages.C} color={DISC_INFO.C.color} />
          </div>
        </CardContent>
      </Card>

      {/* Approach Tip Card */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-yellow-600" />
          <span className="font-medium text-sm text-yellow-800">💡 Dica de Abordagem</span>
        </div>
        <p className="text-sm text-yellow-900">{approachTip}</p>
      </div>

      {/* Alerts Card */}
      <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="font-medium text-sm text-amber-800">⚠️ Alertas</span>
        </div>
        <ul className="text-sm text-amber-900 space-y-1">
          {alerts.map((alert, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">•</span>
              <span>{alert}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Expandable Sections */}
      <Card className="overflow-hidden">
        {discResponse.sales_insights && (
          <CollapsibleSection title="Insights para Venda" icon={TrendingUp} defaultOpen>
            {discResponse.sales_insights}
          </CollapsibleSection>
        )}
        
        {discResponse.objecoes && (
          <>
            <div className="border-t" />
            <CollapsibleSection title="Possíveis Objeções" icon={MessageSquare}>
              {discResponse.objecoes}
            </CollapsibleSection>
          </>
        )}
        
        {discResponse.contorno_objecoes && (
          <>
            <div className="border-t" />
            <CollapsibleSection title="Como Contornar" icon={RefreshCcw}>
              {discResponse.contorno_objecoes}
            </CollapsibleSection>
          </>
        )}
        
        {discResponse.exemplos_fechamento && (
          <>
            <div className="border-t" />
            <CollapsibleSection title="Exemplos de Fechamento" icon={CheckCircle}>
              {discResponse.exemplos_fechamento}
            </CollapsibleSection>
          </>
        )}
      </Card>
    </div>
  );
}
