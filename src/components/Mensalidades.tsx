
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CheckCircle, Clock, AlertTriangle, DollarSign, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuth } from "firebase/auth";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";

export const Mensalidades = () => {
  const userId = getAuth().currentUser?.uid;
  const { data: clientes, update: updateCliente } = useFirestoreCollection("clientes");
  const { data: produtos } = useFirestoreCollection("produtos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroDia, setFiltroDia] = useState("todos");
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    return () => setIsDialogOpen(false);
  }, []);

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const calcularStatus = (cliente: any, produto: any) => {
    try {
      if (!cliente || !produto) return "a_pagar";
      // Se estiver pago, sempre retorna pago
      if (produto.statusMensalidade === "pago") return "pago";
      // Se estiver atrasado manualmente, retorna atrasado
      if (produto.statusMensalidade === "atrasado") return "atrasado";
      // Se estiver a_pagar e a data já passou, retorna atrasado automaticamente
      const dataVencimento = new Date(anoAtual, mesAtual, cliente.diaVencimento || 1);
      if (produto.statusMensalidade === "a_pagar" && dataVencimento < hoje) return "atrasado";
      // Caso contrário, retorna o status salvo
      return produto.statusMensalidade || "a_pagar";
    } catch (error) {
      console.error("Erro ao calcular status:", error);
      return "a_pagar";
    }
  };

  // Atualizar status agora usa updateCliente do Firestore
  const atualizarStatus = async (clienteId: string, produtoIndex: number, novoStatus: string) => {
    try {
      const cliente = clientes.find((c: any) => c.id === clienteId);
      if (!cliente) return;
      const novosProdutos = [...(cliente.produtos || [])];
      if (novosProdutos[produtoIndex]) {
        novosProdutos[produtoIndex] = {
          ...novosProdutos[produtoIndex],
          statusMensalidade: novoStatus
        };
      }
      await updateCliente(clienteId, { ...cliente, produtos: novosProdutos });
      toast({
        title: "Status atualizado",
        description: `Pagamento marcado como ${novoStatus === "pago" ? "pago" : novoStatus === "atrasado" ? "atrasado" : "a pagar"}`
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do pagamento",
        variant: "destructive"
      });
    }
  };

  const gerarMensagemCobranca = (cliente: any, produto: any) => {
    try {
      const produtoNome = produtos.find((p: any) => p.id === produto.produtoId)?.nome || "Produto";
      const valor = produto.valorMensalidadeFechado || produto.valorMensalidade || 0;
      const dia = cliente.diaVencimento || 1;
      
      const mensagem = `Olá ${cliente.nome}! 

Lembrando que sua mensalidade do ${produtoNome} no valor de R$ ${valor.toFixed(2)} vence no dia ${dia} deste mês.

Para manter seu acesso ativo, por favor efetue o pagamento até a data de vencimento.

Obrigado!`;

      navigator.clipboard.writeText(mensagem);
      toast({
        title: "Mensagem copiada!",
        description: "A mensagem de cobrança foi copiada para a área de transferência"
      });
    } catch (error) {
      console.error("Erro ao gerar mensagem:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar mensagem de cobrança",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pago: { variant: "default" as const, label: "Pago", icon: CheckCircle },
      a_pagar: { variant: "secondary" as const, label: "A Pagar", icon: Clock },
      atrasado: { variant: "destructive" as const, label: "Atrasado", icon: AlertTriangle }
    };
    
    const config = variants[status as keyof typeof variants] || variants.a_pagar;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getProdutoNome = (produtoId: number) => {
    const produto = produtos.find((p: any) => p.id === produtoId);
    return produto?.nome || "Produto não encontrado";
  };

  // Criar lista de mensalidades
  const mensalidades = [];
  
  try {
    if (Array.isArray(clientes)) {
      clientes.forEach((cliente: any) => {
        if (cliente && Array.isArray(cliente.produtos)) {
          cliente.produtos.forEach((produto: any, index: number) => {
            if (produto) {
              mensalidades.push({
                id: `${cliente.id}-${index}`,
                cliente,
                produto,
                produtoIndex: index,
                status: calcularStatus(cliente, produto),
                produtoNome: getProdutoNome(produto.produtoId)
              });
            }
          });
        }
      });
    }
  } catch (error) {
    console.error("Erro ao criar lista de mensalidades:", error);
  }

  // Aplicar filtros
  const mensalidadesFiltradas = mensalidades.filter((m: any) => {
    if (filtroStatus !== "todos" && m.status !== filtroStatus) return false;
    if (filtroDia !== "todos" && m.cliente.diaVencimento !== parseInt(filtroDia)) return false;
    return true;
  });

  // Agrupar por status para estatísticas
  const estatisticas = mensalidades.reduce((acc: any, m: any) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    const valor = m.produto.valorMensalidadeFechado || m.produto.valorMensalidade || 0;
    acc[`valor_${m.status}`] = (acc[`valor_${m.status}`] || 0) + valor;
    return acc;
  }, {});



  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 capitalize leading-tight">Mensalidades</h2>
        <div className="text-sm sm:text-base md:text-lg text-gray-600 mt-1 sm:mt-2">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          })}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pagamentos em Dia</p>
                <p className="text-2xl font-bold text-green-600">{estatisticas.pago || 0}</p>
                <p className="text-sm text-gray-500">R$ {(estatisticas.valor_pago || 0).toFixed(2)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">A Pagar</p>
                <p className="text-2xl font-bold text-yellow-600">{estatisticas.a_pagar || 0}</p>
                <p className="text-sm text-gray-500">R$ {(estatisticas.valor_a_pagar || 0).toFixed(2)}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Atrasados</p>
                <p className="text-2xl font-bold text-red-600">{estatisticas.atrasado || 0}</p>
                <p className="text-sm text-gray-500">R$ {(estatisticas.valor_atrasado || 0).toFixed(2)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="a_pagar">A Pagar</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Dia de Vencimento</label>
              <Select value={filtroDia} onValueChange={setFiltroDia}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Dias</SelectItem>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => (
                    <SelectItem key={dia} value={dia.toString()}>Dia {dia}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Mensalidades */}
      {mensalidadesFiltradas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma mensalidade encontrada</h3>
            <p className="text-gray-500">Tente ajustar os filtros ou cadastre novos clientes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Array.isArray(mensalidadesFiltradas) && Array.from(new Map(mensalidadesFiltradas.filter(m => !!m.id).map(m => [m.id, m])).values()).map((mensalidade) => (
            <Card key={mensalidade.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-900">{mensalidade.cliente.nome}</h3>
                    <p className="text-sm text-gray-600">{mensalidade.produtoNome}</p>
                    <p className="text-xs text-gray-500">Vence dia {mensalidade.cliente.diaVencimento || 1}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">
                      R$ {(mensalidade.produto.valorMensalidadeFechado || mensalidade.produto.valorMensalidade || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-center">
                    {getStatusBadge(mensalidade.status)}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Select 
                      value={mensalidade.produto.statusMensalidade || "a_pagar"} 
                      onValueChange={(value) => atualizarStatus(mensalidade.cliente.id, mensalidade.produtoIndex, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a_pagar">A Pagar</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => gerarMensagemCobranca(mensalidade.cliente, mensalidade.produto)}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-4 w-4" />
                      Cobrança
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
