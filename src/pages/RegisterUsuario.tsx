import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "@/firebase";

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarTelefone(telefone: string) {
  // Aceita formatos (xx) 9xxxx-xxxx, (xx) xxxx-xxxx, xxxxxxxxxxx ou xxxxxxxxx
  const v = telefone.replace(/\D/g, "");
  return (
    v.length === 10 || // fixo: (xx) xxxx-xxxx
    v.length === 11    // celular: (xx) 9xxxx-xxxx
  );
}

function maskTelefone(value: string) {
  let v = value.replace(/\D/g, "");
  v = v.slice(0, 11);
  if (v.length <= 2) return v;
  if (v.length <= 6) return `(${v.slice(0,2)}) ${v.slice(2)}`;
  if (v.length <= 10) return `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
  return `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
}

function validarSenha(senha: string) {
  return senha.length >= 6 && /[A-Za-z]/.test(senha) && /\d/.test(senha);
}

export default function RegisterUsuario() {
  const [form, setForm] = useState({
    nome: "",
    documento: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: ""
  });
  const [erros, setErros] = useState<any>({});
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();
  const auth = getAuth(app);

  function validarCampos() {
    const novosErros: any = {};
    if (!form.nome || form.nome.length < 3) novosErros.nome = "Nome deve ter pelo menos 3 caracteres.";
    if (!form.documento || (form.documento.length !== 11 && form.documento.length !== 14)) novosErros.documento = "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.";
    if (!form.email || !validarEmail(form.email)) novosErros.email = "E-mail inválido.";
    if (!form.telefone || !validarTelefone(form.telefone)) novosErros.telefone = "Telefone inválido.";
    if (!form.senha || !validarSenha(form.senha)) novosErros.senha = "Senha deve ter pelo menos 6 caracteres, uma letra e um número.";
    if (form.senha !== form.confirmarSenha) novosErros.confirmarSenha = "As senhas não coincidem.";
    return novosErros;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
    const novosErros = validarCampos();
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;
    try {
      await createUserWithEmailAndPassword(auth, form.email, form.senha);
      // Salvar dados no localStorage
      localStorage.setItem('usuario', JSON.stringify({
        nome: form.nome,
        documento: form.documento,
        email: form.email,
        telefone: form.telefone,
        senha: form.senha
      }));
      setMensagem("Usuário cadastrado com sucesso! Faça login.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setMensagem("E-mail já cadastrado.");
      } else if (error.code === 'auth/invalid-email') {
        setMensagem("E-mail inválido.");
      } else {
        setMensagem("Erro ao cadastrar usuário. Tente novamente.");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold mb-2">Registrar Usuário</h2>
        {mensagem && <div className={mensagem.includes("sucesso") ? "text-green-600" : "text-red-600"}>{mensagem}</div>}
        <input name="nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" className="w-full border p-2 rounded" />
        {erros.nome && <div className="text-red-500 text-xs mb-1">{erros.nome}</div>}
        <input name="documento" value={form.documento} onChange={e => setForm({ ...form, documento: e.target.value })} placeholder="CPF ou CNPJ" className="w-full border p-2 rounded" />
        {erros.documento && <div className="text-red-500 text-xs mb-1">{erros.documento}</div>}
        <input name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="E-mail" type="email" className="w-full border p-2 rounded" />
        {erros.email && <div className="text-red-500 text-xs mb-1">{erros.email}</div>}
        <input name="telefone" value={maskTelefone(form.telefone)} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="Telefone" className="w-full border p-2 rounded" />
        {erros.telefone && <div className="text-red-500 text-xs mb-1">{erros.telefone}</div>}
        <input name="senha" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} placeholder="Senha" type="password" className="w-full border p-2 rounded" />
        {erros.senha && <div className="text-red-500 text-xs mb-1">{erros.senha}</div>}
        <input name="confirmarSenha" value={form.confirmarSenha} onChange={e => setForm({ ...form, confirmarSenha: e.target.value })} placeholder="Confirmar senha" type="password" className="w-full border p-2 rounded" />
        {erros.confirmarSenha && <div className="text-red-500 text-xs mb-1">{erros.confirmarSenha}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Registrar</button>
      </form>
    </div>
  );
} 