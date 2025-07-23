
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Calendar, Clock, GripVertical } from "lucide-react";
import { Task } from "./Tarefas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaskCardProps {
  task: Task;
  onMoveTask: (taskId: string, newStatus: Task["status"]) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskCard = ({ task, onMoveTask, onEditTask, onDeleteTask }: TaskCardProps) => {
  const getStatusOptions = () => {
    const allStatuses = [
      { value: "todo", label: "A Fazer" },
      { value: "in-progress", label: "Em Andamento" },
      { value: "completed", label: "Concluído" },
    ];
    return allStatuses.filter(status => status.value !== task.status);
  };

  const getDaysOfWeekDisplay = () => {
    if (!task.daysOfWeek || task.daysOfWeek.length === 0) return null;
    
    const dayLabels: Record<string, string> = {
      monday: "Seg",
      tuesday: "Ter",
      wednesday: "Qua",
      thursday: "Qui",
      friday: "Sex",
      saturday: "Sáb",
      sunday: "Dom",
    };
    
    return task.daysOfWeek.map(day => dayLabels[day]).join(", ");
  };

  const isOverdue = () => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== "completed";
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <Card 
      className={`p-3 hover:shadow-md transition-shadow cursor-move ${isOverdue() ? 'border-red-200 bg-red-50' : ''}`}
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-0">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-start gap-2 flex-1">
            <GripVertical className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <h4 className="font-medium text-sm line-clamp-2 flex-1">{task.title}</h4>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditTask(task)}>
                <Edit className="h-3 w-3 mr-2" />
                Editar
              </DropdownMenuItem>
              {Array.isArray(getStatusOptions()) && getStatusOptions().map((status) => (
                <DropdownMenuItem 
                  key={status.value}
                  onClick={() => onMoveTask(task.id, status.value as Task["status"])}
                >
                  Mover para {status.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem 
                onClick={() => onDeleteTask(task.id)}
                className="text-red-600"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {task.description && (
          <div className="ml-6">
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
          </div>
        )}
        
        <div className="space-y-1 ml-6">
          {task.dueDate && (
            <div className={`flex items-center text-xs ${isOverdue() ? 'text-red-600' : 'text-gray-500'}`}>
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(task.dueDate), "dd/MM/yyyy", { locale: ptBR })}
            </div>
          )}
          
          {getDaysOfWeekDisplay() && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {getDaysOfWeekDisplay()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
