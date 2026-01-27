import { cn } from "@/lib/utils";
import { Question } from "./types";

interface QuestionBlockProps {
  questions: Question[];
  responses: Record<number, number>;
  onResponseChange: (questionId: number, optionIndex: number) => void;
  currentBlock: number;
  totalBlocks: number;
}

export function QuestionBlock({
  questions,
  responses,
  onResponseChange,
  currentBlock,
  totalBlocks,
}: QuestionBlockProps) {
  const progress = (currentBlock / totalBlocks) * 100;

  return (
    <div className="min-h-screen py-6 px-4 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Bloco {currentBlock} de {totalBlocks}</span>
            <span>{Math.round(progress)}% completo</span>
          </div>
          <div className="h-2 bg-white/50 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="text-center text-muted-foreground mb-6">
          Escolha a opção que mais combina com você
        </p>

        {/* Questions */}
        <div className="space-y-8">
          {questions.map((question, qIndex) => (
            <div
              key={question.id}
              className={cn(
                "bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border transition-all duration-300",
                responses[question.id] !== undefined
                  ? "border-purple-300 shadow-purple-100"
                  : "border-purple-100"
              )}
              style={{ animationDelay: `${qIndex * 100}ms` }}
            >
              <h3 className="text-lg font-medium text-foreground mb-4">
                {question.text}
              </h3>

              <div className="space-y-3">
                {question.options.map((option, oIndex) => (
                  <button
                    key={oIndex}
                    onClick={() => onResponseChange(question.id, oIndex)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
                      responses[question.id] === oIndex
                        ? "border-purple-500 bg-purple-50 text-purple-900 shadow-sm"
                        : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          responses[question.id] === oIndex
                            ? "border-purple-500 bg-purple-500"
                            : "border-gray-300"
                        )}
                      >
                        {responses[question.id] === oIndex && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-sm leading-relaxed">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
