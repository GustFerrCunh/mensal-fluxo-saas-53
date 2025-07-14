
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { TaskColumn } from "./TaskColumn";
import { TaskForm } from "./TaskForm";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "completed";
  dueDate?: string;
  daysOfWeek?: string[];
  createdAt: string;
  updatedAt: string;
}

export const Tarefas = () => {
  const [tasks, setTasks] = useLocalStorage("tasks", [] as Task[]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const columns = [
    { id: "todo", title: "A Fazer", status: "todo" as const },
    { id: "in-progress", title: "Em Andamento", status: "in-progress" as const },
    { id: "completed", title: "Concluído", status: "completed" as const },
  ];

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task: Task) => task.status === status);
  };

  const handleCreateTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
    setShowForm(false);
  };

  const handleUpdateTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    if (!editingTask) return;
    
    const updatedTask: Task = {
      ...editingTask,
      ...taskData,
      updatedAt: new Date().toISOString(),
    };
    
    setTasks(tasks.map((task: Task) => 
      task.id === editingTask.id ? updatedTask : task
    ));
    setEditingTask(null);
    setShowForm(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task: Task) => task.id !== taskId));
  };

  const handleMoveTask = (taskId: string, newStatus: Task["status"]) => {
    setTasks(tasks.map((task: Task) => 
      task.id === taskId 
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        : task
    ));
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-600 mt-2">Gerencie suas tarefas por fases - arraste e solte para mover</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={handleCloseForm}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            title={column.title}
            status={column.status}
            tasks={getTasksByStatus(column.status)}
            onMoveTask={handleMoveTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        ))}
      </div>
    </div>
  );
};
