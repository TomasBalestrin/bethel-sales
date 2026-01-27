// CSV Export utilities

interface ExportColumn<T> {
  header: string;
  accessor: (item: T) => string | number | null | undefined;
}

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  const headers = columns.map((col) => escapeCSV(col.header)).join(",");
  const rows = data.map((item) =>
    columns.map((col) => escapeCSV(col.accessor(item))).join(",")
  );
  const csv = [headers, ...rows].join("\n");

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Participant export columns
export const participantExportColumns = [
  { header: "Nome", accessor: (p: any) => p.full_name },
  { header: "Email", accessor: (p: any) => p.email },
  { header: "Telefone", accessor: (p: any) => p.phone },
  { header: "Instagram", accessor: (p: any) => p.instagram },
  { header: "Faturamento", accessor: (p: any) => p.faturamento },
  { header: "Nicho", accessor: (p: any) => p.nicho },
  { header: "Cor", accessor: (p: any) => p.cor },
  { header: "Qualificação", accessor: (p: any) => p.qualificacao },
  { header: "É Oportunidade", accessor: (p: any) => (p.is_oportunidade ? "Sim" : "Não") },
  { header: "Vezes Chamado", accessor: (p: any) => p.vezes_chamado },
  { header: "Funil Origem", accessor: (p: any) => p.funil_origem },
  { header: "Credenciou Dia 1", accessor: (p: any) => (p.credenciou_dia1 ? "Sim" : "Não") },
  { header: "Credenciou Dia 2", accessor: (p: any) => (p.credenciou_dia2 ? "Sim" : "Não") },
  { header: "Credenciou Dia 3", accessor: (p: any) => (p.credenciou_dia3 ? "Sim" : "Não") },
];

// Sales export columns
export const salesExportColumns = [
  { header: "Participante", accessor: (s: any) => s.participant_name },
  { header: "Produto", accessor: (s: any) => s.product_name },
  { header: "Valor Total", accessor: (s: any) => s.valor_total },
  { header: "Valor Entrada", accessor: (s: any) => s.valor_entrada },
  { header: "Forma Negociação", accessor: (s: any) => s.forma_negociacao },
  { header: "Closer", accessor: (s: any) => s.closer_name },
  { header: "Data", accessor: (s: any) => s.sale_date ? new Date(s.sale_date).toLocaleDateString("pt-BR") : "" },
];

// Closer performance export columns
export const closerPerformanceColumns = [
  { header: "Closer", accessor: (c: any) => c.name },
  { header: "Total Vendas", accessor: (c: any) => c.totalSales },
  { header: "Valor Total", accessor: (c: any) => c.totalValue },
  { header: "Ticket Médio", accessor: (c: any) => c.averageTicket },
  { header: "Participantes Atribuídos", accessor: (c: any) => c.assignedParticipants },
  { header: "Taxa Conversão (%)", accessor: (c: any) => c.conversionRate },
];
