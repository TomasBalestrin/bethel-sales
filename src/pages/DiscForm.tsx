import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Question {
  id: number;
  text: string;
  options: string[];
}

export default function DiscFormPage() {
  const { token } = useParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ id: string; participant_name: string } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ disc_profile: string; scores: Record<string, number> } | null>(null);

  useEffect(() => {
    fetchForm();
  }, [token]);

  const fetchForm = async () => {
    if (!token) {
      setError("Token inválido");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("disc-form", {
        method: "GET",
        body: null,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Since invoke doesn't support GET with query params well, use fetch directly
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/disc-form?token=${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro ao carregar formulário");
        setIsLoading(false);
        return;
      }

      setFormData(result.form);
      setQuestions(result.questions);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar formulário");
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (Object.keys(responses).length < questions.length) {
      setError("Por favor, responda todas as perguntas.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/disc-form`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, responses }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao enviar respostas");
        setIsSubmitting(false);
        return;
      }

      setResult(data);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Erro ao enviar respostas");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResponseChange = (questionId: number, optionIndex: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: optionIndex }));
    setError(null);
  };

  const progress = questions.length > 0 ? (Object.keys(responses).length / questions.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Ops!</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-qualification-super mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Obrigado!</h2>
            <p className="text-muted-foreground mb-4">
              Suas respostas foram enviadas com sucesso.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="text-sm text-muted-foreground">Seu perfil DISC</p>
              <p className="text-3xl font-bold text-primary">{result.disc_profile}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Bethel Events</h1>
          <p className="text-muted-foreground">Formulário de Perfil Comportamental</p>
        </div>

        {formData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Olá, {formData.participant_name}!</CardTitle>
              <CardDescription>
                Responda as perguntas abaixo para descobrirmos seu perfil comportamental.
                Não existe resposta certa ou errada, escolha a opção que mais combina com você.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {Object.keys(responses).length} de {questions.length} respondidas
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-3 mb-6 text-center text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {questions.map((question, qIndex) => (
            <Card key={question.id} className={responses[question.id] !== undefined ? "border-primary/30" : ""}>
              <CardHeader>
                <CardTitle className="text-base">
                  {qIndex + 1}. {question.text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={responses[question.id]?.toString()}
                  onValueChange={(value) => handleResponseChange(question.id, parseInt(value))}
                >
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-3 py-2">
                      <RadioGroupItem value={oIndex.toString()} id={`q${question.id}-o${oIndex}`} />
                      <Label htmlFor={`q${question.id}-o${oIndex}`} className="cursor-pointer flex-1">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(responses).length < questions.length}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analisando...
              </>
            ) : (
              "Enviar Respostas"
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} Bethel Events
        </p>
      </div>
    </div>
  );
}
