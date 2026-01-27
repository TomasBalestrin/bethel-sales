import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Users, Loader2 } from "lucide-react";

interface BulkAssignBarProps {
  selectedIds: string[];
  closers: Array<{ id: string; full_name: string }>;
  onClear: () => void;
  onComplete: () => void;
}

export function BulkAssignBar({ selectedIds, closers, onClear, onComplete }: BulkAssignBarProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedCloser, setSelectedCloser] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedCloser || !profile) {
      toast({ variant: "destructive", title: "Erro", description: "Selecione um closer." });
      return;
    }

    setIsAssigning(true);

    try {
      // Remove existing assignments for selected participants
      await supabase
        .from("closer_assignments")
        .delete()
        .in("participant_id", selectedIds);

      // Create new assignments
      const newAssignments = selectedIds.map((participantId) => ({
        participant_id: participantId,
        closer_id: selectedCloser,
        assigned_by: profile.id,
      }));

      const { error } = await supabase.from("closer_assignments").insert(newAssignments);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `${selectedIds.length} participantes atribuídos ao closer.`,
      });

      setSelectedCloser("");
      onComplete();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsAssigning(false);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg p-4 flex items-center gap-4 z-50 animate-fade-in">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Users className="h-4 w-4" />
        <span>{selectedIds.length} selecionado(s)</span>
      </div>

      <Select value={selectedCloser} onValueChange={setSelectedCloser}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Selecionar closer" />
        </SelectTrigger>
        <SelectContent>
          {closers.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={handleAssign} disabled={isAssigning || !selectedCloser}>
        {isAssigning && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Atribuir
      </Button>

      <Button variant="ghost" size="icon" onClick={onClear}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
