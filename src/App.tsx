import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import RegisterUsuario from "./pages/RegisterUsuario";
import { PrivateRoute } from "@/components/PrivateRoute";
import { Dashboard } from "./components/Dashboard";
import { Produtos } from "./components/Produtos";
import { Clientes } from "./components/Clientes";
import { Mensalidades } from "./components/Mensalidades";
import { Financeiro } from "./components/Financeiro";
import { Tarefas } from "./components/Tarefas";
import { Calendario } from "./components/Calendario";
import Perfil from "./pages/Perfil";
import React, { useState } from "react";

const queryClient = new QueryClient();

function RegisterEmpresa() {
  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
  });
  const [erro, setErro] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    // Validação simples
    if (!form.nome || !form.cnpj || !form.email || !form.telefone || !form.senha || !form.confirmarSenha) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    // Aqui você pode enviar os dados para o backend
    alert("Empresa registrada com sucesso!");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold mb-2">Registrar Empresa (CNPJ)</h2>
        {erro && <div className="text-red-500 text-sm mb-2">{erro}</div>}
        <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome da empresa" className="w-full border p-2 rounded" />
        <input name="cnpj" value={form.cnpj} onChange={handleChange} placeholder="CNPJ" className="w-full border p-2 rounded" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="E-mail" type="email" className="w-full border p-2 rounded" />
        <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="Telefone" className="w-full border p-2 rounded" />
        <input name="senha" value={form.senha} onChange={handleChange} placeholder="Senha" type="password" className="w-full border p-2 rounded" />
        <input name="confirmarSenha" value={form.confirmarSenha} onChange={handleChange} placeholder="Confirmar senha" type="password" className="w-full border p-2 rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Registrar</button>
      </form>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redireciona '/' para '/dashboard' */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-empresa" element={<RegisterEmpresa />} />
          <Route path="/register-usuario" element={<RegisterUsuario />} />
          {/* Rotas protegidas com layout e rotas filhas */}
          <Route path="/dashboard" element={<PrivateRoute><Index /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="produtos" element={<Produtos />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="mensalidades" element={<Mensalidades />} />
            <Route path="financeiro" element={<Financeiro />} />
            <Route path="tarefas" element={<Tarefas />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>
          {/* Rota de erro */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
