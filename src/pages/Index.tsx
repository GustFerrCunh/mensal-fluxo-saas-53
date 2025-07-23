
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
import { useEffect } from "react";
import Perfil from "./Perfil";
import { Outlet, useLocation } from "react-router-dom";

const Index = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const location = useLocation();

  // Função para obter o nome da seção em português a partir da URL
  const getSectionName = () => {
    const path = location.pathname.replace(/^\//, "");
    const sectionNames: { [key: string]: string } = {
      dashboard: "Dashboard",
      produtos: "Produtos",
      clientes: "Clientes",
      mensalidades: "Mensalidades",
      financeiro: "Financeiro",
      tarefas: "Tarefas",
      calendario: "Calendário",
      perfil: "Perfil"
    };
    return sectionNames[path] || "Dashboard";
  };

  // Header com FluxoSaaS na barra preta - Mantido
  const header = (
    <div className="fixed top-0 left-0 w-full z-50 bg-black flex flex-row items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-2 shadow-lg">
      {/* Botão do menu à esquerda */}
      <div className="flex-shrink-0 flex items-center justify-start mr-2 sm:mr-4">
        <button 
          className="text-white text-xl sm:text-2xl cursor-pointer hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-800"
          onClick={() => setOpenSidebar((prev) => !prev)}
          aria-label="Abrir menu"
        >
          ≡
        </button>
      </div>
      {/* Logo e título centralizado */}
      <div className="flex-1 flex flex-col items-center justify-center min-w-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center leading-tight">
          OrganizeJá
        </h1>
        <div className="text-xs sm:text-sm md:text-base text-gray-200 text-center leading-tight mt-1">
          Sistema de Gestão Empresarial
        </div>
      </div>
      {/* Espaçador à direita para manter o título centralizado */}
      <div className="flex-shrink-0 w-8 sm:w-10 md:w-12"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex">
        <Sidebar openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
        <main className="flex-1">
          {header}
          <div className="max-w-7xl mx-auto pt-20 sm:pt-24 p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
