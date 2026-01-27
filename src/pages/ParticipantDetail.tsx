import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Loader2, Copy, Check, ExternalLink, ArrowLeft } from "lucide-react";
import { SalesTab } from "@/components/participants/SalesTab";
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

const colors = [
  { value: "rosa", label: "Rosa", class: "bg-participant-rosa" },
  { value: "preto", label: "Preto", class: "bg-participant-preto" },
  { value: "azul_claro", label: "Azul Claro", class: "bg-participant-azul-claro" },
  { value: "verde", label: "Verde", class: "bg-participant-verde" },
  { value: "dourado", label: "Dourado", class: "bg-participant-dourado" },
  { value: "laranja", label: "Laranja", class: "bg-participant-laranja" },
];

const qualifications = [
  { value: "super", label: "Super Qualificada", class: "bg-qualification-super" },
  { value: "medio", label: "Médio Qualificada", class: "bg-qualification-medio" },
  { value: "baixo", label: "Baixo Qualificada", class: "bg-qualification-baixo" },
];

const faturamentoOptions = [
  { value: "Até R$ 5.000,00", label: "Até R$ 5.000", cor: "rosa" },
  { value: "R$ 5.000,00 até 10.000,00", label: "R$ 5.000 a R$ 10.000", cor: "preto" },
  { value: "R$ 10.000,00 até 20.000,00", label: "R$ 10.000 a R$ 20.000", cor: "azul_claro" },
  { value: "R$ 20.000,00 até 50.000,00", label: "R$ 20.000 a R$ 50.000", cor: "verde" },
  { value: "R$ 50.000,00 até 100.000,00", label: "R$ 50.000 a R$ 100.000", cor: "dourado" },
  { value: "R$ 100.000,00 até 250.000,00", label: "R$ 100.000 a R$ 250.000", cor: "laranja" },
  { value: "R$ 250.000,00 até 500.000,00", label: "R$ 250.000 a R$ 500.000", cor: "laranja" },
  { value: "Acima de R$ 500.000,00", label: "Acima de R$ 500.000", cor: "laranja" },
];

