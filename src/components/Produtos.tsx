
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Package, Users, Trash2, Edit } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";

export const Produtos = () => {
  const [produtos, setProdutos] = useLocalStorage("produtos", []);
  const [clientes] = useLocalStorage("clientes", []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    valorImplementacao: "",
    valorMensalidade: ""
  });

  const resetForm = () => {
    setFormData({ nome: "", descricao: "", valorImplementacao: "", valorMensalidade: "" });
    setEditingProduto(null);
  };

  const handleSubmit = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do produto é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const produto = {
      id: editingProduto?.id || Date.now(),
      nome: formData.nome,
      descricao: formData.descricao,
      valorImplementacao: formData.valorImplementacao ? parseFloat(formData.valorImplementacao) : null,
      valorMensalidade: formData.valorMensalidade ? parseFloat(formData.valorMensalidade) : null,
      criadoEm: editingProduto?.criadoEm || new Date().toISOString()
    };

    if (editingProduto) {
      setProdutos(produtos.map((p: any) => p.id === produto.id ? produto : p));
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!"
      });
    } else {
      setProdutos([...produtos, produto]);
      toast({
        title: "Sucesso", 
        description: "Produto cadastrado com sucesso!"
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (produto: any) => {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao || "",
      valorImplementacao: produto.valorImplementacao?.toString() || "",
      valorMensalidade: produto.valorMensalidade?.toString() || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (produtoId: number) => {
    // Verificar se há clientes usando este produto
    const clientesComProduto = clientes.filter((cliente: any) => 
      cliente.produtos.some((p: any) => p.produtoId === produtoId)
    );

    if (clientesComProduto.length > 0) {
      toast({
        title: "Erro",
        description: `Não é possível excluir. ${clientesComProduto.length} cliente(s) estão usando este produto.`,
        variant: "destructive"
      });
      return;
    }

    setProdutos(produtos.filter((p: any) => p.id !== produtoId));
    toast({
      title: "Sucesso",
      description: "Produto excluído com sucesso!"
    });
  };

  const getClientesPorProduto = (produtoId: number) => {
    return clientes.filter((cliente: any) => 
      cliente.produtos.some((p: any) => p.produtoId === produtoId)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProduto ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Digite o nome do produto"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Descrição opcional do produto"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="valorImplementacao">Valor de Implementação (R$)</Label>
                <Input
                  id="valorImplementacao"
                  type="number"
                  step="0.01"
                  value={formData.valorImplementacao}
                  onChange={(e) => setFormData({...formData, valorImplementacao: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="valorMensalidade">Valor da Mensalidade (R$)</Label>
                <Input
                  id="valorMensalidade"
                  type="number"
                  step="0.01"
                  value={formData.valorMensalidade}
                  onChange={(e) => setFormData({...formData, valorMensalidade: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                  {editingProduto ? "Atualizar" : "Cadastrar"}
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

      {produtos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto cadastrado</h3>
            <p className="text-gray-500 mb-4">Comece cadastrando seu primeiro produto</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtos.map((produto: any) => {
            const clientesProduto = getClientesPorProduto(produto.id);
            return (
              <Card key={produto.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{produto.nome}</CardTitle>
                      {produto.descricao && (
                        <p className="text-sm text-gray-600 mt-1">{produto.descricao}</p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(produto)}
                        className="p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(produto.id)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {produto.valorImplementacao && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Implementação:</span>
                        <Badge variant="outline">R$ {produto.valorImplementacao.toFixed(2)}</Badge>
                      </div>
                    )}
                    
                    {produto.valorMensalidade && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Mensalidade:</span>
                        <Badge variant="secondary">R$ {produto.valorMensalidade.toFixed(2)}</Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {clientesProduto.length} cliente(s) ativo(s)
                    </span>
                  </div>

                  {clientesProduto.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 mb-2">Clientes:</p>
                      <div className="space-y-1">
                        {clientesProduto.slice(0, 3).map((cliente: any) => (
                          <div key={cliente.id} className="text-xs text-gray-700">
                            {cliente.nome}
                          </div>
                        ))}
                        {clientesProduto.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{clientesProduto.length - 3} outros
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
