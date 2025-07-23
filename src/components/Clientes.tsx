
import { useEffect, useRef, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, Trash2, Edit, Phone, Mail, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuth } from "firebase/auth";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";

export const Clientes = () => {
  const userId = getAuth().currentUser?.uid;
  const { data: clientes, add: addCliente, update: updateCliente, remove: removeCliente } = useFirestoreCollection("clientes");
  const { data: produtos } = useFirestoreCollection("produtos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const { toast } = useToast();
  const novoClienteButtonRef = useRef<HTMLButtonElement>(null);

  // React Hook Form setup
  const { control, handleSubmit, reset, setFocus, setValue, getValues, formState: { errors } } = useForm({
    defaultValues: {
      nome: "",
      email: "",
      whatsapp: "",
      diaVencimento: "1",
      produtos: []
    }
  });
  const { fields: produtosFields, append, remove, update } = useFieldArray({
    control,
    name: "produtos"
  });

  // Substitua setFormData, formData, erros por React Hook Form

  // Função para lidar com a mudança de estado do Dialog
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      setFocus("nome");
    } else {
      setTimeout(() => {
        novoClienteButtonRef.current?.focus();
      }, 0);
      reset();
      setEditingCliente(null);
    }
  };

  // Função para resetar o formulário e o estado de edição ao clicar em 'Novo Cliente'
  const handleNovoCliente = () => {
    reset();
    setEditingCliente(null);
  };

  // Função para adicionar produto
  const addProduto = () => {
    append({
      produtoId: "",
      nome: "",
      valorImplementacao: "",
      valorMensalidade: "",
      statusImplementacao: "pendente",
      statusMensalidade: "a_pagar"
    });
  };

  // Função para editar cliente
  const handleEdit = (cliente: any) => {
    setEditingCliente(cliente);
    reset({
      nome: cliente.nome,
      email: cliente.email || "",
      whatsapp: cliente.whatsapp || "",
      diaVencimento: cliente.diaVencimento.toString(),
      produtos: cliente.produtos.map((p: any) => ({
        produtoId: p.produtoId.toString(),
        nome: p.nome || "",
        valorImplementacao: p.valorImplementacao !== undefined && p.valorImplementacao !== null ? p.valorImplementacao.toString().replace('.', ',') : "",
        valorMensalidade: p.valorMensalidade !== undefined && p.valorMensalidade !== null ? p.valorMensalidade.toString().replace('.', ',') : "",
        statusImplementacao: p.statusImplementacao || "pendente",
        statusMensalidade: p.statusMensalidade || "a_pagar"
      }))
    });
    setIsDialogOpen(true);
  };

  // Função para converter valor mascarado para número
  function parseMoeda(valor: string) {
    if (!valor) return 0;
    // Remove R$, espaços e pontos dos milhares, troca vírgula por ponto
    return parseFloat(
      valor
        .replace('R$', '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
    ) || 0;
  }

  // Função para converter número para string de centavos
  function numeroParaCentavosString(valor: number) {
    return Math.round(Number(valor) * 100).toString();
  }

  // Função para submeter o formulário
  const onSubmit = async (data: any) => {
    if (data.produtos.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um produto",
        variant: "destructive"
      });
      return;
    }
    const produtosValidos = data.produtos.filter((p: any) => p.produtoId && (p.valorImplementacao || p.valorMensalidade));
    if (produtosValidos.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha produto e pelo menos um valor (implementação ou mensalidade) para cada item",
        variant: "destructive"
      });
      return;
    }
    const cliente = {
      nome: data.nome,
      email: data.email,
      whatsapp: data.whatsapp,
      diaVencimento: parseInt(data.diaVencimento),
      produtos: produtosValidos.map((p: any) => ({
        produtoId: parseInt(p.produtoId),
        valorImplementacao: p.valorImplementacao ? parseMoeda(p.valorImplementacao) : 0,
        valorMensalidade: p.valorMensalidade ? parseMoeda(p.valorMensalidade) : 0,
        statusImplementacao: p.statusImplementacao,
        statusMensalidade: p.statusMensalidade
      })),
      criadoEm: editingCliente?.criadoEm || new Date().toISOString(),
      userId: userId
    };
    if (editingCliente) {
      await updateCliente(editingCliente.id, cliente);
      toast({ title: "Sucesso", description: "Cliente atualizado com sucesso!" });
    } else {
      await addCliente(cliente);
      toast({ title: "Sucesso", description: "Cliente cadastrado com sucesso!" });
    }
    setIsDialogOpen(false);
    setEditingCliente(null);
    reset();
  };

  const handleDelete = async (clienteId: string) => {
    await removeCliente(clienteId);
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

  // Função utilitária para formatar moeda brasileira
  function formatarMoedaBR(valor: string | number) {
    let num = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(num)) num = 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // Função para aplicar máscara de WhatsApp brasileiro
  function maskWhatsapp(value: string) {
    // Remove tudo que não for número
    let v = value.replace(/\D/g, "");
    v = v.slice(0, 11); // Limita a 11 dígitos
    if (v.length < 2) return v;
    if (v.length < 7) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
    if (v.length <= 11) return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`;
  }

  // Função para aplicar máscara de moeda brasileira em tempo real
  function maskMoedaBR(valor: string | number) {
    let v = typeof valor === 'number' ? valor.toString() : valor;
    v = v.replace(/\D/g, "");
    v = v.padStart(3, '0');
    let reais = v.slice(0, -2);
    let centavos = v.slice(-2);
    reais = reais.replace(/^0+/, '');
    reais = reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    let resultado = `R$ ${reais ? reais : '0'},${centavos}`;
    return resultado;
  }

  useEffect(() => {
    return () => setIsDialogOpen(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 capitalize leading-tight">Clientes</h2>
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
        {/* Dialog sempre montado, controlado por open/onOpenChange */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button ref={novoClienteButtonRef} onClick={handleNovoCliente} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
              <DialogDescription>
                {editingCliente
                  ? "Edite as informações do cliente e seus produtos."
                  : "Preencha as informações para cadastrar um novo cliente e seus produtos."}
              </DialogDescription>
              <p className="text-sm text-gray-600">
                {editingCliente ? "Edite as informações do cliente e seus produtos" : "Preencha as informações para cadastrar um novo cliente"}
              </p>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Cliente *</Label>
                  <Controller
                    name="nome"
                    control={control}
                    rules={{ required: "Nome é obrigatório", minLength: { value: 3, message: "Mínimo 3 caracteres" } }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="nome"
                        placeholder="Digite o nome do cliente"
                      />
                    )}
                  />
                  {errors.nome && <div className="text-red-500 text-xs mt-1">{errors.nome.message as string}</div>}
                </div>
                <div>
                  <Label htmlFor="diaVencimento">Dia de Vencimento</Label>
                  <Controller
                    name="diaVencimento"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => (
                            <SelectItem key={dia} value={dia.toString()}>Dia {dia}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Controller
                    name="email"
                    control={control}
                    rules={{ pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "E-mail inválido" } }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="email@exemplo.com"
                      />
                    )}
                  />
                  {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email.message as string}</div>}
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Controller
                    name="whatsapp"
                    control={control}
                    rules={{ pattern: { value: /^\(\d{2}\)\s9\d{4}-\d{4}$/, message: "Formato: (11) 99999-9999" } }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="whatsapp"
                        placeholder="(11) 99999-9999"
                      />
                    )}
                  />
                  {errors.whatsapp && <div className="text-red-500 text-xs mt-1">{errors.whatsapp.message as string}</div>}
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
                {produtosFields.map((produto, index) => (
                  <Card key={produto.id || index} className="p-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <Label>Produto</Label>
                          <Controller
                            name={`produtos.${index}.produtoId`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={value => {
                                  field.onChange(value);
                                  // Preencher valores automaticamente ao selecionar produto
                                  const produtoSelecionado = produtos.find((p: any) => p.id.toString() === value);
                                  if (produtoSelecionado) {
                                    setValue(`produtos.${index}.valorImplementacao`, produtoSelecionado.valorImplementacao ? maskMoedaBR(numeroParaCentavosString(produtoSelecionado.valorImplementacao)) : "");
                                    setValue(`produtos.${index}.valorMensalidade`, produtoSelecionado.valorMensalidade ? maskMoedaBR(numeroParaCentavosString(produtoSelecionado.valorMensalidade)) : "");
                                  }
                                }}
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
                            )}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Valor Implementação (R$)</Label>
                          <Controller
                            name={`produtos.${index}.valorImplementacao`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="text"
                                placeholder="R$ 0,00"
                              />
                            )}
                          />
                        </div>
                        <div>
                          <Label>Status Implementação</Label>
                          <Controller
                            name={`produtos.${index}.statusImplementacao`}
                            control={control}
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pendente">Pendente</SelectItem>
                                  <SelectItem value="pago">Pago</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Valor Mensalidade (R$)</Label>
                          <Controller
                            name={`produtos.${index}.valorMensalidade`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="text"
                                placeholder="R$ 0,00"
                              />
                            )}
                          />
                        </div>
                        <div>
                          <Label>Status Mensalidade</Label>
                          <Controller
                            name={`produtos.${index}.statusMensalidade`}
                            control={control}
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="a_pagar">A Pagar</SelectItem>
                                  <SelectItem value="pago">Pago</SelectItem>
                                  <SelectItem value="atrasado">Atrasado</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {produtosFields.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum produto adicionado. Clique em "Adicionar Produto" para começar.
                  </p>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCliente ? "Atualizar" : "Cadastrar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.isArray(clientes) && Array.from(new Map(clientes.filter(c => !!c.id).map(c => [c.id, c])).values()).map((cliente) => (
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
                        <p className="text-sm font-medium">{produto.nome || getProdutoNome(produto.produtoId)}</p>
                        
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
