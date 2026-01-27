import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, Filter, Instagram, Loader2, X, Download, Plus } from "lucide-react";
import { BulkAssignBar } from "@/components/participants/BulkAssignBar";
import { CreateParticipantDialog } from "@/components/participants/CreateParticipantDialog";
import { exportToCSV, participantExportColumns } from "@/lib/export";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  faturamento: string | null;
  nicho: string | null;
  instagram: string | null;
  credenciou_dia1: boolean;
  credenciou_dia2: boolean;
  credenciou_dia3: boolean;
  funil_origem: string | null;
  closer_vendeu_id: string | null;
  mentorado_convidou: string | null;
  acompanhante: string | null;
  is_oportunidade: boolean;
  vezes_chamado: number;
  cor: string | null;
  qualificacao: string | null;
  created_at: string;
  // Novos campos importados
  cpf_cnpj: string | null;
  nome_cracha: string | null;
  tem_socio: boolean | null;
  lucro_liquido: string | null;
  objetivo_evento: string | null;
  maior_dificuldade: string | null;
  event_name: string | null;
  registration_status: string | null;
  aceitou_termo_imagem: boolean | null;
}

const colorMap: Record<string, string> = {
  rosa: "bg-participant-rosa",
  preto: "bg-participant-preto",
  azul_claro: "bg-participant-azul-claro",
  verde: "bg-participant-verde",
  dourado: "bg-participant-dourado",
  laranja: "bg-participant-laranja",
};

