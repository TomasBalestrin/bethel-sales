import { Textarea } from "@/components/ui/textarea";
import { OpenAnswers } from "./types";

interface OpenQuestionsScreenProps {
  openAnswers: OpenAnswers;
  onOpenAnswerChange: (field: keyof OpenAnswers, value: string) => void;
}

export function OpenQuestionsScreen({
  openAnswers,
  onOpenAnswerChange,
}: OpenQuestionsScreenProps) {
  return (
    <div className="min-h-screen py-6 px-4 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Quase lá!</span>
            <span>90% completo</span>
          </div>
          <div className="h-2 bg-white/50 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              style={{ width: "90%" }}
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Conta mais um pouco sobre você...
          </h2>
          <p className="text-muted-foreground">
            Essas respostas são opcionais, mas nos ajudam a te conhecer melhor 💜
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-purple-100">
            <label className="block text-lg font-medium text-foreground mb-3">
              Qual o maior desafio que você está enfrentando hoje?
            </label>
            <Textarea
              value={openAnswers.biggest_challenge}
              onChange={(e) => onOpenAnswerChange("biggest_challenge", e.target.value)}
              placeholder="Pode ser pessoal, profissional, financeiro..."
              className="min-h-[100px] resize-none border-purple-200 focus:border-purple-400 rounded-xl"
            />
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-purple-100">
            <label className="block text-lg font-medium text-foreground mb-3">
              Se você pudesse mudar UMA coisa na sua vida agora, o que seria?
            </label>
            <Textarea
              value={openAnswers.desired_change}
              onChange={(e) => onOpenAnswerChange("desired_change", e.target.value)}
              placeholder="Seja honesto consigo mesmo..."
              className="min-h-[100px] resize-none border-purple-200 focus:border-purple-400 rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
