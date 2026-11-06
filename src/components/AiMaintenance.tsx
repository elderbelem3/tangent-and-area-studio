import { Wrench } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AI_MAINTENANCE_MESSAGE } from "@/lib/ai-maintenance";

export function AiMaintenanceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-primary" />IA em manutenção</DialogTitle>
        <DialogDescription>{AI_MAINTENANCE_MESSAGE}</DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>;
}