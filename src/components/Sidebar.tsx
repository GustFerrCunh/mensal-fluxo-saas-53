
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Calendar, 
  DollarSign,
  CheckSquare,
  CalendarDays,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Sidebar = ({ activeSection, setActiveSection }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "produtos", label: "Produtos", icon: Package },
    { id: "clientes", label: "Clientes", icon: Users },
    { id: "mensalidades", label: "Mensalidades", icon: Calendar },
    { id: "financeiro", label: "Financeiro", icon: DollarSign },
    { id: "tarefas", label: "Tarefas", icon: CheckSquare },
    { id: "calendario", label: "Calendário", icon: CalendarDays },
  ];

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} h-screen`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-gray-800">FluxoSaaS</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                activeSection === item.id
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-5 w-5" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
