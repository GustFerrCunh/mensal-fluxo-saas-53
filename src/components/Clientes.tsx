
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, Trash2, Edit, Phone, Mail, DollarSign } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";

export const Clientes = () => {
  const [clientes, setClientes] = useLocalStorage("clientes", []);
  const [produtos] = useLocalStorage("produtos", []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    diaVencimento: "1",
    produtos: []
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      whatsapp: "",
      diaVencimento: "1",
      produtos: []
    });
    setEditingCliente(null);
  };

  const addProduto = () => {
    setFormData({
      ...formData,
      produtos: [...formData.produtos, { 
        produtoId: "", 
        valorImplementacao: "", 
        valorMensalidade: "", 
        statusImplementacao: "pendente",
        statusMensalidade: "a_pagar" 
      }]
    });
  };

  const updateProduto = (index: number, field: string, value: string) => {
    const novosProdutor = [...formData.produtos];
    novosProdutor[index] = { ...novosProdutor[index], [field]: value };
    setFormData({ ...formData, produtos: novosProdutor });
  };

  const removeProduto = (index: number) => {
    setFormData({
      ...formData,
      produtos: formData.produtos.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do cliente é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (formData.produtos.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um produto",
        variant: "destructive"
      });
      return;
    }

    const produtosValidos = formData.produtos.filter((p: any) => p.produtoId && (p.valorImplementacao || p.valorMensalidade));
    if (produtosValidos.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha produto e pelo menos um valor (implementação ou mensalidade) para cada item",
        variant: "destructive"
      });
      return;
    }

    const cliente = {
      id: editingCliente?.id || Date.now(),
      nome: formData.nome,
      email: formData.email,
      whatsapp: formData.whatsapp,
      diaVencimento: parseInt(formData.diaVencimento),
      produtos: produtosValidos.map((p: any) => ({
        produtoId: parseInt(p.produtoId),
        valorImplementacao: p.valorImplementacao ? parseFloat(p.valorImplementacao) : 0,
        valorMensalidade: p.valorMensalidade ? parseFloat(p.valorMensalidade) : 0,
        statusImplementacao: p.statusImplementacao,
        statusMensalidade: p.statusMensalidade
      })),
      criadoEm: editingCliente?.criadoEm || new Date().toISOString()
    };

    if (editingCliente) {
      setClientes(clientes.map((c: any) => c.id === cliente.id ? cliente : c));
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso!"
      });
    } else {
      setClientes([...clientes, cliente]);
      toast({
        title: "Sucesso",
        description: "Cliente cadastrado com sucesso!"
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (cliente: any) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      email: cliente.email || "",
      whatsapp: cliente.whatsapp || "",
      diaVencimento: cliente.diaVencimento.toString(),
      produtos: cliente.produtos.map((p: any) => ({
        produtoId: p.produtoId.toString(),
        valorImplementacao: p.valorImplementacao?.toString() || "",
        valorMensalidade: p.valorMensalidade?.toString() || "",
        statusImplementacao: p.statusImplementacao || "pendente",
        statusMensalidade: p.statusMensalidade || "a_pagar"
      }))
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (clienteId: number) => {
    setClientes(clientes.filter((c: any) => c.id !== clienteId));
    toast({
      title: "Sucesso",
      description: "Cliente excluído com sucesso!"
    });
  };

  const getProdutoNome = (produtoId: number) => {
    const produto = produtos.find((p: any) => p.id === produtoId);
    return produto?.nome || "Produto não encontrado";
  };

  const getStatusBadge = (status: string, type: "implementacao" | "mensalidade") => {
    const variants = {
      pago: "default",
      pendente: "outline",
      a_pagar: "secondary", 
      atrasado: "destructive"
    };
    
    const labels = {
      pago: "Pago",
      pendente: "Pendente",
      a_pagar: "A Pagar",
      atrasado: "Atrasado"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {type === "implementacao" ? "Impl: " : "Mens: "}{labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Cliente *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Digite o nome do cliente"
                  />
                </div>
                <div>
                  <Label htmlFor="diaVencimento">Dia de Vencimento</Label>
                  <Select value={formData.diaVencimento} onValueChange={(value) => setFormData({...formData, diaVencimento: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => (
                        <SelectItem key={dia} value={dia.toString()}>Dia {dia}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Produtos Contratados</Label>
                  <Button type="button" onClick={addProduto} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Produto
                  </Button>
                </div>

                {formData.produtos.map((produto: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <Label>Produto</Label>
                          <Select 
                            value={produto.produtoId} 
                            onValueChange={(value) => updateProduto(index, "produtoId", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um produto" />
                            </SelectTrigger>
                            <SelectContent>
                              {produtos.map((p: any) => (
                                <SelectItem key={p.id} value={p.id.toString()}>
                                  {p.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Valor Implementação (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={produto.valorImplementacao}
                            onChange={(e) => updateProduto(index, "valorImplementacao", e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label>Status Implementação</Label>
                          <Select 
                            value={produto.statusImplementacao} 
                            onValueChange={(value) => updateProduto(index, "statusImplementacao", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="pago">Pago</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Valor Mensalidade (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={produto.valorMensalidade}
                            onChange={(e) => updateProduto(index, "valorMensalidade", e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label>Status Mensalidade</Label>
                          <Select 
                            value={produto.statusMensalidade} 
                            onValueChange={(value) => updateProduto(index, "statusMensalidade", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="a_pagar">A Pagar</SelectItem>
                              <SelectItem value="pago">Pago</SelectItem>
                              <SelectItem value="atrasado">Atrasado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeProduto(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {formData.produtos.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum produto adicionado. Clique em "Adicionar Produto" para começar.
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                  {editingCliente ? "Atualizar" : "Cadastrar"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {clientes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente cadastrado</h3>
            <p className="text-gray-500 mb-4">Comece cadastrando seu primeiro cliente</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {clientes.map((cliente: any) => (
            <Card key={cliente.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                    <p className="text-sm text-gray-600">Vence dia {cliente.diaVencimento}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(cliente)}
                      className="p-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cliente.id)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {cliente.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{cliente.email}</span>
                  </div>
                )}
                
                {cliente.whatsapp && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{cliente.whatsapp}</span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Produtos:</p>
                  <div className="space-y-3">
                    {cliente.produtos.map((produto: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded space-y-2">
                        <p className="text-sm font-medium">{getProdutoNome(produto.produtoId)}</p>
                        
                        {produto.valorImplementacao > 0 && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-600">Impl: R$ {produto.valorImplementacao.toFixed(2)}</span>
                            </div>
                            {getStatusBadge(produto.statusImplementacao, "implementacao")}
                          </div>
                        )}

                        {produto.valorMensalidade > 0 && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-600">Mens: R$ {produto.valorMensalidade.toFixed(2)}</span>
                            </div>
                            {getStatusBadge(produto.statusMensalidade, "mensalidade")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total Mensal:</span>
                    <span className="font-bold text-lg">
                      R$ {cliente.produtos.reduce((total: number, p: any) => total + (p.valorMensalidade || 0), 0).toFixed(2)}
                    </span>
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
