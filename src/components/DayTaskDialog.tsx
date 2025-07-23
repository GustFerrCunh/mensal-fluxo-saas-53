
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { CalendarTask } from "./Calendario";

interface DayTaskDialogProps {
  date: string;
  tasks: CalendarTask[];
  onAddTask: (taskData: { title: string; description?: string }) => void;
  onDeleteTask: (taskId: string) => void;
  onClose: () => void;
}

export const DayTaskDialog = ({ 
  date, 
  tasks, 
  onAddTask, 
  onDeleteTask, 
  onClose 
}: DayTaskDialogProps) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
    });

    setTitle("");
    setDescription("");
    setShowForm(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {formatDate(date)}
          </DialogTitle>
          <DialogDescription>
            Gerencie as tarefas do dia selecionado. Adicione, visualize ou exclua tarefas para esta data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lista de tarefas existentes */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {Array.isArray(tasks) && Array.from(new Map(tasks.filter(t => !!t.id).map(t => [t.id, t])).values()).map((task) => (
              <Card key={task.id} className="p-3">
                <CardContent className="p-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteTask(task.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Botão para mostrar formulário */}
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Tarefa
            </Button>
          )}

          {/* Formulário para nova tarefa */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título da tarefa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição opcional"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setTitle("");
                    setDescription("");
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Adicionar
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
