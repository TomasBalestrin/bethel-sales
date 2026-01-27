import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ParticipantColor = Database["public"]["Enums"]["participant_color"];

interface CreateParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const faturamentoOptions = [
  { value: "Até R$ 5.000,00", label: "Até R$ 5.000", cor: "rosa" as ParticipantColor },
  { value: "R$ 5.000,00 até 10.000,00", label: "R$ 5.000 a R$ 10.000", cor: "preto" as ParticipantColor },
  { value: "R$ 10.000,00 até 20.000,00", label: "R$ 10.000 a R$ 20.000", cor: "azul_claro" as ParticipantColor },
  { value: "R$ 20.000,00 até 50.000,00", label: "R$ 20.000 a R$ 50.000", cor: "verde" as ParticipantColor },
  { value: "R$ 50.000,00 até 100.000,00", label: "R$ 50.000 a R$ 100.000", cor: "dourado" as ParticipantColor },
  { value: "R$ 100.000,00 até 250.000,00", label: "R$ 100.000 a R$ 250.000", cor: "laranja" as ParticipantColor },
  { value: "R$ 250.000,00 até 500.000,00", label: "R$ 250.000 a R$ 500.000", cor: "laranja" as ParticipantColor },
  { value: "Acima de R$ 500.000,00", label: "Acima de R$ 500.000", cor: "laranja" as ParticipantColor },
];

export function CreateParticipantDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateParticipantDialogProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [nicho, setNicho] = useState("");
  const [faturamento, setFaturamento] = useState("");
  const [nomeCracha, setNomeCracha] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [eventName, setEventName] = useState("");
  const [temSocio, setTemSocio] = useState(false);
  const [lucroLiquido, setLucroLiquido] = useState("");
  const [objetivoEvento, setObjetivoEvento] = useState("");
  const [maiorDificuldade, setMaiorDificuldade] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setInstagram("");
    setNicho("");
    setFaturamento("");
    setNomeCracha("");
    setCpfCnpj("");
    setEventName("");
    setTemSocio(false);
    setLucroLiquido("");
    setObjetivoEvento("");
    setMaiorDificuldade("");
  };

  const handleCreate = async () => {
    if (!name.trim() || name.trim().length < 2) {
      toast({
        variant: "destructive",
        title: "Nome obrigatório",
        description: "O nome completo deve ter pelo menos 2 caracteres.",
      });
      return;
    }

    // Email validation if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        variant: "destructive",
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
      });
      return;
    }

    setIsCreating(true);

    const selectedFaturamento = faturamentoOptions.find((f) => f.value === faturamento);

    // Clean instagram handle
    const cleanInstagram = instagram ? instagram.replace("@", "").trim() : null;

    const { error } = await supabase.from("participants").insert({
      full_name: name.trim(),
      email: email || null,
      phone: phone || null,
      instagram: cleanInstagram,
      nicho: nicho || null,
      faturamento: faturamento || null,
      cor: selectedFaturamento?.cor || null,
      nome_cracha: nomeCracha || null,
      cpf_cnpj: cpfCnpj || null,
      event_name: eventName || null,
      tem_socio: temSocio,
      lucro_liquido: lucroLiquido || null,
      objetivo_evento: objetivoEvento || null,
      maior_dificuldade: maiorDificuldade || null,
      imported_at: null, // Manual creation, not imported
    });

    setIsCreating(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar participante",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Participante criado!",
      description: "O participante foi adicionado com sucesso.",
    });

    resetForm();
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Participante</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo participante. Apenas o nome é obrigatório.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Row 1: Nome + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome Completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="João da Silva"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao@exemplo.com"
              />
            </div>
          </div>

          {/* Row 2: Telefone + Instagram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@usuario"
              />
            </div>
          </div>

          {/* Row 3: Nicho + Faturamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nicho">Nicho</Label>
              <Input
                id="nicho"
                value={nicho}
                onChange={(e) => setNicho(e.target.value)}
                placeholder="Área de atuação"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faturamento">Faturamento</Label>
              <Select value={faturamento} onValueChange={setFaturamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a faixa" />
                </SelectTrigger>
                <SelectContent>
                  {faturamentoOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Nome Crachá + CPF/CNPJ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCracha">Nome para Crachá</Label>
              <Input
                id="nomeCracha"
                value={nomeCracha}
                onChange={(e) => setNomeCracha(e.target.value)}
                placeholder="Nome no crachá"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
              <Input
                id="cpfCnpj"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          {/* Row 5: Evento + Tem Sócio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventName">Evento</Label>
              <Input
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Nome do evento"
              />
            </div>
            <div className="flex items-center justify-between space-x-2 pt-6">
              <Label htmlFor="temSocio">Tem Sócio?</Label>
              <Switch
                id="temSocio"
                checked={temSocio}
                onCheckedChange={setTemSocio}
              />
            </div>
          </div>

          {/* Row 6: Lucro Líquido + Objetivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lucroLiquido">Lucro Líquido</Label>
              <Input
                id="lucroLiquido"
                value={lucroLiquido}
                onChange={(e) => setLucroLiquido(e.target.value)}
                placeholder="Faixa de lucro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="objetivoEvento">Objetivo no Evento</Label>
              <Input
                id="objetivoEvento"
                value={objetivoEvento}
                onChange={(e) => setObjetivoEvento(e.target.value)}
                placeholder="O que espera do evento"
              />
            </div>
          </div>

          {/* Row 7: Maior Dificuldade */}
          <div className="space-y-2">
            <Label htmlFor="maiorDificuldade">Maior Dificuldade</Label>
            <Textarea
              id="maiorDificuldade"
              value={maiorDificuldade}
              onChange={(e) => setMaiorDificuldade(e.target.value)}
              placeholder="Principal desafio ou dificuldade"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Participante
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
