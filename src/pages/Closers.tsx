import { Card, CardContent } from "@/components/ui/card";
import { UserCog } from "lucide-react";

export default function Closers() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Closers</h1>
        <p className="text-muted-foreground">
          Visualize a performance dos closers
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <UserCog className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">Nenhum closer cadastrado</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Cadastre closers no Painel Admin para vê-los aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
