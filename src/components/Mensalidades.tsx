
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CheckCircle, Clock, AlertTriangle, DollarSign, Copy } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";

export const Mensalidades = () => {
  console.log("Mensalidades component rendered");
  
  const [clientes, setClientes] = useLocalStorage("clientes", []);
  const [produtos] = useLocalStorage("produtos", []);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroDia, setFiltroDia] = useState("todos");
  const { toast } = useToast();

  console.log("Clientes:", clientes);
  console.log("Produtos:", produtos);

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const calcularStatus = (cliente: any, produto: any) => {
    try {
      console.log("Calculando status para:", cliente?.nome, produto);
      
      if (!cliente || !produto) return "a_pagar";
      
      // Verificar se o pagamento da mensalidade foi marcado como pago
      if (produto.statusMensalidade === "pago") return "pago";
      
      // Se não foi marcado como pago, verificar se está atrasado
      const dataVencimento = new Date(anoAtual, mesAtual, cliente.diaVencimento || 1);
      if (dataVencimento < hoje) return "atrasado";
      
      return "a_pagar";
    } catch (error) {
      console.error("Erro ao calcular status:", error);
      return "a_pagar";
    }
  };

  const atualizarStatus = (clienteId: number, produtoIndex: number, novoStatus: string) => {
    try {
      console.log("Atualizando status:", clienteId, produtoIndex, novoStatus);
      
      const novosClientes = clientes.map((cliente: any) => {
        if (cliente.id === clienteId) {
          const novosProdutos = [...(cliente.produtos || [])];
          if (novosProdutos[produtoIndex]) {
            novosProdutos[produtoIndex] = { 
              ...novosProdutos[produtoIndex], 
              statusMensalidade: novoStatus 
            };
          }
          return { ...cliente, produtos: novosProdutos };
        }
        return cliente;
      });
      
      setClientes(novosClientes);
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

  console.log("Mensalidades geradas:", mensalidades);

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

  console.log("Estatísticas:", estatisticas);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Mensalidades</h1>
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
          {mensalidadesFiltradas.map((mensalidade: any) => (
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
