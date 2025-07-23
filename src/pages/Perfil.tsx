import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";

export default function Perfil() {
  const [form, setForm] = useState({
    nome: "",
    documento: "",
    email: "",
    telefone: "",
    senha: ""
  });
  const [editando, setEditando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    // Carregar dados do localStorage, se existirem
    const usuarioLocal = localStorage.getItem('usuario');
    if (usuarioLocal) {
      try {
        const dados = JSON.parse(usuarioLocal);
        setForm((prev) => ({
          ...prev,
          nome: dados.nome || prev.nome,
          documento: dados.documento || prev.documento,
          email: dados.email || prev.email,
          telefone: dados.telefone || prev.telefone,
          senha: dados.senha || ''
        }));
      } catch {}
    }
    async function fetchUserData() {
      const auth = getAuth();
      const db = getFirestore();
      const userId = auth.currentUser?.uid;
      if (userId) {
        const docRef = doc(db, "usuarios", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm((prev) => ({
            nome: data.nome || prev.nome,
            documento: data.documento || data.cpfCnpj || prev.documento,
            email: data.email || auth.currentUser.email || prev.email,
            telefone: data.telefone || prev.telefone,
            senha: '' // nunca preencha senha!
          }));
        } else {
          setForm((prev) => ({
            ...prev,
            email: auth.currentUser.email || prev.email
          }));
        }
      }
    }
    fetchUserData();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const auth = getAuth();
    const db = getFirestore();
    const userId = auth.currentUser?.uid;
    if (userId) {
      const docRef = doc(db, "usuarios", userId);
      await docRef.set({
        nome: form.nome,
        documento: form.documento,
        email: form.email,
        telefone: form.telefone
      }, { merge: true });
      // Atualizar senha se o campo não estiver vazio
      if (form.senha && form.senha.length >= 6) {
        try {
          await updatePassword(auth.currentUser, form.senha);
          setMensagem("Dados e senha atualizados com sucesso!");
        } catch (err) {
          setMensagem("Dados atualizados, mas erro ao atualizar senha: " + (err.message || err));
        }
      } else {
        setMensagem("Dados atualizados com sucesso!");
      }
      setEditando(false);
      setForm((prev) => ({ ...prev, senha: "" }));
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded shadow p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Perfil</h2>
      {mensagem && <div className="text-green-600 text-center mb-2">{mensagem}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome completo</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            disabled={!editando}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CPF / CNPJ</label>
          <input
            name="documento"
            value={form.documento}
            onChange={handleChange}
            disabled={!editando}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">E-mail</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={!editando}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefone</label>
          <input
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
            disabled={!editando}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input
            name="senha"
            value={form.senha}
            onChange={handleChange}
            type="password"
            disabled={!editando}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 disabled:bg-gray-100"
          />
        </div>
        {editando ? (
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold">
            Salvar alterações
          </button>
        ) : (
          <button type="button" onClick={() => setEditando(true)} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold">
            Editar perfil
          </button>
        )}
      </form>
    </div>
  );
} 