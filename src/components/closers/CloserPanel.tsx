import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, TrendingUp, DollarSign, Users, Loader2 } from "lucide-react";

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

interface CloserPanelProps {
  closer: CloserStats | null;
  onClose: () => void;
  isAdmin: boolean;
}

export function CloserPanel({ closer, onClose, isAdmin }: CloserPanelProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterDay, setFilterDay] = useState<string>("all");

  useEffect(() => {
    if (closer) {
      fetchParticipants();
    }
  }, [closer]);

  const fetchParticipants = async () => {
    if (!closer) return;
    setIsLoading(true);

    const { data: assignments } = await supabase
      .from("closer_assignments")
      .select("participant_id")
      .eq("closer_id", closer.id);

    if (!assignments?.length) {
      setParticipants([]);
      setIsLoading(false);
      return;
    }

    const { data } = await supabase
      .from("participants")
      .select("id, full_name, is_oportunidade, qualificacao, credenciou_dia1, credenciou_dia2, credenciou_dia3")
      .in("id", assignments.map(a => a.participant_id));

    setParticipants(data || []);
    setIsLoading(false);
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const filteredParticipants = participants.filter(p => {
    if (filterDay === "all") return true;
    if (filterDay === "dia1") return p.credenciou_dia1;
    if (filterDay === "dia2") return p.credenciou_dia2;
    if (filterDay === "dia3") return p.credenciou_dia3;
    return true;
  });

  const oportunidades = filteredParticipants.filter(p => p.is_oportunidade);

  // Qualification counts (admin only)
  const superQualificadas = oportunidades.filter(p => p.qualificacao === "super").length;
  const medioQualificadas = oportunidades.filter(p => p.qualificacao === "medio").length;
  const baixoQualificadas = oportunidades.filter(p => p.qualificacao === "baixo").length;

  if (!closer) return null;

  return (
    <Sheet open={!!closer} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={closer.avatar_url || undefined} />
              <AvatarFallback className="text-lg">{getInitials(closer.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-xl">{closer.full_name}</SheetTitle>
              <p className="text-sm text-muted-foreground">Closer</p>
            </div>
          </div>
        </SheetHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mt-4">
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

        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Valor de Entradas</span>
            </div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(closer.valor_entradas)}</p>
          </CardContent>
        </Card>

        {/* Participants Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Participantes Atribuídos</h3>
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

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
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
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-qualification-super/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Super</p>
                    <p className="text-lg font-bold text-qualification-super">{superQualificadas}</p>
                  </div>
                  <div className="bg-qualification-medio/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Médio</p>
                    <p className="text-lg font-bold text-qualification-medio">{medioQualificadas}</p>
                  </div>
                  <div className="bg-qualification-baixo/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Baixo</p>
                    <p className="text-lg font-bold text-qualification-baixo">{baixoQualificadas}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {filteredParticipants.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
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
      </SheetContent>
    </Sheet>
  );
}
