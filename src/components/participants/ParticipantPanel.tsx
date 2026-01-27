import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, Phone, Mail, Loader2, Copy, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  faturamento: number | null;
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
  webhook_data?: Record<string, unknown>;
}

interface ParticipantPanelProps {
  participant: Participant | null;
  onClose: () => void;
  onUpdate: () => void;
  closers: Array<{ id: string; full_name: string }>;
  isAdmin: boolean;
}

const colors = [
  { value: "rosa", label: "Rosa", class: "bg-participant-rosa" },
  { value: "preto", label: "Preto", class: "bg-participant-preto" },
  { value: "azul_claro", label: "Azul Claro", class: "bg-participant-azul-claro" },
  { value: "dourado", label: "Dourado", class: "bg-participant-dourado" },
  { value: "laranja", label: "Laranja", class: "bg-participant-laranja" },
];

const qualifications = [
  { value: "super", label: "Super Qualificada", class: "bg-qualification-super" },
  { value: "medio", label: "Médio Qualificada", class: "bg-qualification-medio" },
  { value: "baixo", label: "Baixo Qualificada", class: "bg-qualification-baixo" },
];

export function ParticipantPanel({ participant, onClose, onUpdate, closers, isAdmin }: ParticipantPanelProps) {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [discFormUrl, setDiscFormUrl] = useState<string | null>(null);
  const [discResponse, setDiscResponse] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [assignedCloser, setAssignedCloser] = useState<string | null>(null);

  // Form state
  const [funilOrigem, setFunilOrigem] = useState("");
  const [closerVendeuId, setCloserVendeuId] = useState("");
  const [mentoradoConvidou, setMentoradoConvidou] = useState("");
  const [acompanhante, setAcompanhante] = useState("");
  const [isOportunidade, setIsOportunidade] = useState(false);
  const [vezesChamado, setVezesChamado] = useState(0);
  const [cor, setCor] = useState("");
  const [qualificacao, setQualificacao] = useState("");

  // Sale form state
  const [products, setProducts] = useState<Array<{ id: string; name: string; price: number | null }>>([]);
  const [saleProductId, setSaleProductId] = useState("");
  const [saleProductName, setSaleProductName] = useState("");
  const [saleValorTotal, setSaleValorTotal] = useState("");
  const [saleValorEntrada, setSaleValorEntrada] = useState("");
  const [saleFormaNegociacao, setSaleFormaNegociacao] = useState("");

  useEffect(() => {
    if (participant) {
      setFunilOrigem(participant.funil_origem || "");
      setCloserVendeuId(participant.closer_vendeu_id || "");
      setMentoradoConvidou(participant.mentorado_convidou || "");
      setAcompanhante(participant.acompanhante || "");
      setIsOportunidade(participant.is_oportunidade);
      setVezesChamado(participant.vezes_chamado);
      setCor(participant.cor || "");
      setQualificacao(participant.qualificacao || "");
      
      fetchProducts();
      fetchDiscData();
      fetchAssignment();
    }
  }, [participant]);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("id, name, price").eq("is_active", true);
    setProducts(data || []);
  };

  const fetchDiscData = async () => {
    if (!participant) return;
    
    const { data: form } = await supabase
      .from("disc_forms")
      .select("id, form_token")
      .eq("participant_id", participant.id)
      .single();

    if (form) {
      setDiscFormUrl(`${window.location.origin}/disc/${form.form_token}`);
      
      const { data: response } = await supabase
        .from("disc_responses")
        .select("*")
        .eq("form_id", form.id)
        .single();
      
      setDiscResponse(response);
    } else {
      setDiscFormUrl(null);
      setDiscResponse(null);
    }
  };

  const fetchAssignment = async () => {
    if (!participant) return;
    
    const { data } = await supabase
      .from("closer_assignments")
      .select("closer_id")
      .eq("participant_id", participant.id)
      .single();
    
    setAssignedCloser(data?.closer_id || null);
  };

  const handleSave = async () => {
    if (!participant) return;
    setIsLoading(true);

    const updateData: Record<string, unknown> = {
      funil_origem: funilOrigem || null,
      closer_vendeu_id: closerVendeuId || null,
      mentorado_convidou: mentoradoConvidou || null,
      acompanhante: acompanhante || null,
      is_oportunidade: isOportunidade,
      vezes_chamado: vezesChamado,
      cor: cor || null,
    };

    if (isAdmin && qualificacao) {
      updateData.qualificacao = qualificacao;
    }

    const { error } = await supabase
      .from("participants")
      .update(updateData)
      .eq("id", participant.id);

    setIsLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
      return;
    }

    toast({ title: "Salvo!", description: "Dados atualizados com sucesso." });
    onUpdate();
  };

  const handleGenerateForm = async () => {
    if (!participant) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("disc_forms")
      .insert({ participant_id: participant.id })
      .select("form_token")
      .single();

    setIsLoading(false);

    if (error) {
      if (error.code === "23505") {
        toast({ variant: "destructive", title: "Formulário já existe", description: "Este participante já tem um formulário." });
      } else {
        toast({ variant: "destructive", title: "Erro", description: error.message });
      }
      return;
    }

    const url = `${window.location.origin}/disc/${data.form_token}`;
    setDiscFormUrl(url);
    toast({ title: "Formulário gerado!", description: "Link copiado para a área de transferência." });
    navigator.clipboard.writeText(url);
  };

  const handleCopyLink = () => {
    if (discFormUrl) {
      navigator.clipboard.writeText(discFormUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAssignCloser = async (closerId: string) => {
    if (!participant || !profile) return;
    setIsLoading(true);

    // Remove existing assignment
    await supabase.from("closer_assignments").delete().eq("participant_id", participant.id);

    // Create new assignment
    const { error } = await supabase.from("closer_assignments").insert({
      participant_id: participant.id,
      closer_id: closerId,
      assigned_by: profile.id,
    });

    setIsLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
      return;
    }

    setAssignedCloser(closerId);
    setIsAssignDialogOpen(false);
    toast({ title: "Closer atribuído!", description: "O participante foi atribuído ao closer." });
  };

  const handleCreateSale = async () => {
    if (!participant || !profile) return;
    if (!saleValorTotal) {
      toast({ variant: "destructive", title: "Erro", description: "Valor total é obrigatório." });
      return;
    }

    setIsLoading(true);

    const closerId = assignedCloser || profile.id;

    const { error } = await supabase.from("sales").insert({
      participant_id: participant.id,
      closer_id: closerId,
      product_id: saleProductId || null,
      product_name: saleProductName || null,
      valor_total: parseFloat(saleValorTotal),
      valor_entrada: saleValorEntrada ? parseFloat(saleValorEntrada) : null,
      forma_negociacao: saleFormaNegociacao || null,
    });

    setIsLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
      return;
    }

    toast({ title: "Venda registrada!", description: "A venda foi salva com sucesso." });
    setIsSaleDialogOpen(false);
    setSaleProductId("");
    setSaleProductName("");
    setSaleValorTotal("");
    setSaleValorEntrada("");
    setSaleFormaNegociacao("");
    onUpdate();
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const assignedCloserName = closers.find(c => c.id === assignedCloser)?.full_name;

  if (!participant) return null;

  return (
    <>
      <Sheet open={!!participant} onOpenChange={() => onClose()}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="pb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={participant.photo_url || undefined} />
                <AvatarFallback className="text-lg">{getInitials(participant.full_name)}</AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-xl">{participant.full_name}</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  {participant.credenciou_dia1 && <Badge variant="outline">Dia 1</Badge>}
                  {participant.credenciou_dia2 && <Badge variant="outline">Dia 2</Badge>}
                  {participant.credenciou_dia3 && <Badge variant="outline">Dia 3</Badge>}
                </div>
              </div>
            </div>
          </SheetHeader>

          <Tabs defaultValue="dados" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="disc">DISC</TabsTrigger>
              <TabsTrigger value="acoes">Ações</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-4 mt-4">
              {/* Contact info */}
              <div className="flex flex-wrap gap-3">
                {participant.email && (
                  <a href={`mailto:${participant.email}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                    <Mail className="h-4 w-4" /> {participant.email}
                  </a>
                )}
                {participant.phone && (
                  <a href={`tel:${participant.phone}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                    <Phone className="h-4 w-4" /> {participant.phone}
                  </a>
                )}
                {participant.instagram && (
                  <a
                    href={`https://instagram.com/${participant.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
                  >
                    <Instagram className="h-4 w-4" /> {participant.instagram}
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-muted-foreground">Faturamento</p>
                  <p className="font-semibold">{formatCurrency(participant.faturamento)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-muted-foreground">Nicho</p>
                  <p className="font-semibold">{participant.nicho || "-"}</p>
                </div>
              </div>

              {assignedCloserName && (
                <div className="bg-primary/10 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Closer atribuído</p>
                  <p className="font-semibold">{assignedCloserName}</p>
                </div>
              )}

              {/* Manual fields */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Informações manuais</h4>

                <div className="space-y-2">
                  <Label>Funil de origem</Label>
                  <Input value={funilOrigem} onChange={(e) => setFunilOrigem(e.target.value)} placeholder="Ex: Lançamento, Orgânico..." />
                </div>

                <div className="space-y-2">
                  <Label>Closer que vendeu/convidou</Label>
                  <Select value={closerVendeuId} onValueChange={setCloserVendeuId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {closers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mentorado que convidou</Label>
                  <Input value={mentoradoConvidou} onChange={(e) => setMentoradoConvidou(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Acompanhante</Label>
                  <Input value={acompanhante} onChange={(e) => setAcompanhante(e.target.value)} />
                </div>

                <div className="flex items-center justify-between">
                  <Label>É uma oportunidade?</Label>
                  <Switch checked={isOportunidade} onCheckedChange={setIsOportunidade} />
                </div>

                <div className="space-y-2">
                  <Label>Quantas vezes foi chamado?</Label>
                  <Select value={String(vezesChamado)} onValueChange={(v) => setVezesChamado(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4].map(n => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="flex gap-2">
                    {colors.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setCor(cor === c.value ? "" : c.value)}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all",
                          c.class,
                          cor === c.value ? "ring-2 ring-offset-2 ring-primary" : "opacity-60 hover:opacity-100"
                        )}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                {isAdmin && (
                  <div className="space-y-2">
                    <Label>Qualificação da oportunidade</Label>
                    <Select value={qualificacao} onValueChange={setQualificacao}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Não definida</SelectItem>
                        {qualifications.map(q => (
                          <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button onClick={handleSave} disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Salvar alterações
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="disc" className="mt-4 space-y-4">
              {!discFormUrl ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground mb-4">Nenhum formulário DISC gerado ainda.</p>
                    <Button onClick={handleGenerateForm} disabled={isLoading}>
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Gerar Formulário DISC
                    </Button>
                  </CardContent>
                </Card>
              ) : !discResponse ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Link do formulário</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input value={discFormUrl} readOnly className="text-sm" />
                      <Button variant="outline" size="icon" onClick={handleCopyLink}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <a href={discFormUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Aguardando resposta do participante...
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        Perfil DISC
                        <Badge variant="secondary" className="text-lg">{discResponse.disc_profile}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{discResponse.disc_description}</p>
                    </CardContent>
                  </Card>

                  {discResponse.sales_insights && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Insights para Venda</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{discResponse.sales_insights}</p>
                      </CardContent>
                    </Card>
                  )}

                  {discResponse.objecoes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Possíveis Objeções</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{discResponse.objecoes}</p>
                      </CardContent>
                    </Card>
                  )}

                  {discResponse.contorno_objecoes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Como Contornar</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{discResponse.contorno_objecoes}</p>
                      </CardContent>
                    </Card>
                  )}

                  {discResponse.exemplos_fechamento && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Exemplos de Fechamento</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{discResponse.exemplos_fechamento}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="acoes" className="mt-4 space-y-4">
              {isAdmin && (
                <Button onClick={() => setIsAssignDialogOpen(true)} variant="outline" className="w-full">
                  Atribuir Closer
                </Button>
              )}
              <Button onClick={() => setIsSaleDialogOpen(true)} className="w-full bg-qualification-super hover:bg-qualification-super/90">
                💰 Venda Realizada
              </Button>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Assign Closer Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Closer</DialogTitle>
            <DialogDescription>
              Selecione o closer responsável por este participante.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {closers.map(closer => (
              <Button
                key={closer.id}
                variant={assignedCloser === closer.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleAssignCloser(closer.id)}
              >
                {closer.full_name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sale Dialog */}
      <Dialog open={isSaleDialogOpen} onOpenChange={setIsSaleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Venda</DialogTitle>
            <DialogDescription>
              Preencha os dados da venda realizada para {participant.full_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select value={saleProductId} onValueChange={(v) => {
                setSaleProductId(v);
                const product = products.find(p => p.id === v);
                if (product) {
                  setSaleProductName(product.name);
                  if (product.price) setSaleValorTotal(String(product.price));
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {p.price && `- ${formatCurrency(p.price)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ou digite o nome do produto</Label>
              <Input
                value={saleProductName}
                onChange={(e) => setSaleProductName(e.target.value)}
                placeholder="Nome do produto"
              />
            </div>

            <div className="space-y-2">
              <Label>Valor total do contrato *</Label>
              <Input
                type="number"
                value={saleValorTotal}
                onChange={(e) => setSaleValorTotal(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Valor de entrada</Label>
              <Input
                type="number"
                value={saleValorEntrada}
                onChange={(e) => setSaleValorEntrada(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Forma de negociação</Label>
              <Textarea
                value={saleFormaNegociacao}
                onChange={(e) => setSaleFormaNegociacao(e.target.value)}
                placeholder="Descreva a forma de pagamento..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSale} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Registrar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
