import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, TrendingUp, DollarSign, Users, Loader2, ArrowLeft } from "lucide-react";

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

interface Participant {
  id: string;
  full_name: string;
  is_oportunidade: boolean;
  qualificacao: string | null;
  credenciou_dia1: boolean;
  credenciou_dia2: boolean;
  credenciou_dia3: boolean;
}

export default function CloserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [closer, setCloser] = useState<CloserStats | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDay, setFilterDay] = useState<string>("all");

  useEffect(() => {
    if (id) {
      fetchCloserData();
    }
  }, [id]);

  const fetchCloserData = async () => {
    if (!id) return;
    setIsLoading(true);

    // Fetch closer profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (!profile) {
      setIsLoading(false);
      return;
    }

    // Fetch assignments and calculate stats
    const { data: assignments } = await supabase
      .from("closer_assignments")
      .select("participant_id, participants(id, full_name, is_oportunidade, qualificacao, credenciou_dia1, credenciou_dia2, credenciou_dia3)")
      .eq("closer_id", id);

    const { data: sales } = await supabase
      .from("sales")
      .select("valor_total, valor_entrada")
      .eq("closer_id", id);

    // Calculate stats
    const participantsList = assignments?.map(a => a.participants as unknown as Participant).filter(Boolean) || [];
    setParticipants(participantsList);

    const oportunidadesComparecidas = participantsList.filter(p => 
      p?.is_oportunidade && (p?.credenciou_dia1 || p?.credenciou_dia2 || p?.credenciou_dia3)
    ).length;

    const quantidadeVendas = sales?.length || 0;
    const valorVendas = sales?.reduce((sum, s) => sum + (Number(s.valor_total) || 0), 0) || 0;
    const valorEntradas = sales?.reduce((sum, s) => sum + (Number(s.valor_entrada) || 0), 0) || 0;
    const taxaConversao = oportunidadesComparecidas > 0 ? (quantidadeVendas / oportunidadesComparecidas) * 100 : 0;

    setCloser({
      id: profile.id,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      user_id: profile.user_id,
      oportunidades_comparecidas: oportunidadesComparecidas,
      quantidade_vendas: quantidadeVendas,
      taxa_conversao: taxaConversao,
      valor_vendas: valorVendas,
      valor_entradas: valorEntradas,
    });

    setIsLoading(false);
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const filteredParticipants = participants.filter(p => {
    if (!p) return false;
    if (filterDay === "all") return true;
    if (filterDay === "dia1") return p.credenciou_dia1;
    if (filterDay === "dia2") return p.credenciou_dia2;
    if (filterDay === "dia3") return p.credenciou_dia3;
    return true;
  });

  const oportunidades = filteredParticipants.filter(p => p?.is_oportunidade);

  // Qualification counts (admin only)
  const superQualificadas = oportunidades.filter(p => p?.qualificacao === "super").length;
  const medioQualificadas = oportunidades.filter(p => p?.qualificacao === "medio").length;
  const baixoQualificadas = oportunidades.filter(p => p?.qualificacao === "baixo").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!closer) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate("/closers")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Closer não encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button variant="ghost" size="sm" onClick={() => navigate("/closers")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <span>/</span>
        <span className="font-medium text-foreground">{closer.full_name}</span>
      </div>

      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={closer.avatar_url || undefined} />
          <AvatarFallback className="text-xl">{getInitials(closer.full_name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{closer.full_name}</h1>
          <p className="text-muted-foreground">Closer</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              <span className="text-sm">Oportunidades</span>
            </div>
            <p className="text-2xl font-bold">{closer.oportunidades_comparecidas}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Vendas</span>
            </div>
            <p className="text-2xl font-bold">{closer.quantidade_vendas}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <span className="text-sm">Taxa Conversão</span>
            </div>
            <p className="text-2xl font-bold">{closer.taxa_conversao.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Valor Vendas</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(closer.valor_vendas)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Entradas Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">Valor de Entradas</span>
          </div>
          <p className="text-3xl font-bold text-primary">{formatCurrency(closer.valor_entradas)}</p>
        </CardContent>
      </Card>

      {/* Participants Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Participantes Atribuídos</h2>
          <Select value={filterDay} onValueChange={setFilterDay}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="dia1">Dia 1</SelectItem>
              <SelectItem value="dia2">Dia 2</SelectItem>
              <SelectItem value="dia3">Dia 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredParticipants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
            Nenhum participante atribuído.
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {filteredParticipants.length} participantes
              </Badge>
              <Badge variant="default">
                <Target className="h-3 w-3 mr-1" />
                {oportunidades.length} oportunidades
              </Badge>
            </div>

            {isAdmin && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-qualification-super/10 rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground">Super</p>
                  <p className="text-2xl font-bold text-qualification-super">{superQualificadas}</p>
                </div>
                <div className="bg-qualification-medio/10 rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground">Médio</p>
                  <p className="text-2xl font-bold text-qualification-medio">{medioQualificadas}</p>
                </div>
                <div className="bg-qualification-baixo/10 rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground">Baixo</p>
                  <p className="text-2xl font-bold text-qualification-baixo">{baixoQualificadas}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {filteredParticipants.map(p => p && (
                <div 
                  key={p.id} 
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 cursor-pointer transition-colors"
                  onClick={() => navigate(`/participantes/${p.id}`)}
                >
                  <span className="font-medium">{p.full_name}</span>
                  <div className="flex gap-1">
                    {p.is_oportunidade && <Badge variant="default" className="text-xs">Oportunidade</Badge>}
                    {p.credenciou_dia1 && <Badge variant="outline" className="text-xs">D1</Badge>}
                    {p.credenciou_dia2 && <Badge variant="outline" className="text-xs">D2</Badge>}
                    {p.credenciou_dia3 && <Badge variant="outline" className="text-xs">D3</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
