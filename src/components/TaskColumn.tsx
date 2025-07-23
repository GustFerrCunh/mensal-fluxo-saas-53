
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCard } from "./TaskCard";
import { Task } from "./Tarefas";

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  status: Task["status"];
  onMoveTask: (taskId: string, newStatus: Task["status"]) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskColumn = ({ 
  title, 
  tasks, 
  status,
  onMoveTask, 
  onEditTask, 
  onDeleteTask 
}: TaskColumnProps) => {
  const getColumnColor = () => {
    switch (title) {
      case "A Fazer":
        return "border-l-blue-500";
      case "Em Andamento":
        return "border-l-yellow-500";
      case "Concluído":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onMoveTask(taskId, status);
    }
  };

  const uniqueTasks = Array.from(new Map(tasks.filter(t => !!t.id).map(t => [t.id, t])).values());

  return (
    <Card 
      className={`min-h-[600px] ${getColumnColor()} border-l-4`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
            {tasks.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {uniqueTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onMoveTask={onMoveTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
        {uniqueTasks.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Nenhuma tarefa
          </div>
        )}
      </CardContent>
    </Card>
  );
};
