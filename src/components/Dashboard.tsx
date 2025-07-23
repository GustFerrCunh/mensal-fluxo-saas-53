import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Package, 
  DollarSign, 
  Calendar,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
// Removido import quebrado de useLocalStorage

// Função utilitária para formatar moeda brasileira
function formatarMoedaBR(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export const Dashboard = ({ onOpenSidebar }: { onOpenSidebar?: () => void }) => {
  const { data: produtos = [] } = useFirestoreCollection("produtos");
  const { data: clientes = [] } = useFirestoreCollection("clientes");
  const [selectedDia, setSelectedDia] = useState(new Date().getDate());

  const calcularValores = () => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    let totalMes = 0;
    let totalRecebido = 0;
    let totalPendente = 0;
    let clientesVencidos = 0;

    clientes.forEach((cliente: any) => {
      cliente.produtos.forEach((produto: any) => {
        const dataVencimento = new Date(anoAtual, mesAtual, cliente.diaVencimento);
        
        // Implementação
        if (produto.valorImplementacao > 0) {
          totalMes += produto.valorImplementacao;
          if (produto.statusImplementacao === "pago") {
            totalRecebido += produto.valorImplementacao;
          } else {
            totalPendente += produto.valorImplementacao;
            if (dataVencimento < hoje && produto.statusImplementacao === "pendente") {
              clientesVencidos++;
            }
          }
        }
        
        // Mensalidade
        if (produto.valorMensalidade > 0) {
          totalMes += produto.valorMensalidade;
          if (produto.statusMensalidade === "pago") {
            totalRecebido += produto.valorMensalidade;
          } else {
            totalPendente += produto.valorMensalidade;
            if (dataVencimento < hoje && produto.statusMensalidade === "a_pagar") {
              clientesVencidos++;
            }
          }
        }
      });
    });

    return { totalMes, totalRecebido, totalPendente, clientesVencidos };
  };

  const clientesVencemHoje = clientes.filter((cliente: any) => 
    cliente.diaVencimento === selectedDia
  );

  const { totalMes, totalRecebido, totalPendente, clientesVencidos } = calcularValores();

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 capitalize leading-tight">Dashboard</h2>
        <div className="text-sm sm:text-base md:text-lg text-gray-600 mt-1 sm:mt-2">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          })}
        </div>
      </div>
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientes.length}</div>
            <p className="text-xs text-muted-foreground">Clientes ativos</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produtos.length}</div>
            <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoedaBR(totalMes)}</div>
            <p className="text-xs text-muted-foreground">Total esperado</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoedaBR(totalPendente)}</div>
            <p className="text-xs text-muted-foreground">{clientesVencidos} vencidos</p>
          </CardContent>
        </Card>
      </div>
      {/* Progresso Financeiro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progresso do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Recebido</span>
                <span className="font-medium">{formatarMoedaBR(totalRecebido)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${totalMes > 0 ? (totalRecebido / totalMes) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pendente</span>
                <span className="font-medium">{formatarMoedaBR(totalPendente)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${totalMes > 0 ? (totalPendente / totalMes) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Vencimentos por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Dia do vencimento:</label>
                <select 
                  value={selectedDia}
                  onChange={(e) => setSelectedDia(Number(e.target.value))}
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => (
                    <option key={dia} value={dia}>Dia {dia}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                {Array.isArray(clientesVencemHoje) && Array.from(new Map(clientesVencemHoje.filter(c => !!c.id).map(c => [c.id, c])).values()).map((cliente) => (
                  <div key={cliente.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <span className="text-sm font-medium">{cliente.nome}</span>
                    <Badge variant="outline">{cliente.produtos.length} produto(s)</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
