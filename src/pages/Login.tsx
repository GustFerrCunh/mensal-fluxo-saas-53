import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "@/firebase";

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Login() {
  const [usuario, setUsuario] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth(app);

  const handleUsuarioLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    if (!usuario.email || !usuario.senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }
    if (!validarEmail(usuario.email)) {
      setErro("Informe um e-mail válido.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, usuario.email, usuario.senha);
      navigate('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErro("E-mail ou senha inválidos.");
      } else if (error.code === 'auth/invalid-email') {
        setErro("E-mail inválido.");
      } else if (error.code === 'auth/too-many-requests') {
        setErro("Muitas tentativas. Tente novamente mais tarde.");
      } else {
        setErro("Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700">
      {/* Título FluxoSaaS */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">OrganizeJá</h1>
        <p className="text-blue-100 text-lg">Sistema de Gestão Empresarial</p>
      </div>
      {/* Card de Login */}
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md mx-4">
        <form onSubmit={handleUsuarioLogin} className="space-y-4">
          {erro && <div className="text-red-600 text-sm mb-2">{erro}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={usuario.email}
              onChange={(e) => setUsuario({ ...usuario, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite o e-mail"
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={usuario.senha}
              onChange={(e) => setUsuario({ ...usuario, senha: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite a senha"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        {/* Links de Registro */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600 mb-4">
            Não tem uma conta?
          </div>
          <div className="space-y-2">
            <button
              className="block w-full text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm"
              onClick={() => navigate('/register-usuario')}
              disabled={loading}
            >
              Registre-se
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 