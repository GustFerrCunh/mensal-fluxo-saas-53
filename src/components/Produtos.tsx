
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Package, Users, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuth } from "firebase/auth";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";

// Função utilitária para formatar como moeda brasileira
function formatarMoeda(valor: number | string) {
  let num = typeof valor === 'string' ? parseFloat(valor.replace(/,/g, '.')) : valor;
  if (isNaN(num)) num = 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para aplicar máscara de moeda brasileira em tempo real
function maskMoedaBR(valor: string) {
  // Remove tudo que não for número
  let v = valor.replace(/\D/g, "");
  // Adiciona zeros à esquerda se necessário
  v = v.padStart(3, '0');
  // Divide centavos
  let reais = v.slice(0, -2);
  let centavos = v.slice(-2);
  // Adiciona pontos nos milhares
  reais = reais.replace(/^0+/, '');
  reais = reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  // Monta a string final
  let resultado = `R$ ${reais ? reais : '0'},${centavos}`;
  return resultado;
}

// Função para manter apenas números
function onlyNumbers(valor: string) {
  return valor.replace(/\D/g, "");
}

// Função para converter valor mascarado para número
function parseMoeda(valor: string | number) {
  if (!valor) return 0;
  let v = typeof valor === 'number' ? valor.toString() : valor;
  return parseFloat(
    v
      .replace('R$', '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
  ) || 0;
}

export const Produtos = () => {
  const userId = getAuth().currentUser?.uid;
  const { data: produtos, add: addProduto, update: updateProduto, remove: removeProduto } = useFirestoreCollection("produtos");
  const { data: clientes } = useFirestoreCollection("clientes");
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

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do produto é obrigatório",
        variant: "destructive"
      });
      return;
    }
    const valorImplementacao = parseMoeda(formData.valorImplementacao);
    const valorMensalidade = parseMoeda(formData.valorMensalidade);
    const produto = {
      nome: formData.nome,
      descricao: formData.descricao,
      valorImplementacao,
      valorMensalidade,
      criadoEm: editingProduto?.criadoEm || new Date().toISOString(),
      userId: userId // associa ao usuário
    };
    if (editingProduto) {
      await updateProduto(editingProduto.id, produto);
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!"
      });
    } else {
      await addProduto(produto);
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
      valorImplementacao: produto.valorImplementacao !== undefined && produto.valorImplementacao !== null ? produto.valorImplementacao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "",
      valorMensalidade: produto.valorMensalidade !== undefined && produto.valorMensalidade !== null ? produto.valorMensalidade.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (produtoId: string) => {
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

    await removeProduto(produtoId);
    toast({
      title: "Sucesso",
      description: "Produto excluído com sucesso!"
    });
  };

  const getClientesPorProduto = (produtoId: string) => {
    return clientes.filter((cliente: any) => 
      cliente.produtos.some((p: any) => p.produtoId === produtoId)
    );
  };

  useEffect(() => {
    return () => setIsDialogOpen(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 capitalize leading-tight">Produtos</h2>
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
              <DialogDescription>
                {editingProduto
                  ? "Edite as informações do produto."
                  : "Preencha as informações para cadastrar um novo produto."}
              </DialogDescription>
              <p className="text-sm text-gray-600">
                {editingProduto ? "Edite as informações do produto" : "Preencha as informações para cadastrar um novo produto"}
              </p>
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
                  inputMode="numeric"
                  value={formData.valorImplementacao}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    const valorNumerico = Number(raw) / 100;
                    const valorFormatado = valorNumerico.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
                    setFormData({ ...formData, valorImplementacao: valorFormatado });
                  }}
                  placeholder="R$ 0,00"
                  maxLength={20}
                />
              </div>
              <div>
                <Label htmlFor="valorMensalidade">Valor da Mensalidade (R$)</Label>
                <Input
                  id="valorMensalidade"
                  inputMode="numeric"
                  value={formData.valorMensalidade}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    const valorNumerico = Number(raw) / 100;
                    const valorFormatado = valorNumerico.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
                    setFormData({ ...formData, valorMensalidade: valorFormatado });
                  }}
                  placeholder="R$ 0,00"
                  maxLength={20}
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.isArray(produtos) && Array.from(new Map(produtos.filter(p => !!p.id).map(p => [p.id, p])).values()).map((produto) => {
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
                        <Badge variant="outline">{formatarMoeda(produto.valorImplementacao)}</Badge>
                      </div>
                    )}
                    {produto.valorMensalidade && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Mensalidade:</span>
                        <Badge variant="secondary">{formatarMoeda(produto.valorMensalidade)}</Badge>
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
