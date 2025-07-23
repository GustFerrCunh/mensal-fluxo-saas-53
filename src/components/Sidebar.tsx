
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
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  activeSection?: string;
  setActiveSection?: (section: string) => void;
  openSidebar?: boolean;
  setOpenSidebar?: (open: boolean) => void;
}

export const Sidebar = ({ activeSection, setActiveSection, openSidebar, setOpenSidebar }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);

  // Sincronizar abertura externa
  useEffect(() => {
    if (typeof openSidebar === 'boolean') {
      setOpenMobile(openSidebar);
    }
  }, [openSidebar]);

  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "produtos", label: "Produtos", icon: Package },
    { id: "clientes", label: "Clientes", icon: Users },
    { id: "mensalidades", label: "Mensalidades", icon: Calendar },
    { id: "financeiro", label: "Financeiro", icon: DollarSign },
    { id: "tarefas", label: "Tarefas", icon: CheckSquare },
    { id: "calendario", label: "Calendário", icon: CalendarDays },
    { id: "perfil", label: "Perfil", icon: Users },
  ];

  return (
    <>
      {/* Sidebar como Drawer no mobile, agora do lado direito e empurrando o conteúdo */}
      {isMobile ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 right-4 z-50 md:hidden"
            onClick={() => {
              setOpenMobile(true);
              setOpenSidebar && setOpenSidebar(true);
            }}
          >
            <Menu className="h-6 w-6" />
          </Button>
          {/* Overlay */}
          <div
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${openMobile ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={() => {
              setOpenMobile(false);
              setOpenSidebar && setOpenSidebar(false);
            }}
          />
          {/* Drawer ocupa toda a largura no mobile */}
          <div
            className={`fixed top-0 left-0 z-50 h-full w-full max-w-xs bg-white shadow-lg transform transition-transform duration-300 ${openMobile ? 'translate-x-0' : '-translate-x-full'}`}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {/* Conteúdo da sidebar */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800">OrganizeJá</h1>
              <Button variant="ghost" size="icon" onClick={() => {
                setOpenMobile(false);
                setOpenSidebar && setOpenSidebar(false);
              }}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-2 flex flex-col flex-1 h-0 overflow-y-auto">
              <div className="flex-1 flex flex-col gap-2">
                {Array.isArray(menuItems) && menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { navigate(`/dashboard${item.id === 'dashboard' ? '' : '/' + item.id}`); setOpenMobile(false); setOpenSidebar && setOpenSidebar(false); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-base ${activeSection === item.id ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
              {/* Botão de Logout sempre no final */}
              <button
                onClick={() => { setOpenMobile(false); setOpenSidebar && setOpenSidebar(false); navigate('/login'); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-base text-red-600 hover:bg-red-100 mt-8"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>
          {/* Espaço reservado para o drawer, empurrando o conteúdo principal */}
          <div className={`transition-all duration-300 ${openMobile ? 'mr-64' : ''}`}></div>
        </>
      ) : (
        <div className={`bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} h-screen hidden md:block`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <h1 className="text-xl font-bold text-gray-800">OrganizeJá</h1>
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
          <nav className="p-4 space-y-2 flex flex-col h-full">
            <div className="flex-1">
              {Array.isArray(menuItems) && menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/dashboard${item.id === 'dashboard' ? '' : '/' + item.id}`)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeSection === item.id ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              ))}
            </div>
            {/* Botão de Logout */}
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-base text-red-600 hover:bg-red-100 mt-8"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
              {!isCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </nav>
        </div>
      )}
    </>
  );
};
