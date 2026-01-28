import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Loader2, Users, Target, TrendingUp, DollarSign, Trophy, Calendar, Percent } from "lucide-react";

interface Participant {
  id: string;
  credenciou_dia1: boolean | null;
  credenciou_dia2: boolean | null;
  credenciou_dia3: boolean | null;
  is_oportunidade: boolean | null;
  qualificacao: "super" | "medio" | "baixo" | null;
}

interface Sale {
  id: string;
  participant_id: string;
  closer_id: string;
  valor_total: number;
  valor_entrada: number | null;
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
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [topClosers, setTopClosers] = useState<TopCloser[]>([]);
  
  // Filtros
  const [diaFilter, setDiaFilter] = useState<string>("todos");
  const [qualFilter, setQualFilter] = useState<string>("todas");

  // Closer stats
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

    const { data: participants } = await supabase.from("participants").select("*");
    const { data: sales } = await supabase.from("sales").select("*");

    setAllParticipants(participants || []);
    setAllSales(sales || []);

    // Fetch top closers
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "closer");
    if (roles?.length) {
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", roles.map(r => r.user_id));
      
      const closersWithStats: TopCloser[] = (profiles || []).map(p => {
        const closerSales = (sales || []).filter(s => s.closer_id === p.id);
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
      const assignedParticipants = (participants || []).filter(p => assignedIds.includes(p.id));
      const assignedOportunidades = assignedParticipants.filter(p => p.is_oportunidade);

      const participantesCompareceram = assignedParticipants.filter(p => 
        p.credenciou_dia1 || p.credenciou_dia2 || p.credenciou_dia3
      ).length;

      const oportunidadesCompareceram = assignedOportunidades.filter(p =>
        p.credenciou_dia1 || p.credenciou_dia2 || p.credenciou_dia3
      ).length;

      const mySales = (sales || []).filter(s => s.closer_id === profile.id);
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

  // Estatísticas filtradas
  const filteredStats = useMemo(() => {
    // Filtrar por dia
    let filteredParticipants = allParticipants;
    if (diaFilter !== "todos") {
      filteredParticipants = allParticipants.filter(p => {
        if (diaFilter === "dia1") return p.credenciou_dia1;
        if (diaFilter === "dia2") return p.credenciou_dia2;
        if (diaFilter === "dia3") return p.credenciou_dia3;
        return true;
      });
    }

    // Filtrar oportunidades por qualificação
    let filteredOportunidades = filteredParticipants.filter(p => p.is_oportunidade);
    if (qualFilter !== "todas") {
      filteredOportunidades = filteredOportunidades.filter(p => p.qualificacao === qualFilter);
    }

    // Calcular vendas relacionadas às oportunidades filtradas
    const filteredSales = allSales.filter(s => 
      filteredOportunidades.some(p => p.id === s.participant_id)
    );

    const totalParticipantes = filteredParticipants.length;
    const totalOportunidades = filteredOportunidades.length;
    const totalVendas = filteredSales.length;
    const taxaConversao = totalOportunidades > 0 ? (totalVendas / totalOportunidades) * 100 : 0;
    const valorVendas = filteredSales.reduce((sum, s) => sum + (Number(s.valor_total) || 0), 0);
    const valorEntradas = filteredSales.reduce((sum, s) => sum + (Number(s.valor_entrada) || 0), 0);

    return { totalParticipantes, totalOportunidades, totalVendas, taxaConversao, valorVendas, valorEntradas };
  }, [allParticipants, allSales, diaFilter, qualFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
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
      {isAdmin && (
        <>
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <ToggleGroup type="single" value={diaFilter} onValueChange={(v) => v && setDiaFilter(v)}>
                <ToggleGroupItem value="todos" size="sm">Todos</ToggleGroupItem>
                <ToggleGroupItem value="dia1" size="sm">Dia 1</ToggleGroupItem>
                <ToggleGroupItem value="dia2" size="sm">Dia 2</ToggleGroupItem>
                <ToggleGroupItem value="dia3" size="sm">Dia 3</ToggleGroupItem>
              </ToggleGroup>
            </div>
            
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <ToggleGroup type="single" value={qualFilter} onValueChange={(v) => v && setQualFilter(v)}>
                <ToggleGroupItem value="todas" size="sm">Todas</ToggleGroupItem>
                <ToggleGroupItem value="super" size="sm" className="data-[state=on]:bg-qualification-super/20 data-[state=on]:text-qualification-super">Super</ToggleGroupItem>
                <ToggleGroupItem value="medio" size="sm" className="data-[state=on]:bg-qualification-medio/20 data-[state=on]:text-qualification-medio">Médio</ToggleGroupItem>
                <ToggleGroupItem value="baixo" size="sm" className="data-[state=on]:bg-qualification-baixo/20 data-[state=on]:text-qualification-baixo">Baixo</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* 6 KPIs */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Users className="h-4 w-4" /> Participantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{filteredStats.totalParticipantes}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Target className="h-4 w-4" /> Oportunidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{filteredStats.totalOportunidades}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" /> Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{filteredStats.totalVendas}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Percent className="h-4 w-4" /> Conversão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{filteredStats.taxaConversao.toFixed(1)}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-4 w-4" /> Valor Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(filteredStats.valorVendas)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-4 w-4" /> Entradas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(filteredStats.valorEntradas)}</div>
              </CardContent>
            </Card>
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
