import { useEffect, useState } from "react";
import { Loader2, Sparkles, Star } from "lucide-react";

const LOADING_MESSAGES = [
  "Analisando suas respostas...",
  "Descobrindo padrões...",
  "Identificando sua essência...",
  "Revelando seus arquétipos...",
];

export function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        {/* Animated stars/particles */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          
          {/* Orbiting stars */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "4s" }}>
            <Star className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "6s", animationDirection: "reverse" }}>
            <Star className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 text-purple-400 fill-purple-400" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "5s" }}>
            <Star className="absolute top-1/2 right-0 -translate-y-1/2 w-4 h-4 text-pink-400 fill-pink-400" />
          </div>
        </div>

        {/* Loading spinner */}
        <Loader2 className="w-8 h-8 mx-auto mb-6 text-purple-600 animate-spin" />

        {/* Animated messages */}
        <div className="h-8">
          <p
            key={messageIndex}
            className="text-lg font-medium text-foreground animate-fade-in"
          >
            {LOADING_MESSAGES[messageIndex]}
          </p>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Isso pode levar alguns segundos
        </p>
      </div>
    </div>
  );
}
