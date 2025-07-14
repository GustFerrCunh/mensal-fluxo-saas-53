
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { MonthView } from "./MonthView";
import { DayTaskDialog } from "./DayTaskDialog";

export interface CalendarTask {
  id: string;
  title: string;
  description?: string;
  date: string; // formato YYYY-MM-DD
  createdAt: string;
}

export const Calendario = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [calendarTasks, setCalendarTasks] = useLocalStorage("calendarTasks", [] as CalendarTask[]);

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setShowTaskDialog(true);
  };

  const handleAddTask = (taskData: { title: string; description?: string }) => {
    if (!selectedDate) return;

    const newTask: CalendarTask = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description,
      date: selectedDate,
      createdAt: new Date().toISOString(),
    };

    setCalendarTasks([...calendarTasks, newTask]);
    setShowTaskDialog(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setCalendarTasks(calendarTasks.filter((task: CalendarTask) => task.id !== taskId));
  };

  const getTasksForDate = (date: string) => {
    return calendarTasks.filter((task: CalendarTask) => task.date === date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendário</h1>
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
