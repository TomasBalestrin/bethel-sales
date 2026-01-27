import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, Users, DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  exportToCSV,
  participantExportColumns,
  salesExportColumns,
  closerPerformanceColumns,
} from "@/lib/export";

interface Sale {
  id: string;
  participant_id: string;
  closer_id: string;
  valor_total: number;
  valor_entrada: number | null;
  sale_date: string | null;
  product_name: string | null;
  forma_negociacao: string | null;
}

interface Participant {
  id: string;
  full_name: string;
  qualificacao: string | null;
  is_oportunidade: boolean;
  credenciou_dia1: boolean;
  credenciou_dia2: boolean;
  credenciou_dia3: boolean;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  faturamento: string | null;
  nicho: string | null;
  cor: string | null;
  vezes_chamado: number | null;
  funil_origem: string | null;
}

interface Profile {
  id: string;
  full_name: string;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export default function Reports() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [closers, setClosers] = useState<Profile[]>([]);
  const [assignments, setAssignments] = useState<Array<{ closer_id: string; participant_id: string }>>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    const [salesRes, participantsRes, closersRes, assignmentsRes] = await Promise.all([
      supabase.from("sales").select("*"),
      supabase.from("participants").select("*"),
      supabase.from("profiles").select("id, full_name"),
      supabase.from("closer_assignments").select("closer_id, participant_id"),
    ]);

    if (salesRes.error || participantsRes.error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao carregar dados." });
    }

