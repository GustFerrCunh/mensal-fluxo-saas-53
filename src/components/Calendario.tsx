
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MonthView } from "./MonthView";
import { DayTaskDialog } from "./DayTaskDialog";
import { getAuth } from "firebase/auth";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";

export interface CalendarTask {
  id: string;
  title: string;
  description?: string;
  date: string; // formato YYYY-MM-DD
  createdAt: string;
  userId: string; // Adicionado para associar ao usuário
}

export const Calendario = () => {
  const userId = getAuth().currentUser?.uid;
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const { data: calendarTasks, add: addCalendarTask } = useFirestoreCollection("calendarTasks");
  // Adicionar acesso ao localStorage de tasks do sistema
  const { data: tasks, add: addTask } = useFirestoreCollection("tasks");

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setShowTaskDialog(true);
  };

  const handleAddTask = async (taskData: { title: string; description?: string }) => {
    if (!selectedDate) return;
    const newTask = {
      title: taskData.title,
      description: taskData.description,
      date: selectedDate,
      createdAt: new Date().toISOString(),
    };
    await addCalendarTask(newTask);
    // Também salva como tarefa do sistema (aba Tarefas)
    const newSystemTask = {
      title: newTask.title,
      description: newTask.description,
      status: "todo",
      createdAt: newTask.createdAt,
      updatedAt: newTask.createdAt,
    };
    await addTask(newSystemTask);
  };

  const handleDeleteTask = (taskId: string) => {
    // This function will need to be updated to use Firestore
    // For now, it will just remove from the current view, not persist
    // setCalendarTasks(calendarTasks.filter((task: CalendarTask) => task.id !== taskId));
  };

  const getTasksForDate = (date: string) => {
    return calendarTasks.filter((task: CalendarTask) => task.date === date);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 capitalize leading-tight">Calendário</h2>
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
          <p className="text-gray-600 mt-2">Visualize e gerencie suas tarefas por data</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentYear(currentYear - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xl font-semibold min-w-[100px] text-center">
            {currentYear}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentYear(currentYear + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map((month, index) => (
          <MonthView
            key={month}
            month={month}
            monthIndex={index}
            year={currentYear}
            onDayClick={handleDayClick}
            getTasksForDate={getTasksForDate}
          />
        ))}
      </div>

      {showTaskDialog && selectedDate && (
        <DayTaskDialog
          date={selectedDate}
          tasks={getTasksForDate(selectedDate)}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
          onClose={() => setShowTaskDialog(false)}
        />
      )}
    </div>
  );
};
