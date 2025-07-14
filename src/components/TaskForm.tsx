
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Task } from "./Tarefas";

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

export const TaskForm = ({ task, onSubmit, onCancel }: TaskFormProps) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState<Task["status"]>(task?.status || "todo");
  const [dueDate, setDueDate] = useState(task?.dueDate || "");
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>(task?.daysOfWeek || []);

  const daysOptions = [
    { value: "monday", label: "Segunda-feira" },
    { value: "tuesday", label: "Terça-feira" },
    { value: "wednesday", label: "Quarta-feira" },
    { value: "thursday", label: "Quinta-feira" },
    { value: "friday", label: "Sexta-feira" },
    { value: "saturday", label: "Sábado" },
    { value: "sunday", label: "Domingo" },
  ];

  const handleDayToggle = (day: string, checked: boolean) => {
    if (checked) {
      setDaysOfWeek([...daysOfWeek, day]);
    } else {
      setDaysOfWeek(daysOfWeek.filter(d => d !== day));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      dueDate: dueDate || undefined,
      daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : undefined,
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{task ? "Editar Tarefa" : "Nova Tarefa"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: Task["status"]) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">A Fazer</SelectItem>
                  <SelectItem value="in-progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a tarefa (opcional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Dias da Semana</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {daysOptions.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.value}
                    checked={daysOfWeek.includes(day.value)}
                    onCheckedChange={(checked) => 
                      handleDayToggle(day.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={day.value} className="text-sm">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {task ? "Atualizar" : "Criar"} Tarefa
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
