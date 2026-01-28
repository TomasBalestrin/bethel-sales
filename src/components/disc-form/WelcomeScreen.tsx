import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  participantName: string;
  onStart: () => void;
}

export function WelcomeScreen({ participantName, onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e3a5f] to-[#1e4a7a] flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center animate-fade-in">
        {/* Logo Bethel */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            {/* Icone estilizado */}
            <svg className="w-14 h-14 text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="8" width="48" height="48" rx="8" stroke="currentColor" strokeWidth="3"/>
              <path d="M20 20h8v24h-8V20z" fill="currentColor"/>
              <path d="M32 20h12c4 0 8 4 8 8s-4 8-8 8H32V20z" fill="currentColor"/>
              <circle cx="44" cy="36" r="6" fill="currentColor"/>
            </svg>
            <div className="text-left">
              <span className="text-3xl font-bold text-white">Bethel</span>
              <span className="block text-sm text-gray-300">Educação</span>
            </div>
          </div>
        </div>

        {/* Titulo Principal */}
        <h1 className="text-4xl md:text-5xl font-bold italic text-white mb-4">
          Intensivo da Alta Performance
        </h1>
        
        {/* Subtitulo */}
        <p className="text-xl text-gray-300 mb-6">
          Transforme seu potencial em resultados extraordinários
        </p>
        
        {/* Descricao */}
        <p className="text-gray-400 mb-10 max-w-md mx-auto leading-relaxed">
          Você está prestes a dar o primeiro passo rumo à alta performance. 
          Este teste rápido de 3 minutos revelará seus arquétipos de personalidade 
          e perfil comportamental.
        </p>

        {/* Saudacao ao participante */}
        {participantName && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 mb-8 border border-white/20">
            <p className="text-gray-300 text-sm mb-1">Olá,</p>
            <p className="text-2xl font-semibold text-white">{participantName}!</p>
          </div>
        )}

        {/* Botao CTA */}
        <Button
          onClick={onStart}
          className="w-full max-w-md h-14 text-lg font-semibold bg-white text-[#1e3a5f] hover:bg-gray-100 rounded-full shadow-lg transition-all duration-300"
        >
          Iniciar Minha Jornada →
        </Button>

        <p className="text-xs text-gray-500 mt-8">
          © {new Date().getFullYear()} Bethel Educação
        </p>
      </div>
    </div>
  );
}
