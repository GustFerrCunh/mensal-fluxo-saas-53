
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { TaskColumn } from "./TaskColumn";
import { TaskForm } from "./TaskForm";
import { getAuth } from "firebase/auth";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "completed";
  dueDate?: string;
  daysOfWeek?: string[];
  createdAt: string;
  updatedAt: string;
  userId: string; // Adicionado para associar a um usuário
}

export const Tarefas = () => {
  const userId = getAuth().currentUser?.uid;
  const { data: tasks, add: addTask, update: updateTask, remove: removeTask } = useFirestoreCollection("tasks");
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

  const handleCreateTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: userId // associa ao usuário
      ,
      id: ""
    };
    await addTask(newTask);
    setShowForm(false);
  };

  const handleUpdateTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    if (!editingTask) return;
    
    const updatedTask: Task = {
      ...editingTask,
      ...taskData,
      updatedAt: new Date().toISOString(),
    };
    
    await updateTask(editingTask.id, updatedTask);
    setEditingTask(null);
    setShowForm(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    await removeTask(taskId);
  };

  const handleMoveTask = async (taskId: string, newStatus: Task["status"]) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    const updatedTask: Task = {
      ...taskToUpdate,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    await updateTask(taskId, updatedTask);
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
      <div className="mb-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 capitalize leading-tight">Tarefas</h2>
        <div className="text-sm sm:text-base md:text-lg text-gray-600 mt-1 sm:mt-2">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          })}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>
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
