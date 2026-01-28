import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Target, TrendingUp, DollarSign, Trophy, Calendar } from "lucide-react";

interface DashboardStats {
  totalParticipantes: number;
  credenciadosDia1: number;
  credenciadosDia2: number;
  credenciadosDia3: number;
  totalOportunidades: number;
  oportunidadesDia1: number;
  oportunidadesDia2: number;
  oportunidadesDia3: number;
  // Qualificação
  superQualificadas: { count: number; vendas: number; conversao: number; valorVendas: number; valorEntradas: number };
  medioQualificadas: { count: number; vendas: number; conversao: number; valorVendas: number; valorEntradas: number };
  baixoQualificadas: { count: number; vendas: number; conversao: number; valorVendas: number; valorEntradas: number };
}

interface TopCloser {
  id: string;
  full_name: string;
  avatar_url: string | null;
  quantidade_vendas: number;
  valor_vendas: number;
  valor_entradas: number;
}

export default function Dashboard() {
  const { profile, isAdmin, isCloser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topClosers, setTopClosers] = useState<TopCloser[]>([]);
  const [closerStats, setCloserStats] = useState<{
    participantesCompareceram: number;
    oportunidadesCompareceram: number;
    vendas: number;
    taxaConversao: number;
    valorVendas: number;
    valorEntradas: number;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, [profile, isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);

    // Fetch all participants
    const { data: participants } = await supabase.from("participants").select("*");
    const { data: sales } = await supabase.from("sales").select("*");

    const allParticipants = participants || [];
    const allSales = sales || [];

    // Calculate stats
    const totalParticipantes = allParticipants.length;
    const credenciadosDia1 = allParticipants.filter(p => p.credenciou_dia1).length;
    const credenciadosDia2 = allParticipants.filter(p => p.credenciou_dia2).length;
    const credenciadosDia3 = allParticipants.filter(p => p.credenciou_dia3).length;

    const oportunidades = allParticipants.filter(p => p.is_oportunidade);
    const totalOportunidades = oportunidades.length;
    const oportunidadesDia1 = oportunidades.filter(p => p.credenciou_dia1).length;
    const oportunidadesDia2 = oportunidades.filter(p => p.credenciou_dia2).length;
    const oportunidadesDia3 = oportunidades.filter(p => p.credenciou_dia3).length;

    // Qualificação stats
    const calcQualStats = (qual: string) => {
      const qualParticipants = oportunidades.filter(p => p.qualificacao === qual);
      const qualSales = allSales.filter(s => qualParticipants.some(p => p.id === s.participant_id));
      const count = qualParticipants.length;
      const vendas = qualSales.length;
      const valorVendas = qualSales.reduce((sum, s) => sum + (Number(s.valor_total) || 0), 0);
      const valorEntradas = qualSales.reduce((sum, s) => sum + (Number(s.valor_entrada) || 0), 0);
      const conversao = count > 0 ? (vendas / count) * 100 : 0;
      return { count, vendas, conversao, valorVendas, valorEntradas };
    };

    const newStats: DashboardStats = {
      totalParticipantes,
      credenciadosDia1,
      credenciadosDia2,
      credenciadosDia3,
      totalOportunidades,
      oportunidadesDia1,
      oportunidadesDia2,
      oportunidadesDia3,
      superQualificadas: calcQualStats("super"),
      medioQualificadas: calcQualStats("medio"),
      baixoQualificadas: calcQualStats("baixo"),
    };

    setStats(newStats);

    // Fetch top closers
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "closer");
    if (roles?.length) {
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", roles.map(r => r.user_id));
      
      const closersWithStats: TopCloser[] = (profiles || []).map(p => {
        const closerSales = allSales.filter(s => s.closer_id === p.id);
        return {
          id: p.id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          quantidade_vendas: closerSales.length,
          valor_vendas: closerSales.reduce((sum, s) => sum + (Number(s.valor_total) || 0), 0),
          valor_entradas: closerSales.reduce((sum, s) => sum + (Number(s.valor_entrada) || 0), 0),
        };
      });

      closersWithStats.sort((a, b) => b.valor_vendas - a.valor_vendas);
      setTopClosers(closersWithStats.slice(0, 3));
    }

    // Closer personal stats
    if (isCloser && profile) {
      const { data: assignments } = await supabase
        .from("closer_assignments")
        .select("participant_id")
        .eq("closer_id", profile.id);

      const assignedIds = assignments?.map(a => a.participant_id) || [];
      const assignedParticipants = allParticipants.filter(p => assignedIds.includes(p.id));
      const assignedOportunidades = assignedParticipants.filter(p => p.is_oportunidade);

      const participantesCompareceram = assignedParticipants.filter(p => 
        p.credenciou_dia1 || p.credenciou_dia2 || p.credenciou_dia3
      ).length;

      const oportunidadesCompareceram = assignedOportunidades.filter(p =>
        p.credenciou_dia1 || p.credenciou_dia2 || p.credenciou_dia3
      ).length;

      const mySales = allSales.filter(s => s.closer_id === profile.id);
      const vendas = mySales.length;
      const valorVendas = mySales.reduce((sum, s) => sum + (Number(s.valor_total) || 0), 0);
      const valorEntradas = mySales.reduce((sum, s) => sum + (Number(s.valor_entrada) || 0), 0);
      const taxaConversao = oportunidadesCompareceram > 0 ? (vendas / oportunidadesCompareceram) * 100 : 0;

      setCloserStats({
        participantesCompareceram,
        oportunidadesCompareceram,
        vendas,
        taxaConversao,
        valorVendas,
        valorEntradas,
      });
    }

    setIsLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const formatPercent = (value: number, total: number) => {
    if (total === 0) return "0%";
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo, {profile?.full_name}! {isAdmin ? "(Administrador)" : "(Closer)"}
        </p>
      </div>

      {/* Admin Dashboard */}
      {isAdmin && stats && (
        <>
          {/* Participantes */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5" /> Participantes
            </h2>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalParticipantes}</div>
                </CardContent>
              </Card>
              {[
                { label: "Dia 1", value: stats.credenciadosDia1 },
                { label: "Dia 2", value: stats.credenciadosDia2 },
                { label: "Dia 3", value: stats.credenciadosDia3 },
              ].map(item => (
                <Card key={item.label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {item.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{item.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatPercent(item.value, stats.totalParticipantes)} do total
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Oportunidades */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="h-5 w-5" /> Oportunidades
            </h2>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalOportunidades}</div>
                </CardContent>
              </Card>
              {[
                { label: "Dia 1", value: stats.oportunidadesDia1 },
                { label: "Dia 2", value: stats.oportunidadesDia2 },
                { label: "Dia 3", value: stats.oportunidadesDia3 },
              ].map(item => (
                <Card key={item.label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {item.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{item.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatPercent(item.value, stats.totalOportunidades)} do total
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Qualificação */}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Super Qualificadas", data: stats.superQualificadas, color: "bg-qualification-super/10 border-qualification-super/30", textColor: "text-qualification-super" },
              { label: "Médio Qualificadas", data: stats.medioQualificadas, color: "bg-qualification-medio/10 border-qualification-medio/30", textColor: "text-qualification-medio" },
              { label: "Baixo Qualificadas", data: stats.baixoQualificadas, color: "bg-qualification-baixo/10 border-qualification-baixo/30", textColor: "text-qualification-baixo" },
            ].map(item => (
              <Card key={item.label} className={`border-2 ${item.color}`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-sm font-medium ${item.textColor}`}>{item.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Quantidade</p>
                      <p className="text-lg font-bold">{item.data.count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Vendas</p>
                      <p className="text-lg font-bold">{item.data.vendas}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Conversão</p>
                      <p className="text-lg font-bold">{item.data.conversao.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valor Vendas</p>
                      <p className="text-lg font-bold">{formatCurrency(item.data.valorVendas)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Entradas</p>
                      <p className="text-lg font-bold">{formatCurrency(item.data.valorEntradas)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Closer Dashboard */}
      {isCloser && closerStats && (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Participantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{closerStats.participantesCompareceram}</div>
              <p className="text-xs text-muted-foreground">compareceram</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Oportunidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{closerStats.oportunidadesCompareceram}</div>
              <p className="text-xs text-muted-foreground">compareceram</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{closerStats.vendas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{closerStats.taxaConversao.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valor Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(closerStats.valorVendas)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valor Entradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-primary">{formatCurrency(closerStats.valorEntradas)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TOP 3 Closers */}
      {topClosers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" /> TOP 3 Closers
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {topClosers.map((closer, index) => (
              <Card key={closer.id} className={index === 0 ? "border-yellow-500 border-2" : ""}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={closer.avatar_url || undefined} />
                        <AvatarFallback className="text-xl">{getInitials(closer.full_name)}</AvatarFallback>
                      </Avatar>
                      <Badge
                        className={`absolute -top-2 -right-2 ${
                          index === 0 ? "bg-yellow-500" :
                          index === 1 ? "bg-gray-400" :
                          "bg-amber-700"
                        }`}
                      >
                        #{index + 1}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mt-3">{closer.full_name}</h3>
                    <div className="mt-3 w-full space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vendas</span>
                        <span className="font-medium">{closer.quantidade_vendas}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor Vendas</span>
                        <span className="font-medium">{formatCurrency(closer.valor_vendas)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entradas</span>
                        <span className="font-medium text-primary">{formatCurrency(closer.valor_entradas)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
