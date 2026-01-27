import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Filter, X, Loader2, Pencil, Trash2, DollarSign, TrendingUp, Download } from "lucide-react";
import { exportToCSV, salesExportColumns } from "@/lib/export";

interface Sale {
  id: string;
  participant_id: string;
  closer_id: string;
  product_id: string | null;
  product_name: string | null;
  valor_total: number;
  valor_entrada: number | null;
  forma_negociacao: string | null;
  sale_date: string | null;
  participant?: { full_name: string };
  closer?: { full_name: string };
}

export default function Sales() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCloser, setFilterCloser] = useState<string>("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [closers, setClosers] = useState<Array<{ id: string; full_name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; price: number | null }>>([]);

  // Edit state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editProductId, setEditProductId] = useState("");
  const [editProductName, setEditProductName] = useState("");
  const [editValorTotal, setEditValorTotal] = useState("");
  const [editValorEntrada, setEditValorEntrada] = useState("");
  const [editFormaNegociacao, setEditFormaNegociacao] = useState("");

  const fetchSales = async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from("sales")
      .select(`
        *,
        participant:participants(full_name),
        closer:profiles!sales_closer_id_fkey(full_name)
      `)
      .order("sale_date", { ascending: false });

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      setSales(data || []);
    }
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
      .in("user_id", roles.map((r) => r.user_id));

    setClosers(profiles || []);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("id, name, price");
    setProducts(data || []);
  };

  useEffect(() => {
    fetchSales();
    fetchClosers();
    fetchProducts();
  }, []);

  const filteredSales = sales.filter((s) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        s.participant?.full_name?.toLowerCase().includes(term) ||
        s.product_name?.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    if (isAdmin && filterCloser !== "all" && s.closer_id !== filterCloser) return false;
    if (filterProduct !== "all" && s.product_id !== filterProduct) return false;

    return true;
  });

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const totalVendas = filteredSales.reduce((sum, s) => sum + s.valor_total, 0);
  const totalEntradas = filteredSales.reduce((sum, s) => sum + (s.valor_entrada || 0), 0);
  const ticketMedio = filteredSales.length > 0 ? totalVendas / filteredSales.length : 0;

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
  };

  const handleExport = () => {
    const exportData = filteredSales.map((s) => ({
      participant_name: s.participant?.full_name || "",
      product_name: s.product_name || "",
      valor_total: s.valor_total,
      valor_entrada: s.valor_entrada,
      forma_negociacao: s.forma_negociacao,
      closer_name: s.closer?.full_name || "",
      sale_date: s.sale_date,
    }));
    exportToCSV(exportData, salesExportColumns, "vendas");
    toast({ title: "Exportado!", description: "Arquivo CSV gerado com sucesso." });
  };

  const clearFilters = () => {
    setFilterCloser("all");
    setFilterProduct("all");
    setSearchTerm("");
  };

  const hasActiveFilters = filterCloser !== "all" || filterProduct !== "all" || searchTerm;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendas</h1>
          <p className="text-muted-foreground">
            {filteredSales.length} de {sales.length} vendas
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total em Vendas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalVendas)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total em Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEntradas)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(ticketMedio)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por participante ou produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />

          {isAdmin && (
            <Select value={filterCloser} onValueChange={setFilterCloser}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Closer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os closers</SelectItem>
                {closers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={filterProduct} onValueChange={setFilterProduct}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Produto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os produtos</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
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

      {/* Sales Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredSales.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <DollarSign className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Nenhuma venda encontrada</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {searchTerm || hasActiveFilters
                ? "Tente ajustar os filtros de busca."
                : "As vendas aparecerão aqui quando forem registradas."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participante</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Closer</TableHead>
                <TableHead>Data</TableHead>
                {isAdmin && <TableHead className="w-20">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">
                    {sale.participant?.full_name || "-"}
                  </TableCell>
                  <TableCell>{sale.product_name || "-"}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    {formatCurrency(sale.valor_total)}
                  </TableCell>
                  <TableCell>{formatCurrency(sale.valor_entrada)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{sale.closer?.full_name || "-"}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(sale.sale_date)}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(sale)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(sale)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

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
    </div>
  );
}
