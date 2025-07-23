import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, PieChart, Plus, Edit, Trash2 } from "lucide-react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getAuth } from "firebase/auth";

interface Gasto {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  observacoes?: string;
  userId: string; // Adicionado para associar ao usuário
}

export const Financeiro = () => {
  const userId = getAuth().currentUser?.uid;
  const { data: clientes } = useFirestoreCollection("clientes");
  const { data: produtos } = useFirestoreCollection("produtos");
  const { data: gastos, add: addGasto, update: updateGasto, remove: removeGasto } = useFirestoreCollection("gastos");
  const [mesEscolhido, setMesEscolhido] = useState(new Date().getMonth().toString());
  const [anoEscolhido, setAnoEscolhido] = useState(new Date().getFullYear().toString());
  const [showGastoForm, setShowGastoForm] = useState(false);
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);

  const [novoGasto, setNovoGasto] = useState({
    descricao: "",
    valor: "",
    categoria: "",
    data: "",
    observacoes: ""
  });

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const categorias = [
    "Alimentação", "Transporte", "Moradia", "Lazer", "Saúde", 
    "Educação", "Tecnologia", "Marketing", "Outros"
  ];

  // Filtro de duplicatas defensivo para todos os arrays
  const clientesUnicos = Array.isArray(clientes) ? Array.from(new Map(clientes.filter(c => !!c && !!c.id).map(c => [c.id, c])).values()) : [];
  const produtosUnicos = Array.isArray(produtos) ? Array.from(new Map(produtos.filter(p => !!p && !!p.id).map(p => [p.id, p])).values()) : [];
  const gastosUnicos = Array.isArray(gastos) ? Array.from(new Map(gastos.filter(g => !!g && !!g.id).map(g => [g.id, g])).values()) : [];

  const calcularDados = useMemo(() => {
    const mes = parseInt(mesEscolhido);
    const ano = parseInt(anoEscolhido);
    const hoje = new Date();
    
    let totalEsperado = 0;
    let totalRecebido = 0;
    let totalPendente = 0;
    let totalAtrasado = 0;
    let dadosPorProduto: { [key: string]: any } = {};
    let vencimentosPorDia: { [key: number]: any } = {};

    clientesUnicos.forEach((cliente: any) => {
      cliente.produtos.forEach((produto: any) => {
        const dataVencimento = new Date(ano, mes, cliente.diaVencimento);
        const produtoInfo = produtosUnicos.find((p: any) => p.id === produto.produtoId);
        const produtoNome = produtoInfo?.nome || "Produto Desconhecido";

        // Calcular implementação
        if (produto.valorImplementacao > 0) {
          totalEsperado += produto.valorImplementacao;

          let statusReal = produto.statusImplementacao;
          if (produto.statusImplementacao !== "pago" && dataVencimento < hoje) {
            statusReal = "atrasado";
          }

          if (statusReal === "pago") {
            totalRecebido += produto.valorImplementacao;
          } else if (statusReal === "atrasado") {
            totalAtrasado += produto.valorImplementacao;
          } else {
            totalPendente += produto.valorImplementacao;
          }

          // Dados por produto
          if (!dadosPorProduto[produtoNome]) {
            dadosPorProduto[produtoNome] = {
              nome: produtoNome,
              totalEsperado: 0,
              totalRecebido: 0,
              totalPendente: 0,
              totalAtrasado: 0,
              clientes: 0
            };
          }

          dadosPorProduto[produtoNome].totalEsperado += produto.valorImplementacao;
          dadosPorProduto[produtoNome].clientes += 1;

          if (statusReal === "pago") {
            dadosPorProduto[produtoNome].totalRecebido += produto.valorImplementacao;
          } else if (statusReal === "atrasado") {
            dadosPorProduto[produtoNome].totalAtrasado += produto.valorImplementacao;
          } else {
            dadosPorProduto[produtoNome].totalPendente += produto.valorImplementacao;
          }

          // Vencimentos por dia
          const dia = cliente.diaVencimento;
          if (!vencimentosPorDia[dia]) {
            vencimentosPorDia[dia] = {
              dia,
              totalValor: 0,
              clientes: [],
              qtdClientes: 0
            };
          }

          vencimentosPorDia[dia].totalValor += produto.valorImplementacao;
          vencimentosPorDia[dia].clientes.push({
            nome: cliente.nome,
            produto: produtoNome + " (Impl)",
            valor: produto.valorImplementacao,
            status: statusReal
          });
          vencimentosPorDia[dia].qtdClientes += 1;
        }

        // Calcular mensalidade
        if (produto.valorMensalidade > 0) {
          totalEsperado += produto.valorMensalidade;

          let statusReal = produto.statusMensalidade;
          if (produto.statusMensalidade !== "pago" && dataVencimento < hoje) {
            statusReal = "atrasado";
          }

          if (statusReal === "pago") {
            totalRecebido += produto.valorMensalidade;
          } else if (statusReal === "atrasado") {
            totalAtrasado += produto.valorMensalidade;
          } else {
            totalPendente += produto.valorMensalidade;
          }

          // Dados por produto
          if (!dadosPorProduto[produtoNome]) {
            dadosPorProduto[produtoNome] = {
              nome: produtoNome,
              totalEsperado: 0,
              totalRecebido: 0,
              totalPendente: 0,
              totalAtrasado: 0,
              clientes: 0
            };
          }

          dadosPorProduto[produtoNome].totalEsperado += produto.valorMensalidade;

          if (statusReal === "pago") {
            dadosPorProduto[produtoNome].totalRecebido += produto.valorMensalidade;
          } else if (statusReal === "atrasado") {
            dadosPorProduto[produtoNome].totalAtrasado += produto.valorMensalidade;
          } else {
            dadosPorProduto[produtoNome].totalPendente += produto.valorMensalidade;
          }

          // Vencimentos por dia
          const dia = cliente.diaVencimento;
          if (!vencimentosPorDia[dia]) {
            vencimentosPorDia[dia] = {
              dia,
              totalValor: 0,
              clientes: [],
              qtdClientes: 0
            };
          }

          vencimentosPorDia[dia].totalValor += produto.valorMensalidade;
          vencimentosPorDia[dia].clientes.push({
            nome: cliente.nome,
            produto: produtoNome + " (Mens)",
            valor: produto.valorMensalidade,
            status: statusReal
          });
        }
      });
    });

    // Calcular gastos do mês
    const gastosMes = gastosUnicos.filter((gasto: Gasto) => {
      const dataGasto = new Date(gasto.data);
      return dataGasto.getMonth() === mes && dataGasto.getFullYear() === ano;
    });

    const totalGastos = gastosMes?.reduce((total: number, gasto: Gasto) => total + gasto.valor, 0) || 0;

    return {
      totalEsperado,
      totalRecebido,
      totalPendente,
      totalAtrasado,
      totalGastos,
      lucroLiquido: totalRecebido - totalGastos,
      percentualRecebido: totalEsperado > 0 ? (totalRecebido / totalEsperado) * 100 : 0,
      produtosMaisLucrativos: Object.values(dadosPorProduto).sort((a: any, b: any) => b.totalEsperado - a.totalEsperado),
      vencimentosPorDia: Object.values(vencimentosPorDia).sort((a: any, b: any) => a.dia - b.dia),
      gastosMes
    };
  }, [clientesUnicos, produtosUnicos, gastosUnicos, mesEscolhido, anoEscolhido]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pago: { variant: "default" as const, label: "Pago" },
      a_pagar: { variant: "secondary" as const, label: "A Pagar" },
      pendente: { variant: "outline" as const, label: "Pendente" },
      atrasado: { variant: "destructive" as const, label: "Atrasado" }
    };
    
    const config = variants[status as keyof typeof variants];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleSaveGasto = async () => {
    if (!novoGasto.descricao || !novoGasto.valor || !novoGasto.categoria || !novoGasto.data) {
      return;
    }
    const gasto = {
      descricao: novoGasto.descricao,
      valor: parseFloat(novoGasto.valor),
      categoria: novoGasto.categoria,
      data: novoGasto.data,
      observacoes: novoGasto.observacoes,
      userId: userId // associa ao usuário
    };
    if (editingGasto) {
      await updateGasto(editingGasto.id, gasto);
    } else {
      await addGasto(gasto);
    }
    setNovoGasto({ descricao: "", valor: "", categoria: "", data: "", observacoes: "" });
    setEditingGasto(null);
    setShowGastoForm(false);
  };

  const handleEditGasto = (gasto: any) => {
    setEditingGasto(gasto);
    setNovoGasto({
      descricao: gasto.descricao,
      valor: gasto.valor.toString(),
      categoria: gasto.categoria,
      data: gasto.data,
      observacoes: gasto.observacoes || ""
    });
    setShowGastoForm(true);
  };

  const handleDeleteGasto = async (gastoId: string) => {
    await removeGasto(gastoId);
  };

  // Fecha o modal ao desmontar o componente para evitar erro de Portal
  useEffect(() => {
    return () => setShowGastoForm(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 capitalize leading-tight">Financeiro</h2>
        <div className="text-sm sm:text-base md:text-lg text-gray-600 mt-1 sm:mt-2">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          })}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <Select value={mesEscolhido} onValueChange={setMesEscolhido}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {meses.map((mes, index) => (
                <SelectItem key={index} value={index.toString()}>{mes}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={anoEscolhido} onValueChange={setAnoEscolhido}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(ano => (
                <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Esperado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(calcularDados.totalEsperado)}</div>
            <p className="text-xs text-muted-foreground">
              {meses[parseInt(mesEscolhido)]} {anoEscolhido}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(calcularDados.totalRecebido)}</div>
            <p className="text-xs text-muted-foreground">
              {calcularDados.percentualRecebido.toFixed(1)}% do esperado
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(calcularDados.totalGastos)}</div>
            <p className="text-xs text-muted-foreground">Saídas do mês</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${calcularDados.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(calcularDados.lucroLiquido)}
            </div>
            <p className="text-xs text-muted-foreground">Receita - Gastos</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(calcularDados.totalPendente)}</div>
            <p className="text-xs text-muted-foreground">A receber</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Gastos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Gastos do Mês
            </CardTitle>
            <Dialog open={showGastoForm} onOpenChange={setShowGastoForm}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingGasto(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Gasto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingGasto ? 'Editar Gasto' : 'Novo Gasto'}</DialogTitle>
                  <DialogDescription>
                    {editingGasto
                      ? 'Edite as informações do gasto.'
                      : 'Preencha as informações para cadastrar um novo gasto.'}
                  </DialogDescription>
                  <p className="text-sm text-gray-600">
                    {editingGasto ? 'Edite as informações do gasto' : 'Preencha as informações para cadastrar um novo gasto'}
                  </p>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      value={novoGasto.descricao}
                      onChange={(e) => setNovoGasto({...novoGasto, descricao: e.target.value})}
                      placeholder="Ex: Almoço reunião"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="valor">Valor</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      value={novoGasto.valor}
                      onChange={(e) => setNovoGasto({...novoGasto, valor: e.target.value})}
                      placeholder="0,00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select value={novoGasto.categoria} onValueChange={(value) => setNovoGasto({...novoGasto, categoria: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map(categoria => (
                          <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={novoGasto.data}
                      onChange={(e) => setNovoGasto({...novoGasto, data: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="observacoes">Observações (opcional)</Label>
                    <Textarea
                      id="observacoes"
                      value={novoGasto.observacoes}
                      onChange={(e) => setNovoGasto({...novoGasto, observacoes: e.target.value})}
                      placeholder="Detalhes adicionais..."
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleSaveGasto} className="flex-1">
                      {editingGasto ? 'Atualizar' : 'Salvar'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowGastoForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Array.isArray(calcularDados.gastosMes) && Array.from(new Map(calcularDados.gastosMes.filter(g => !!g && !!g.id).map(g => [g.id, g])).values()).length === 0 ? (
              <p className="text-center text-gray-500 py-4">Nenhum gasto cadastrado para este mês</p>
            ) : (
              Array.isArray(calcularDados.gastosMes) && Array.from(new Map(calcularDados.gastosMes.filter(g => !!g && !!g.id).map(g => [g.id, g])).values()).map((gasto: Gasto) => (
                <div key={gasto.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium">{gasto.descricao}</h4>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-red-600">{formatCurrency(gasto.valor)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditGasto(gasto)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGasto(gasto.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <Badge variant="outline">{gasto.categoria}</Badge>
                        <span>{new Date(gasto.data).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {gasto.observacoes && (
                        <p className="text-xs text-gray-500 mt-1">{gasto.observacoes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progresso Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progresso do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Recebido</span>
                <span className="font-medium">{formatCurrency(calcularDados.totalRecebido)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${calcularDados.percentualRecebido}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-medium text-green-600">{formatCurrency(calcularDados.totalRecebido)}</div>
                <div className="text-gray-500">Recebido</div>
              </div>
              <div>
                <div className="font-medium text-yellow-600">{formatCurrency(calcularDados.totalPendente)}</div>
                <div className="text-gray-500">Pendente</div>
              </div>
              <div>
                <div className="font-medium text-red-600">{formatCurrency(calcularDados.totalAtrasado)}</div>
                <div className="text-gray-500">Atrasado</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos mais Lucrativos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Produtos por Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(calcularDados.produtosMaisLucrativos) && calcularDados.produtosMaisLucrativos.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Nenhum dado disponível</p>
              ) : (
                Array.isArray(calcularDados.produtosMaisLucrativos) && calcularDados.produtosMaisLucrativos.map((produto: any) => (
                  <div key={produto.id ? produto.id : produto.nome} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{produto.nome}</span>
                      <span className="text-sm text-gray-600">{produto.clientes} cliente(s)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span>Esperado: {formatCurrency(produto.totalEsperado)}</span>
                      <span>Recebido: {formatCurrency(produto.totalRecebido)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${produto.totalEsperado > 0 ? (produto.totalRecebido / produto.totalEsperado) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vencimentos por Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Vencimentos por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Array.isArray(calcularDados.vencimentosPorDia) && calcularDados.vencimentosPorDia.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Nenhum vencimento cadastrado</p>
              ) : (
                Array.isArray(calcularDados.vencimentosPorDia) && calcularDados.vencimentosPorDia.map((vencimento: any) => (
                  <div key={vencimento.dia + '-' + vencimento.totalValor} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Dia {vencimento.dia}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatCurrency(vencimento.totalValor)}</div>
                        <div className="text-xs text-gray-500">{vencimento.qtdClientes} cliente(s)</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {Array.isArray(vencimento.clientes) && vencimento.clientes.slice(0, 3).map((cliente: any) => (
                        <div key={cliente.id ? cliente.id : cliente.nome + '-' + cliente.produto} className="flex justify-between items-center text-xs">
                          <span>{cliente.nome} - {cliente.produto}</span>
                          <div className="flex items-center gap-2">
                            <span>{formatCurrency(cliente.valor)}</span>
                            {getStatusBadge(cliente.status)}
                          </div>
                        </div>
                      ))}
                      {Array.isArray(vencimento.clientes) && vencimento.clientes.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{vencimento.clientes.length - 3} outros
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