export default function ParticipantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, isAdmin } = useAuth();
  
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [closers, setClosers] = useState<Array<{ id: string; full_name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [discFormUrl, setDiscFormUrl] = useState<string | null>(null);
  const [discResponse, setDiscResponse] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [assignedCloser, setAssignedCloser] = useState<string | null>(null);

  // ============ EDITABLE FORM STATES ============
  // Dados Básicos
  const [fullName, setFullName] = useState("");
  const [nomeCracha, setNomeCracha] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [eventName, setEventName] = useState("");

  // Contato
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");

  // Negócio
  const [nicho, setNicho] = useState("");
  const [faturamento, setFaturamento] = useState("");
  const [lucroLiquido, setLucroLiquido] = useState("");
  const [temSocio, setTemSocio] = useState(false);

  // Objetivos
  const [objetivoEvento, setObjetivoEvento] = useState("");
  const [maiorDificuldade, setMaiorDificuldade] = useState("");

  // Credenciamento
  const [credenciouDia1, setCredenciouDia1] = useState(false);
  const [credenciouDia2, setCredenciouDia2] = useState(false);
  const [credenciouDia3, setCredenciouDia3] = useState(false);
  const [aceitouTermoImagem, setAceitouTermoImagem] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState("");

  // Informações de Venda
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
    if (id) {
      fetchParticipant();
      fetchClosers();
    }
  }, [id]);

  const fetchParticipant = async () => {
    if (!id) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      setIsLoading(false);
      return;
    }

    setParticipant(data);
    
    // Carregar todos os estados editáveis
    setFullName(data.full_name || "");
    setNomeCracha(data.nome_cracha || "");
    setCpfCnpj(data.cpf_cnpj || "");
    setEventName(data.event_name || "");
    setEmail(data.email || "");
    setPhone(data.phone || "");
    setInstagram(data.instagram || "");
    setNicho(data.nicho || "");
    setFaturamento(data.faturamento || "");
    setLucroLiquido(data.lucro_liquido || "");
    setTemSocio(data.tem_socio || false);
    setObjetivoEvento(data.objetivo_evento || "");
    setMaiorDificuldade(data.maior_dificuldade || "");
    setCredenciouDia1(data.credenciou_dia1 || false);
    setCredenciouDia2(data.credenciou_dia2 || false);
    setCredenciouDia3(data.credenciou_dia3 || false);
    setAceitouTermoImagem(data.aceitou_termo_imagem || false);
    setRegistrationStatus(data.registration_status || "");
    setFunilOrigem(data.funil_origem || "");
    setCloserVendeuId(data.closer_vendeu_id || "");
    setMentoradoConvidou(data.mentorado_convidou || "");
    setAcompanhante(data.acompanhante || "");
    setIsOportunidade(data.is_oportunidade || false);
    setVezesChamado(data.vezes_chamado || 0);
    setCor(data.cor || "");
    setQualificacao(data.qualificacao || "");

    await Promise.all([fetchProducts(), fetchDiscData(id), fetchAssignment(id)]);
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

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("id, name, price").eq("is_active", true);
    setProducts(data || []);
  };

  const fetchDiscData = async (participantId: string) => {
    const { data: form } = await supabase
      .from("disc_forms")
      .select("id, form_token, short_code")
      .eq("participant_id", participantId)
      .maybeSingle();

    if (form) {
      // Use short_code if available, otherwise fallback to form_token
      const code = form.short_code || form.form_token;
      const route = form.short_code ? 'teste' : 'disc';
      setDiscFormUrl(`${window.location.origin}/${route}/${code}`);
      
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

  const fetchAssignment = async (participantId: string) => {
    const { data } = await supabase
      .from("closer_assignments")
      .select("closer_id")
      .eq("participant_id", participantId)
      .single();
    
    setAssignedCloser(data?.closer_id || null);
  };

  const handleSave = async () => {
    if (!participant) return;

    // Validação do nome
    if (!fullName.trim() || fullName.trim().length < 2) {
      toast({ variant: "destructive", title: "Nome obrigatório", description: "O nome deve ter pelo menos 2 caracteres." });
      return;
    }

    setIsSaving(true);

    // Determinar cor automática se faturamento mudou
    const selectedFaturamento = faturamentoOptions.find(f => f.value === faturamento);
    const autoColor = selectedFaturamento?.cor || cor || null;

    const updateData: Record<string, unknown> = {
      full_name: fullName.trim(),
      nome_cracha: nomeCracha || null,
      cpf_cnpj: cpfCnpj || null,
      event_name: eventName || null,
      email: email || null,
      phone: phone || null,
      instagram: instagram ? instagram.replace("@", "").trim() : null,
      nicho: nicho || null,
      faturamento: faturamento || null,
      cor: autoColor,
      lucro_liquido: lucroLiquido || null,
      tem_socio: temSocio,
      objetivo_evento: objetivoEvento || null,
      maior_dificuldade: maiorDificuldade || null,
      credenciou_dia1: credenciouDia1,
      credenciou_dia2: credenciouDia2,
      credenciou_dia3: credenciouDia3,
      aceitou_termo_imagem: aceitouTermoImagem,
      registration_status: registrationStatus || null,
      funil_origem: funilOrigem || null,
      closer_vendeu_id: closerVendeuId || null,
      mentorado_convidou: mentoradoConvidou || null,
      acompanhante: acompanhante || null,
      is_oportunidade: isOportunidade,
      vezes_chamado: vezesChamado,
    };

    if (isAdmin && qualificacao) {
      updateData.qualificacao = qualificacao;
    }

    const { error } = await supabase
      .from("participants")
      .update(updateData)
      .eq("id", participant.id);

    setIsSaving(false);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
      return;
    }

    toast({ title: "Salvo!", description: "Dados atualizados com sucesso." });
    fetchParticipant();
  };

  const handleGenerateForm = async () => {
    if (!participant) return;
    setIsSaving(true);

    const { data, error } = await supabase
      .from("disc_forms")
      .insert({ participant_id: participant.id })
      .select("form_token, short_code")
      .single();

    setIsSaving(false);

    if (error) {
      if (error.code === "23505") {
        toast({ variant: "destructive", title: "Formulário já existe", description: "Este participante já tem um formulário." });
      } else {
        toast({ variant: "destructive", title: "Erro", description: error.message });
      }
      return;
    }

    // Use the new short_code for friendly URLs
    const url = `${window.location.origin}/teste/${data.short_code}`;
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
    setIsSaving(true);

    await supabase.from("closer_assignments").delete().eq("participant_id", participant.id);

    const { error } = await supabase.from("closer_assignments").insert({
      participant_id: participant.id,
      closer_id: closerId,
      assigned_by: profile.id,
    });

    setIsSaving(false);

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

    setIsSaving(true);

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

    setIsSaving(false);

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
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const assignedCloserName = closers.find(c => c.id === assignedCloser)?.full_name;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate("/participantes")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Participante não encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button variant="ghost" size="sm" onClick={() => navigate("/participantes")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <span>/</span>
        <span className="font-medium text-foreground">{participant.full_name}</span>
      </div>

      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={participant.photo_url || undefined} />
          <AvatarFallback className="text-xl">{getInitials(fullName || participant.full_name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{fullName || participant.full_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {credenciouDia1 && <Badge variant="outline">Dia 1</Badge>}
            {credenciouDia2 && <Badge variant="outline">Dia 2</Badge>}
            {credenciouDia3 && <Badge variant="outline">Dia 3</Badge>}
          </div>
        </div>
      </div>

      <Tabs defaultValue="dados">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="disc">DISC</TabsTrigger>
          <TabsTrigger value="acoes">Ações</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-6 mt-6">
          {/* Assigned Closer */}
          {assignedCloserName && (
            <div className="bg-primary/10 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">Closer atribuído</p>
              <p className="font-semibold">{assignedCloserName}</p>
            </div>
          )}

          {/* Dados Básicos */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Dados Básicos</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nome completo" />
                </div>
                <div className="space-y-2">
                  <Label>Nome p/ Crachá</Label>
                  <Input value={nomeCracha} onChange={(e) => setNomeCracha(e.target.value)} placeholder="Nome para crachá" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CPF/CNPJ</Label>
                  <Input value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} placeholder="CPF ou CNPJ" />
                </div>
                <div className="space-y-2">
                  <Label>Evento</Label>
                  <Input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Nome do evento" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Contato</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@usuario" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Negócio */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Dados do Negócio</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 space-y-4">
              <div className="space-y-2">
                <Label>Nicho</Label>
                <Input value={nicho} onChange={(e) => setNicho(e.target.value)} placeholder="Ex: E-commerce, Coaching..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Faturamento</Label>
                  <Select value={faturamento || "__none__"} onValueChange={(v) => setFaturamento(v === "__none__" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Não informado</SelectItem>
                      {faturamentoOptions.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lucro Líquido</Label>
                  <Input value={lucroLiquido} onChange={(e) => setLucroLiquido(e.target.value)} placeholder="Lucro líquido mensal" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Tem Sócio?</Label>
                <Switch checked={temSocio} onCheckedChange={setTemSocio} />
              </div>
            </CardContent>
          </Card>

          {/* Objetivos e Desafios */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Objetivos e Desafios</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 space-y-4">
              <div className="space-y-2">
                <Label>Objetivo no Evento</Label>
                <Textarea value={objetivoEvento} onChange={(e) => setObjetivoEvento(e.target.value)} placeholder="O que espera alcançar no evento..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Maior Dificuldade</Label>
                <Textarea value={maiorDificuldade} onChange={(e) => setMaiorDificuldade(e.target.value)} placeholder="Principal desafio atual..." rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* Informações de Venda */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Informações de Venda</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Funil de origem</Label>
                  <Input value={funilOrigem} onChange={(e) => setFunilOrigem(e.target.value)} placeholder="Ex: Lançamento, Orgânico..." />
                </div>
                <div className="space-y-2">
                  <Label>Closer que vendeu/convidou</Label>
                  <Select value={closerVendeuId || "__none__"} onValueChange={(v) => setCloserVendeuId(v === "__none__" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Nenhum</SelectItem>
                      {closers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mentorado que convidou</Label>
                  <Input value={mentoradoConvidou} onChange={(e) => setMentoradoConvidou(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Acompanhante</Label>
                  <Input value={acompanhante} onChange={(e) => setAcompanhante(e.target.value)} />
                </div>
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
                  <Select value={qualificacao || "__none__"} onValueChange={(v) => setQualificacao(v === "__none__" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Não definida</SelectItem>
                      {qualifications.map(q => (
                        <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Credenciamento */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Credenciamento</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <Label>Dia 1</Label>
                  <Switch checked={credenciouDia1} onCheckedChange={setCredenciouDia1} />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <Label>Dia 2</Label>
                  <Switch checked={credenciouDia2} onCheckedChange={setCredenciouDia2} />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <Label>Dia 3</Label>
                  <Switch checked={credenciouDia3} onCheckedChange={setCredenciouDia3} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Aceitou termo de imagem</Label>
                <Switch checked={aceitouTermoImagem} onCheckedChange={setAceitouTermoImagem} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Input value={registrationStatus} onChange={(e) => setRegistrationStatus(e.target.value)} placeholder="Status de registro" />
              </div>
            </CardContent>
          </Card>

          {/* Botão Salvar */}
          <Button onClick={handleSave} disabled={isSaving} className="w-full" size="lg">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Salvar Alterações
          </Button>
        </TabsContent>

        <TabsContent value="vendas" className="mt-6">
          <SalesTab 
            participantId={participant.id}
            participantName={participant.full_name}
            onSaleChange={fetchParticipant}
          />
        </TabsContent>

        <TabsContent value="disc" className="mt-6 space-y-4">
          {!discFormUrl ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">Nenhum formulário DISC gerado ainda.</p>
                <Button onClick={handleGenerateForm} disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
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

        <TabsContent value="acoes" className="mt-6 space-y-4">
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
            <Button onClick={handleCreateSale} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Registrar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