    setSales(salesRes.data || []);
    setParticipants(participantsRes.data || []);
    setClosers(closersRes.data || []);
    setAssignments(assignmentsRes.data || []);
    setIsLoading(false);
  };

  // Calculate sales by day
  const salesByDay = sales.reduce((acc, sale) => {
    const date = sale.sale_date ? new Date(sale.sale_date).toLocaleDateString("pt-BR") : "Sem data";
    if (!acc[date]) acc[date] = { date, valor: 0, quantidade: 0 };
    acc[date].valor += sale.valor_total;
    acc[date].quantidade += 1;
    return acc;
  }, {} as Record<string, { date: string; valor: number; quantidade: number }>);

  const salesByDayData = Object.values(salesByDay).slice(-14);

  // Calculate closer performance
  const closerPerformance = closers.map((closer) => {
    const closerSales = sales.filter((s) => s.closer_id === closer.id);
    const totalValue = closerSales.reduce((sum, s) => sum + s.valor_total, 0);
    const assignedCount = assignments.filter((a) => a.closer_id === closer.id).length;
    const conversionRate = assignedCount > 0 ? ((closerSales.length / assignedCount) * 100).toFixed(1) : "0";

    return {
      name: closer.full_name,
      totalSales: closerSales.length,
      totalValue,
      averageTicket: closerSales.length > 0 ? totalValue / closerSales.length : 0,
      assignedParticipants: assignedCount,
      conversionRate: parseFloat(conversionRate),
    };
  }).filter((c) => c.totalSales > 0 || c.assignedParticipants > 0)
    .sort((a, b) => b.totalValue - a.totalValue);

  // Calculate qualification distribution
  const qualificationData = [
    {
      name: "Super",
      value: participants.filter((p) => p.qualificacao === "super").length,
      color: "hsl(var(--chart-1))",
    },
    {
      name: "Médio",
      value: participants.filter((p) => p.qualificacao === "medio").length,
      color: "hsl(var(--chart-2))",
    },
    {
      name: "Baixo",
      value: participants.filter((p) => p.qualificacao === "baixo").length,
      color: "hsl(var(--chart-3))",
    },
    {
      name: "Não definido",
      value: participants.filter((p) => !p.qualificacao).length,
      color: "hsl(var(--chart-4))",
    },
  ].filter((q) => q.value > 0);

  // Calculate credenciamento by day
  const credenciamentoData = [
    {
      dia: "Dia 1",
      participantes: participants.filter((p) => p.credenciou_dia1).length,
      oportunidades: participants.filter((p) => p.credenciou_dia1 && p.is_oportunidade).length,
    },
    {
      dia: "Dia 2",
      participantes: participants.filter((p) => p.credenciou_dia2).length,
      oportunidades: participants.filter((p) => p.credenciou_dia2 && p.is_oportunidade).length,
    },
    {
      dia: "Dia 3",
      participantes: participants.filter((p) => p.credenciou_dia3).length,
      oportunidades: participants.filter((p) => p.credenciou_dia3 && p.is_oportunidade).length,
    },
  ];

  const totalVendas = sales.reduce((sum, s) => sum + s.valor_total, 0);
  const oportunidades = participants.filter((p) => p.is_oportunidade).length;
  const taxaConversao = oportunidades > 0 ? ((sales.length / oportunidades) * 100).toFixed(1) : "0";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const handleExportParticipants = () => {
    exportToCSV(participants, participantExportColumns, "participantes");
    toast({ title: "Exportado!", description: "Participantes exportados com sucesso." });
  };

  const handleExportSales = () => {
    const exportData = sales.map((s) => {
      const participant = participants.find((p) => p.id === s.participant_id);
      const closer = closers.find((c) => c.id === s.closer_id);
      return {
        participant_name: participant?.full_name || "",
        product_name: s.product_name || "",
        valor_total: s.valor_total,
        valor_entrada: s.valor_entrada,
        forma_negociacao: s.forma_negociacao,
        closer_name: closer?.full_name || "",
        sale_date: s.sale_date,
      };
    });
    exportToCSV(exportData, salesExportColumns, "vendas");
    toast({ title: "Exportado!", description: "Vendas exportadas com sucesso." });
  };

  const handleExportClosers = () => {
    exportToCSV(closerPerformance, closerPerformanceColumns, "closers_performance");
    toast({ title: "Exportado!", description: "Performance exportada com sucesso." });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Análise de performance e métricas do evento</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportParticipants}>
            <Download className="h-4 w-4 mr-2" />
            Participantes
          </Button>
          <Button variant="outline" onClick={handleExportSales}>
            <Download className="h-4 w-4 mr-2" />
            Vendas
          </Button>
          <Button variant="outline" onClick={handleExportClosers}>
            <Download className="h-4 w-4 mr-2" />
            Closers
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Vendas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalVendas)}</div>
            <p className="text-xs text-muted-foreground">{sales.length} vendas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participants.length}</div>
            <p className="text-xs text-muted-foreground">{oportunidades} oportunidades</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxaConversao}%</div>
            <p className="text-xs text-muted-foreground">vendas / oportunidades</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(sales.length > 0 ? totalVendas / sales.length : 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales by Day */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {salesByDayData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByDayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Valor"]}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados de vendas
              </div>
            )}
          </CardContent>
        </Card>

        {/* Closer Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance de Closers</CardTitle>
          </CardHeader>
          <CardContent>
            {closerPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={closerPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" fontSize={12} width={100} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Valor Total"]}
                  />
                  <Bar dataKey="totalValue" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados de performance
              </div>
            )}
          </CardContent>
        </Card>

        {/* Qualification Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Qualificação</CardTitle>
          </CardHeader>
          <CardContent>
            {qualificationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={qualificationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {qualificationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados de qualificação
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credenciamento by Day */}
        <Card>
          <CardHeader>
            <CardTitle>Credenciamento por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={credenciamentoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="participantes"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                  name="Participantes"
                />
                <Line
                  type="monotone"
                  dataKey="oportunidades"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-2))" }}
                  name="Oportunidades"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Closer Details Table */}
      {closerPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes por Closer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Closer</th>
                    <th className="text-right py-3 px-2">Vendas</th>
                    <th className="text-right py-3 px-2">Valor Total</th>
                    <th className="text-right py-3 px-2">Ticket Médio</th>
                    <th className="text-right py-3 px-2">Atribuídos</th>
                    <th className="text-right py-3 px-2">Conversão</th>
                  </tr>
                </thead>
                <tbody>
                  {closerPerformance.map((closer) => (
                    <tr key={closer.name} className="border-b last:border-0">
                      <td className="py-3 px-2 font-medium">{closer.name}</td>
                      <td className="text-right py-3 px-2">{closer.totalSales}</td>
                      <td className="text-right py-3 px-2">{formatCurrency(closer.totalValue)}</td>
                      <td className="text-right py-3 px-2">{formatCurrency(closer.averageTicket)}</td>
                      <td className="text-right py-3 px-2">{closer.assignedParticipants}</td>
                      <td className="text-right py-3 px-2">{closer.conversionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
