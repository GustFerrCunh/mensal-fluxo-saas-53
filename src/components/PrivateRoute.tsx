import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // Você pode logar o erro em um serviço externo aqui
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', padding: 24 }}>Ocorreu um erro inesperado na interface. Tente recarregar a página ou entre em contato com o suporte.</div>;
    }
    return this.props.children;
  }
}

export function PrivateRoute({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthenticated(!!user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (!authenticated) return <Navigate to="/login" replace />;
  return <ErrorBoundary>{children}</ErrorBoundary>;
} 