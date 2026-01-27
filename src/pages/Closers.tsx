import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, UserCog, TrendingUp, DollarSign, Target } from "lucide-react";
import { CloserPanel } from "@/components/closers/CloserPanel";

interface CloserStats {
  id: string;
  full_name: string;
  avatar_url: string | null;
  user_id: string;
  oportunidades_comparecidas: number;
  quantidade_vendas: number;
  taxa_conversao: number;
  valor_vendas: number;
  valor_entradas: number;
}

export default function Closers() {
  const { isAdmin, profile } = useAuth();
  const { toast } = useToast();
  const [closers, setClosers] = useState<CloserStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCloser, setSelectedCloser] = useState<CloserStats | null>(null);

  const fetchClosers = async () => {
    setIsLoading(true);

    // Get closers
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "closer");

    if (!roles?.length) {
      setClosers([]);
      setIsLoading(false);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", roles.map(r => r.user_id));

    if (!profiles) {
      setClosers([]);
      setIsLoading(false);
      return;
    }

    // Get assignments for each closer
    const closerIds = profiles.map(p => p.id);
    
    const { data: assignments } = await supabase
      .from("closer_assignments")
      .select("closer_id, participant_id, participants(is_oportunidade, credenciou_dia1, credenciou_dia2, credenciou_dia3)")
      .in("closer_id", closerIds);

    // Get sales for each closer
    const { data: sales } = await supabase
      .from("sales")
      .select("closer_id, valor_total, valor_entrada")
      .in("closer_id", closerIds);

    // Calculate stats for each closer
    const closerStats: CloserStats[] = profiles.map(p => {
      const closerAssignments = assignments?.filter(a => a.closer_id === p.id) || [];
      const closerSales = sales?.filter(s => s.closer_id === p.id) || [];

      // Oportunidades que compareceram (pelo menos 1 dia)
      const oportunidadesComparecidas = closerAssignments.filter(a => {
        const participant = a.participants as any;
        return participant?.is_oportunidade && 
          (participant?.credenciou_dia1 || participant?.credenciou_dia2 || participant?.credenciou_dia3);
      }).length;

      const quantidadeVendas = closerSales.length;
      const valorVendas = closerSales.reduce((sum, s) => sum + (Number(s.valor_total) || 0), 0);
      const valorEntradas = closerSales.reduce((sum, s) => sum + (Number(s.valor_entrada) || 0), 0);
      const taxaConversao = oportunidadesComparecidas > 0 
        ? (quantidadeVendas / oportunidadesComparecidas) * 100 
        : 0;

      return {
        id: p.id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        user_id: p.user_id,
        oportunidades_comparecidas: oportunidadesComparecidas,
        quantidade_vendas: quantidadeVendas,
        taxa_conversao: taxaConversao,
        valor_vendas: valorVendas,
        valor_entradas: valorEntradas,
      };
    });

    // Sort by valor_vendas
    closerStats.sort((a, b) => b.valor_vendas - a.valor_vendas);

    setClosers(closerStats);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchClosers();
  }, []);

  const filteredClosers = closers.filter(c =>
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  // For closers view, filter to show only their own data
  const displayClosers = isAdmin ? filteredClosers : filteredClosers.filter(c => c.user_id === profile?.user_id);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Closers</h1>
        <p className="text-muted-foreground">
          Performance dos closers no evento
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar closer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : displayClosers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <UserCog className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Nenhum closer encontrado</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {isAdmin ? "Cadastre closers no Painel Admin." : "Você ainda não tem dados de performance."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayClosers.map((closer, index) => (
            <Card
              key={closer.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/20"
              onClick={() => setSelectedCloser(closer)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  {index < 3 && isAdmin && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className={
                        index === 0 ? "bg-yellow-500" :
                        index === 1 ? "bg-gray-400" :
                        "bg-amber-700"
                      }>
                        #{index + 1}
                      </Badge>
                    </div>
                  )}
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={closer.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(closer.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{closer.full_name}</h3>
                    <p className="text-sm text-muted-foreground">Closer</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <Target className="h-3.5 w-3.5" />
                      <span className="text-xs">Oportunidades</span>
                    </div>
                    <p className="font-semibold">{closer.oportunidades_comparecidas}</p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="text-xs">Vendas</span>
                    </div>
                    <p className="font-semibold">{closer.quantidade_vendas}</p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <span className="text-xs">Conversão</span>
                    </div>
                    <p className="font-semibold">{closer.taxa_conversao.toFixed(1)}%</p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span className="text-xs">Vendas</span>
                    </div>
                    <p className="font-semibold text-sm">{formatCurrency(closer.valor_vendas)}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Entradas</span>
                  <span className="font-semibold text-primary">{formatCurrency(closer.valor_entradas)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CloserPanel
        closer={selectedCloser}
        onClose={() => setSelectedCloser(null)}
        isAdmin={isAdmin}
      />
    </div>
  );
}