export default function Participants() {
  const navigate = useNavigate();
  const { isAdmin, profile } = useAuth();
  const { toast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Filters
  const [filterFunil, setFilterFunil] = useState<string>("all");
  const [filterCloser, setFilterCloser] = useState<string>("all");
  const [filterOportunidade, setFilterOportunidade] = useState<string>("all");
  const [filterVenda, setFilterVenda] = useState<string>("all");
  
  const [closers, setClosers] = useState<Array<{ id: string; full_name: string }>>([]);
  const [funilOptions, setFunilOptions] = useState<string[]>([]);
  const [salesMap, setSalesMap] = useState<Record<string, boolean>>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchParticipants = async () => {
    setIsLoading(true);

    let query = supabase.from("participants").select("*").order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
      setIsLoading(false);
      return;
    }

    setParticipants(data || []);
    
    // Extract unique funnel options
    const funils = [...new Set((data || []).map(p => p.funil_origem).filter(Boolean))] as string[];
    setFunilOptions(funils);

    // Fetch sales to know which participants have sales
    const { data: salesData } = await supabase.from("sales").select("participant_id");
    const salesSet: Record<string, boolean> = {};
    salesData?.forEach(s => { salesSet[s.participant_id] = true; });
    setSalesMap(salesSet);

    setIsLoading(false);
  };

  const fetchClosers = async () => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "closer");

    if (!roles?.length) return;

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, user_id")
      .in("user_id", roles.map(r => r.user_id));

    setClosers(profiles || []);
  };

  useEffect(() => {
    fetchParticipants();
    fetchClosers();
  }, []);

  const filteredParticipants = participants.filter(p => {
    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        p.full_name.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term) ||
        p.nicho?.toLowerCase().includes(term) ||
        p.instagram?.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    // Funil filter
    if (filterFunil !== "all" && p.funil_origem !== filterFunil) return false;

    // Closer filter (admin only)
    if (isAdmin && filterCloser !== "all" && p.closer_vendeu_id !== filterCloser) return false;

    // Oportunidade filter
    if (filterOportunidade !== "all") {
      if (filterOportunidade === "sim" && !p.is_oportunidade) return false;
      if (filterOportunidade === "nao" && p.is_oportunidade) return false;
    }

    // Venda filter
    if (filterVenda !== "all") {
      const hasVenda = salesMap[p.id];
      if (filterVenda === "sim" && !hasVenda) return false;
      if (filterVenda === "nao" && hasVenda) return false;
    }

    return true;
  });

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatFaturamento = (value: string | null) => {
    if (!value) return "-";
    // If it's already a formatted string (e.g., "Até R$ 5.000,00"), return it directly
    if (typeof value === "string" && value.includes("R$")) return value;
    // Try to parse as number for legacy data
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
    }
    return value;
  };

  const clearFilters = () => {
    setFilterFunil("all");
    setFilterCloser("all");
    setFilterOportunidade("all");
    setFilterVenda("all");
    setSearchTerm("");
  };

  const hasActiveFilters = filterFunil !== "all" || filterCloser !== "all" || filterOportunidade !== "all" || filterVenda !== "all" || searchTerm;

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    exportToCSV(filteredParticipants, participantExportColumns, "participantes");
    toast({ title: "Exportado!", description: "Arquivo CSV gerado com sucesso." });
  };

  const handleBulkComplete = () => {
    setSelectedIds([]);
    fetchParticipants();
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Participantes</h1>
          <p className="text-muted-foreground">
            {filteredParticipants.length} de {participants.length} participantes
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Participante
            </Button>
          )}
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, nicho ou instagram..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          
          <Select value={filterFunil} onValueChange={setFilterFunil}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Funil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os funis</SelectItem>
              {funilOptions.map(f => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isAdmin && (
            <Select value={filterCloser} onValueChange={setFilterCloser}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Closer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os closers</SelectItem>
                {closers.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={filterOportunidade} onValueChange={setFilterOportunidade}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Oportunidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="sim">É oportunidade</SelectItem>
              <SelectItem value="nao">Não é oportunidade</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterVenda} onValueChange={setFilterVenda}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Venda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="sim">Com venda</SelectItem>
              <SelectItem value="nao">Sem venda</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Participants Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredParticipants.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Nenhum participante encontrado</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {searchTerm || hasActiveFilters 
                ? "Tente ajustar os filtros de busca." 
                : "Os participantes serão importados via webhook."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredParticipants.map((participant) => (
            <Card
              key={participant.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg hover:border-primary/20",
                selectedIds.includes(participant.id) && "ring-2 ring-primary"
              )}
              onClick={() => navigate(`/participantes/${participant.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {isAdmin && (
                    <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(participant.id)}
                        onCheckedChange={() => toggleSelection(participant.id)}
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={participant.photo_url || undefined} />
                      <AvatarFallback>{getInitials(participant.full_name)}</AvatarFallback>
                    </Avatar>
                    {participant.cor && (
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card",
                        colorMap[participant.cor]
                      )} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{participant.full_name}</h3>
                    {participant.nicho && (
                      <p className="text-sm text-muted-foreground truncate">{participant.nicho}</p>
                    )}
                    <p className="text-sm font-medium text-primary mt-1">
                      {formatFaturamento(participant.faturamento)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {participant.is_oportunidade && (
                    <Badge variant="default" className="text-xs">Oportunidade</Badge>
                  )}
                  {salesMap[participant.id] && (
                    <Badge className="bg-qualification-super text-white text-xs">Venda</Badge>
                  )}
                  {participant.credenciou_dia1 && <Badge variant="outline" className="text-xs">D1</Badge>}
                  {participant.credenciou_dia2 && <Badge variant="outline" className="text-xs">D2</Badge>}
                  {participant.credenciou_dia3 && <Badge variant="outline" className="text-xs">D3</Badge>}
                </div>

                {participant.instagram && (
                  <a
                    href={(() => {
                      const clean = participant.instagram.replace("@", "").trim();
                      if (clean.startsWith("http")) return clean;
                      return `https://www.instagram.com/${clean}`;
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Instagram className="h-4 w-4" />
                    {participant.instagram}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bulk Assign Bar */}
      {isAdmin && (
        <BulkAssignBar
          selectedIds={selectedIds}
          closers={closers}
          onClear={() => setSelectedIds([])}
          onComplete={handleBulkComplete}
        />
      )}

      {/* Create Participant Dialog */}
      <CreateParticipantDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchParticipants}
      />
    </div>
  );
}
