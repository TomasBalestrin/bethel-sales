import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  participantName: string;
  onStart: () => void;
}

export function WelcomeScreen({ participantName, onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Qual é a sua Essência?
          </h1>
          
          <p className="text-lg text-muted-foreground mb-2">
            Descubra os arquétipos que guiam sua personalidade
          </p>
        </div>

        {participantName && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-sm border border-purple-100">
            <p className="text-muted-foreground mb-1">Olá,</p>
            <p className="text-xl font-semibold text-foreground">{participantName}!</p>
          </div>
        )}

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 text-left space-y-3 border border-purple-100">
          <p className="text-muted-foreground">
            ✨ Um teste rápido de <span className="font-medium text-foreground">3 minutos</span>
          </p>
          <p className="text-muted-foreground">
            🎯 Responda com o coração
          </p>
          <p className="text-muted-foreground">
            💫 Não existe certo ou errado!
          </p>
        </div>

        <Button
          onClick={onStart}
          size="lg"
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
        >
          Descobrir minha essência ✨
        </Button>

        <p className="text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} Bethel Events
        </p>
      </div>
    </div>
  );
}
