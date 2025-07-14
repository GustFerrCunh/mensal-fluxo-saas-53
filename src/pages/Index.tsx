
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { Produtos } from "@/components/Produtos";
import { Clientes } from "@/components/Clientes";
import { Mensalidades } from "@/components/Mensalidades";
import { Financeiro } from "@/components/Financeiro";
import { Tarefas } from "@/components/Tarefas";
import { Calendario } from "@/components/Calendario";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "produtos":
        return <Produtos />;
      case "clientes":
        return <Clientes />;
      case "mensalidades":
        return <Mensalidades />;
      case "financeiro":
        return <Financeiro />;
      case "tarefas":
        return <Tarefas />;
      case "calendario":
        return <Calendario />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
