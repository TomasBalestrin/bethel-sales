import { Button } from "@/components/ui/button";
import { ArchetypeResult } from "./types";
import { Share2, Sparkles } from "lucide-react";

interface ResultScreenProps {
  result: ArchetypeResult;
  participantName: string;
}

export function ResultScreen({ result, participantName }: ResultScreenProps) {
  const handleShare = async () => {
    const shareText = `Descobri minha essência! Meus arquétipos são ${result.primary.emoji} ${result.primary.name} e ${result.secondary.emoji} ${result.secondary.name}. Faça o teste você também!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Minha Essência",
          text: shareText,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert("Texto copiado para a área de transferência!");
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 animate-fade-in">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Descobrimos sua essência!</span>
          </div>
          
          {participantName && (
            <p className="text-lg text-muted-foreground">
              {participantName}, esses são seus arquétipos:
            </p>
          )}
        </div>

        {/* Primary Archetype */}
        <div
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-4 shadow-lg border border-purple-200 animate-scale-in"
          style={{ animationDelay: "200ms" }}
        >
          <div className="text-center">
            <span className="text-5xl mb-3 block">{result.primary.emoji}</span>
            <p className="text-xs uppercase tracking-wider text-purple-600 font-medium mb-1">
              Seu Arquétipo Principal
            </p>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {result.primary.name}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {result.primary.description}
            </p>
          </div>
        </div>

        {/* Secondary Archetype */}
        <div
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-4 shadow-md border border-pink-200 animate-scale-in"
          style={{ animationDelay: "400ms" }}
        >
          <div className="text-center">
            <span className="text-4xl mb-3 block">{result.secondary.emoji}</span>
            <p className="text-xs uppercase tracking-wider text-pink-600 font-medium mb-1">
              Sua Segunda Essência
            </p>
            <h2 className="text-xl font-bold text-foreground mb-3">
              {result.secondary.name}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {result.secondary.description}
            </p>
          </div>
        </div>

        {/* Combined Insight */}
        <div
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 border border-purple-100 animate-scale-in"
          style={{ animationDelay: "600ms" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-foreground">O que isso significa?</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {result.combined_insight}
          </p>
        </div>

        {/* Actions */}
        <div
          className="space-y-3 animate-fade-in"
          style={{ animationDelay: "800ms" }}
        >
          <Button
            onClick={handleShare}
            variant="outline"
            size="lg"
            className="w-full h-12 rounded-xl border-purple-300 hover:bg-purple-50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar meu resultado
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          © {new Date().getFullYear()} Bethel Events
        </p>
      </div>
    </div>
  );
}
