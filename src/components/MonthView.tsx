
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarTask } from "./Calendario";

interface MonthViewProps {
  month: string;
  monthIndex: number;
  year: number;
  onDayClick: (date: string) => void;
  getTasksForDate: (date: string) => CalendarTask[];
}

export const MonthView = ({ 
  month, 
  monthIndex, 
  year, 
  onDayClick, 
  getTasksForDate 
}: MonthViewProps) => {
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(year, monthIndex);
  const firstDay = getFirstDayOfMonth(year, monthIndex);
  
  const days = [];
  
  // Adicionar dias vazios para o início do mês
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  
  // Adicionar os dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const formatDate = (day: number) => {
    const month = (monthIndex + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-center">{month}</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid grid-cols-7 gap-1 text-xs mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center font-medium text-gray-500 p-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={index} className="h-8"></div>;
            }
            
            const dateStr = formatDate(day);
            const tasksForDay = getTasksForDate(dateStr);
            const hasEvents = tasksForDay.length > 0;
            
            return (
              <button
                key={day}
                onClick={() => onDayClick(dateStr)}
                className={`
                  h-8 text-xs rounded hover:bg-blue-100 transition-colors relative
                  ${hasEvents ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'}
                `}
              >
                <span className="block">{day}</span>
                {hasEvents && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
