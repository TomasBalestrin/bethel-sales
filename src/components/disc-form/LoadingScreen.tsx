import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e3a5f] to-[#1e4a7a] flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        {/* Animated circles */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/20 animate-pulse flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-white" />
              </div>
            </div>
          </div>
          
          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "4s" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "6s", animationDirection: "reverse" }}>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/60" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "5s" }}>
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white/80" />
          </div>
        </div>

        {/* Loading spinner */}
        <Loader2 className="w-8 h-8 mx-auto mb-6 text-white animate-spin" />

        {/* Animated messages */}
        <div className="h-8">
          <p
            key={messageIndex}
            className="text-lg font-medium text-white animate-fade-in"
          >
            {LOADING_MESSAGES[messageIndex]}
          </p>
        </div>

        <p className="text-sm text-gray-400 mt-4">
          Isso pode levar alguns segundos
        </p>
      </div>
    </div>
  );
}
