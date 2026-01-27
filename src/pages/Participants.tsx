import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function Participants() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Participantes</h1>
        <p className="text-muted-foreground">
          Gerencie os participantes do evento
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">Nenhum participante ainda</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Os participantes serão importados via webhook do seu sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
