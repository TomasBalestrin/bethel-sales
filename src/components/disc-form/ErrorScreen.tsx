import { AlertCircle } from "lucide-react";

interface ErrorScreenProps {
  message: string;
}

export function ErrorScreen({ message }: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e3a5f] to-[#1e4a7a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2 text-white">Ops!</h2>
        <p className="text-gray-300">{message}</p>
      </div>
    </div>
  );
}
