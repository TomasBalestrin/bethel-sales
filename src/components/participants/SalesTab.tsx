import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Pencil, Trash2, DollarSign } from "lucide-react";

interface Sale {
  id: string;
  product_id: string | null;
  product_name: string | null;
  valor_total: number;
  valor_entrada: number | null;
  forma_negociacao: string | null;
  sale_date: string | null;
  closer_id: string;
}

interface SalesTabProps {
  participantId: string;
  participantName: string;
  onSaleChange: () => void;
}

export function SalesTab({ participantId, participantName, onSaleChange }: SalesTabProps) {
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; price: number | null }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editProductId, setEditProductId] = useState("");
  const [editProductName, setEditProductName] = useState("");
  const [editValorTotal, setEditValorTotal] = useState("");
  const [editValorEntrada, setEditValorEntrada] = useState("");
  const [editFormaNegociacao, setEditFormaNegociacao] = useState("");

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, [participantId]);

  const fetchSales = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .eq("participant_id", participantId)
      .order("sale_date", { ascending: false });

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      setSales(data || []);
    }
    setIsLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("id, name, price").eq("is_active", true);
    setProducts(data || []);
  };

  const handleEditClick = (sale: Sale) => {
    setSelectedSale(sale);
    setEditProductId(sale.product_id || "");
    setEditProductName(sale.product_name || "");
    setEditValorTotal(String(sale.valor_total));
    setEditValorEntrada(sale.valor_entrada ? String(sale.valor_entrada) : "");
    setEditFormaNegociacao(sale.forma_negociacao || "");
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedSale) return;
    if (!editValorTotal) {
      toast({ variant: "destructive", title: "Erro", description: "Valor total é obrigatório." });
      return;
    }

    setIsSaving(true);
    const { error } = await supabase
      .from("sales")
      .update({
        product_id: editProductId || null,
        product_name: editProductName || null,
        valor_total: parseFloat(editValorTotal),
        valor_entrada: editValorEntrada ? parseFloat(editValorEntrada) : null,
        forma_negociacao: editFormaNegociacao || null,
      })
      .eq("id", selectedSale.id);

    setIsSaving(false);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
      return;
    }

    toast({ title: "Sucesso!", description: "Venda atualizada." });
    setIsEditDialogOpen(false);
    fetchSales();
    onSaleChange();
  };

  const handleConfirmDelete = async () => {
    if (!selectedSale) return;

    setIsSaving(true);
    const { error } = await supabase.from("sales").delete().eq("id", selectedSale.id);
    setIsSaving(false);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
      return;
    }

    toast({ title: "Sucesso!", description: "Venda excluída." });
    setIsDeleteDialogOpen(false);
    fetchSales();
    onSaleChange();
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const totalVendas = sales.reduce((sum, s) => sum + s.valor_total, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <DollarSign className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Nenhuma venda registrada ainda.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {sales.map((sale) => (
          <Card key={sale.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{sale.product_name || "Produto não especificado"}</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(sale.valor_total)}</p>
                  {sale.valor_entrada && (
                    <p className="text-sm text-muted-foreground">
                      Entrada: {formatCurrency(sale.valor_entrada)}
                    </p>
                  )}
                  {sale.forma_negociacao && (
                    <p className="text-sm text-muted-foreground">{sale.forma_negociacao}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{formatDate(sale.sale_date)}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(sale)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(sale)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">Total de vendas</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalVendas)}</p>
          <p className="text-xs text-muted-foreground">{sales.length} venda(s)</p>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Venda</DialogTitle>
            <DialogDescription>Atualize os dados da venda.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select
                value={editProductId}
                onValueChange={(v) => {
                  setEditProductId(v);
                  const product = products.find((p) => p.id === v);
                  if (product) setEditProductName(product.name);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
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
                value={editProductName}
                onChange={(e) => setEditProductName(e.target.value)}
                placeholder="Nome do produto"
              />
            </div>

            <div className="space-y-2">
              <Label>Valor total do contrato *</Label>
              <Input
                type="number"
                value={editValorTotal}
                onChange={(e) => setEditValorTotal(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Valor de entrada</Label>
              <Input
                type="number"
                value={editValorEntrada}
                onChange={(e) => setEditValorEntrada(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Forma de negociação</Label>
              <Textarea
                value={editFormaNegociacao}
                onChange={(e) => setEditFormaNegociacao(e.target.value)}
                placeholder="Descreva a forma de pagamento..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir venda?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A venda de{" "}
              {formatCurrency(selectedSale?.valor_total || 0)} será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
