import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

import { WelcomeScreen } from "@/components/disc-form/WelcomeScreen";
import { QuestionBlock } from "@/components/disc-form/QuestionBlock";
import { OpenQuestionsScreen } from "@/components/disc-form/OpenQuestionsScreen";
import { LoadingScreen } from "@/components/disc-form/LoadingScreen";
import { ResultScreen } from "@/components/disc-form/ResultScreen";
import { ErrorScreen } from "@/components/disc-form/ErrorScreen";
import type { Question, ArchetypeResult, OpenAnswers, ScreenType } from "@/components/disc-form/types";

const QUESTIONS_PER_BLOCK = 3;
const TOTAL_BLOCKS = 4;

export default function DiscFormPage() {
  const { token } = useParams<{ token: string }>();
  
  // States
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("welcome");
  const [currentBlock, setCurrentBlock] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [openAnswers, setOpenAnswers] = useState<OpenAnswers>({
    biggest_challenge: "",
    desired_change: "",
  });
  const [result, setResult] = useState<ArchetypeResult | null>(null);

  useEffect(() => {
    fetchForm();
  }, [token]);

  const fetchForm = async () => {
    if (!token) {
      setError("Token inválido");
      setCurrentScreen("error");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/disc-form?token=${token}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao carregar formulário");
        setCurrentScreen("error");
        setIsLoading(false);
        return;
      }

      // Se já foi respondido, mostrar resultado
      if (data.already_answered && data.archetypes) {
        setResult(data.archetypes);
        setCurrentScreen("result");
        setIsLoading(false);
        return;
      }

      setParticipantName(data.form?.participant_name || "");
      setQuestions(data.questions || []);
      setIsLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Erro ao carregar formulário");
      setCurrentScreen("error");
      setIsLoading(false);
    }
  };

  const handleResponseChange = (questionId: number, optionIndex: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleOpenAnswerChange = (field: keyof OpenAnswers, value: string) => {
    setOpenAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const getCurrentBlockQuestions = (): Question[] => {
    const start = (currentBlock - 1) * QUESTIONS_PER_BLOCK;
    const end = start + QUESTIONS_PER_BLOCK;
    return questions.slice(start, end);
  };

  const isBlockComplete = (): boolean => {
    const blockQuestions = getCurrentBlockQuestions();
    return blockQuestions.every((q) => responses[q.id] !== undefined);
  };

  const isAllQuestionsAnswered = (): boolean => {
    return questions.every((q) => responses[q.id] !== undefined);
  };

  const handleNext = () => {
    if (currentScreen === "welcome") {
      setCurrentScreen("questions");
      setCurrentBlock(1);
    } else if (currentScreen === "questions") {
      if (currentBlock < TOTAL_BLOCKS) {
        setCurrentBlock((prev) => prev + 1);
      } else {
        setCurrentScreen("open");
      }
    } else if (currentScreen === "open") {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentScreen === "questions" && currentBlock > 1) {
      setCurrentBlock((prev) => prev - 1);
    } else if (currentScreen === "questions" && currentBlock === 1) {
      setCurrentScreen("welcome");
    } else if (currentScreen === "open") {
      setCurrentScreen("questions");
      setCurrentBlock(TOTAL_BLOCKS);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setCurrentScreen("loading");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/disc-form`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            responses,
            open_answers: openAnswers,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao enviar respostas");
        setCurrentScreen("error");
        return;
      }

      setResult(data.archetypes);
      setCurrentScreen("result");
    } catch (err) {
      console.error("Submit error:", err);
      setError("Erro ao enviar respostas");
      setCurrentScreen("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initial loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Error screen
  if (currentScreen === "error" && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        <ErrorScreen message={error} />
      </div>
    );
  }

  // Result screen
  if (currentScreen === "result" && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        <ResultScreen result={result} participantName={participantName} />
      </div>
    );
  }

  // Loading screen
  if (currentScreen === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        <LoadingScreen />
      </div>
    );
  }

  // Welcome screen
  if (currentScreen === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        <WelcomeScreen participantName={participantName} onStart={handleNext} />
      </div>
    );
  }

  // Open questions screen
  if (currentScreen === "open") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        <OpenQuestionsScreen
          openAnswers={openAnswers}
          onOpenAnswerChange={handleOpenAnswerChange}
        />
        
        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-purple-100 p-4 safe-area-inset-bottom">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12 rounded-xl border-purple-200"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  Descobrir minha essência
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="h-24" /> {/* Spacer for fixed nav */}
      </div>
    );
  }

  // Questions screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      <QuestionBlock
        questions={getCurrentBlockQuestions()}
        responses={responses}
        onResponseChange={handleResponseChange}
        currentBlock={currentBlock}
        totalBlocks={TOTAL_BLOCKS}
      />
      
      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-purple-100 p-4 safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 h-12 rounded-xl border-purple-200"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isBlockComplete()}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
          >
            {currentBlock === TOTAL_BLOCKS ? "Continuar" : "Próximo"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
      
      <div className="h-24" /> {/* Spacer for fixed nav */}
    </div>
  );
}
