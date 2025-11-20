import React, { useState, useEffect } from 'react';
import supabase from "@/lib/supabaseClient";
import { Trash2, Plus, Calculator, DollarSign, TrendingUp, Save } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Ingrediente {
  id: number;
  nome: string;
  custoPacote: string;
  pesoPacote: string;
  quantidadeUsada: string;
  unidade: 'g' | 'kg' | 'xicara' | 'colher' | 'unidade';
}

interface CustosExtras {
  embalagem: string;
  gas: string;
  outros: string;
}

interface Resultado {
  custoIngredientes: string;
  custosExtras: string;
  custoTotal: string;
  precoMinimo: string;
  precoCompetitivo: string;
  precoIdeal: string;
  precoComLucro: string;
  lucroMinimo: string;
  lucroCompetitivo: string;
  lucroIdeal: string;
}

export default function CalculadoraPrecificacao() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);

  // Carregar dados do localStorage se existirem
  useEffect(() => {
    const saved = localStorage.getItem('loadedRecipe');
    if (saved) {
      try {
        const recipe = JSON.parse(saved);
        // Converter dados da receita para o formato da calculadora
        const loadedIngredients = recipe.ingredients.map((ing: any) => ({
          id: Date.now() + Math.random(),
          nome: ing.nome || '',
          custoPacote: ing.custoPacote?.toString() || '',
          pesoPacote: ing.pesoPacote?.toString() || '',
          quantidadeUsada: ing.quantidadeUsada?.toString() || '',
          unidade: ing.unidade || 'g'
        }));
        
        setIngredientes(loadedIngredients.length > 0 ? loadedIngredients : [
          { id: 1, nome: '', custoPacote: '', pesoPacote: '', quantidadeUsada: '', unidade: 'g' }
        ]);
        
        // Carregar custos extras se existirem
        if (recipe.custosExtras) {
          setCustosExtras({
            embalagem: recipe.custosExtras.embalagem?.toString() || '',
            gas: recipe.custosExtras.gas?.toString() || '',
            outros: recipe.custosExtras.outros?.toString() || ''
          });
        }
        
        // Carregar lucro desejado se existir
        if (recipe.lucroDesejado) {
          setLucroDesejado(recipe.lucroDesejado);
        }
        
        // Limpar o localStorage após carregar
        localStorage.removeItem('loadedRecipe');
      } catch (e) {
        console.error('Erro ao carregar receita:', e);
      }
    } else {
      // Dados iniciais padrão
      setIngredientes([
        { id: 1, nome: '', custoPacote: '', pesoPacote: '', quantidadeUsada: '', unidade: 'g' }
      ]);
    }
  }, []);

  const [custosExtras, setCustosExtras] = useState<CustosExtras>({
    embalagem: '',
    gas: '',
    outros: ''
  });
  const [lucroDesejado, setLucroDesejado] = useState(50);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const adicionarIngrediente = () => {
    setIngredientes([
      ...ingredientes,
      { id: Date.now(), nome: '', custoPacote: '', pesoPacote: '', quantidadeUsada: '', unidade: 'g' }
    ]);
  };

  const removerIngrediente = (id: number) => {
    if (ingredientes.length > 1) {
      setIngredientes(ingredientes.filter(ing => ing.id !== id));
    }
  };

  const atualizarIngrediente = (id: number, campo: keyof Ingrediente, valor: string) => {
    setIngredientes(ingredientes.map(ing => 
      ing.id === id ? { ...ing, [campo]: valor } : ing
    ));
  };

  const calcularPreco = () => {
    // Calcular custo dos ingredientes
    let custoIngredientes = 0;
    
    ingredientes.forEach(ing => {
      const custoPacote = parseFloat(ing.custoPacote) || 0;
      const pesoPacote = parseFloat(ing.pesoPacote) || 1;
      const quantidadeUsada = parseFloat(ing.quantidadeUsada) || 0;
      
      // Converter quantidade usada para gramas se necessário
      let quantidadeEmGramas = quantidadeUsada;
      if (ing.unidade === 'kg') {
        quantidadeEmGramas = quantidadeUsada * 1000;
      } else if (ing.unidade === 'xicara') {
        quantidadeEmGramas = quantidadeUsada * 120; // 1 xícara ≈ 120g
      } else if (ing.unidade === 'colher') {
        quantidadeEmGramas = quantidadeUsada * 15; // 1 colher sopa ≈ 15g
      } else if (ing.unidade === 'unidade') {
        quantidadeEmGramas = quantidadeUsada * 50; // valor médio
      }
      
      const custoUnitario = custoPacote / pesoPacote;
      custoIngredientes += custoUnitario * quantidadeEmGramas;
    });

    // Custos extras
    const embalagem = parseFloat(custosExtras.embalagem) || 0;
    const gas = parseFloat(custosExtras.gas) || 0;
    const outros = parseFloat(custosExtras.outros) || 0;
    
    const totalCustosExtras = embalagem + gas + outros;
    const custoTotal = custoIngredientes + totalCustosExtras;
    
    // Calcular preços com diferentes margens
    const precoComLucro = custoTotal * (1 + lucroDesejado / 100);
    const precoMinimo = custoTotal * 1.30; // 30% lucro mínimo
    const precoCompetitivo = custoTotal * 1.50; // 50% lucro
    const precoIdeal = custoTotal * 1.70; // 70% lucro

    setResultado({
      custoIngredientes: custoIngredientes.toFixed(2),
      custosExtras: totalCustosExtras.toFixed(2),
      custoTotal: custoTotal.toFixed(2),
      precoMinimo: precoMinimo.toFixed(2),
      precoCompetitivo: precoCompetitivo.toFixed(2),
      precoIdeal: precoIdeal.toFixed(2),
      precoComLucro: precoComLucro.toFixed(2),
      lucroMinimo: (precoMinimo - custoTotal).toFixed(2),
      lucroCompetitivo: (precoCompetitivo - custoTotal).toFixed(2),
      lucroIdeal: (precoIdeal - custoTotal).toFixed(2)
    });

    // Rolar suavemente até os resultados
    setTimeout(() => {
      const resultsElement = document.getElementById('resultados');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const salvarReceita = async () => {
    if (!resultado) {
      toast.error("Primeiro calcule o preço da receita");
      return;
    }

    const recipeName = prompt("Nome da receita:");
    if (!recipeName) return;

    const whatsapp = localStorage.getItem('whatsapp');
    if (!whatsapp) {
      toast.error("Faça login com seu WhatsApp para salvar");
      return;
    }

    const receita = {
      id: Date.now(),
      name: recipeName,
      ingredients: ingredientes.map(ing => ({
        nome: ing.nome,
        custoPacote: parseFloat(ing.custoPacote) || 0,
        pesoPacote: parseFloat(ing.pesoPacote) || 0,
        quantidadeUsada: parseFloat(ing.quantidadeUsada) || 0,
        unidade: ing.unidade
      })),
      custosExtras: {
        embalagem: parseFloat(custosExtras.embalagem) || 0,
        gas: parseFloat(custosExtras.gas) || 0,
        outros: parseFloat(custosExtras.outros) || 0
      },
      lucroDesejado: lucroDesejado,
      resultado: resultado,
      createdAt: new Date().toISOString()
    };

    // Salvar no Supabase
    const { error } = await supabase.from('recipes').insert({
      whatsapp,
      name: receita.name,
      ingredients: receita.ingredients,
      custos_extras: receita.custosExtras,
      lucro_desejado: receita.lucroDesejado,
      resultado: receita.resultado,
    });
    if (error) {
      console.error('Erro ao salvar receita:', error.message);
      toast.error('Erro ao salvar receita');
      return;
    }
    toast.success(`Receita "${recipeName}" salva com sucesso!`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-pink-50 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-pink-100 p-3 rounded-xl">
              <Calculator className="w-6 h-6 text-pink-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Calculadora Simples de Preço
            </h1>
          </div>
          <p className="text-gray-600 ml-[60px]">
            Descubra quanto cobrar pelos seus doces de forma fácil
          </p>
        </div>

        {/* Seção Ingredientes */}
        <div className="bg-pink-50 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🍰 Ingredientes da Receita
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Exemplo: Você comprou 1kg de farinha por R$ 5,00 e vai usar 200g na receita
          </p>

          {ingredientes.map((ing, index) => (
            <div key={ing.id} className="mb-4 p-4 bg-pink-100 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ingrediente
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Farinha"
                    value={ing.nome}
                    onChange={(e) => atualizarIngrediente(ing.id, 'nome', e.target.value)}
                    className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço do pacote (R$)
                  </label>
                  <input
                    type="number"
                    placeholder="5.00"
                    value={ing.custoPacote}
                    onChange={(e) => atualizarIngrediente(ing.id, 'custoPacote', e.target.value)}
                    className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso do pacote (g)
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={ing.pesoPacote}
                    onChange={(e) => atualizarIngrediente(ing.id, 'pesoPacote', e.target.value)}
                    className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Quanto vem no pacote em gramas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade usada
                  </label>
                  <input
                    type="number"
                    placeholder="200"
                    value={ing.quantidadeUsada}
                    onChange={(e) => atualizarIngrediente(ing.id, 'quantidadeUsada', e.target.value)}
                    className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unidade
                    </label>
                    <select
                      value={ing.unidade}
                      onChange={(e) => atualizarIngrediente(ing.id, 'unidade', e.target.value)}
                      className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                    >
                      <option value="g">gramas</option>
                      <option value="kg">kg</option>
                      <option value="xicara">xícara</option>
                      <option value="colher">colher</option>
                      <option value="unidade">unidade</option>
                    </select>
                  </div>
                  {ingredientes.length > 1 && (
                    <button
                      onClick={() => removerIngrediente(ing.id)}
                      className="p-2 text-red-500 hover:bg-pink-100 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={adicionarIngrediente}
            className="w-full mt-2 py-3 border-2 border-dashed border-pink-300 rounded-xl text-pink-600 font-medium hover:bg-pink-100 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar mais ingrediente
          </button>
        </div>

        {/* Custos Extras */}
        <div className="bg-pink-50 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            💰 Outros Custos (por unidade)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Embalagem (R$)
              </label>
              <input
                type="number"
                placeholder="2.00"
                value={custosExtras.embalagem}
                onChange={(e) => setCustosExtras({...custosExtras, embalagem: e.target.value})}
                className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Caixa, saco, fita, etc</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gás/Energia (R$)
              </label>
              <input
                type="number"
                placeholder="1.00"
                value={custosExtras.gas}
                onChange={(e) => setCustosExtras({...custosExtras, gas: e.target.value})}
                className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Custo de forno/fogão</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Outros (R$)
              </label>
              <input
                type="number"
                placeholder="0.50"
                value={custosExtras.outros}
                onChange={(e) => setCustosExtras({...custosExtras, outros: e.target.value})}
                className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Água, luz, etc</p>
            </div>
          </div>
        </div>

        {/* Lucro Desejado */}
        <div className="bg-pink-50 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            📊 Quanto quer de lucro?
          </h2>
          
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="30"
              max="100"
              value={lucroDesejado}
              onChange={(e) => setLucroDesejado(Number(e.target.value))}
              className="flex-1 h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${(lucroDesejado - 30) / 0.7}%, #fce7f3 ${(lucroDesejado - 30) / 0.7}%, #fce7f3 100%)` 
              }}
            />
            <span className="text-2xl font-bold text-pink-600 min-w-[80px]">
              {lucroDesejado}%
            </span>
          </div>
          
          <div className="mt-3 flex justify-between text-sm text-gray-600">
            <span>Mínimo (30%)</span>
            <span>Ideal (50-70%)</span>
            <span>Premium (100%)</span>
          </div>
        </div>

        {/* Botão Calcular */}
        <button
          onClick={calcularPreco}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mb-6"
        >
          <TrendingUp className="w-6 h-6" />
          Calcular Preço Ideal
        </button>

        {/* Resultado */}
        {resultado && (
          <div id="resultados" className="space-y-4">
            {/* Análise de Custos */}
            <div className="bg-pink-50 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Análise de Custos</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Ingredientes:</span>
                  <span className="font-semibold">R$ {resultado.custoIngredientes}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Embalagem + Extras:</span>
                  <span className="font-semibold">R$ {resultado.custosExtras}</span>
                </div>
                <div className="flex justify-between py-3 bg-pink-100 px-3 rounded-lg">
                  <span className="font-bold text-gray-800">Custo Total:</span>
                  <span className="font-bold text-pink-600 text-xl">R$ {resultado.custoTotal}</span>
                </div>
              </div>
            </div>

            {/* Preços Sugeridos */}
            <div className="bg-pink-50 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">💵 Preços Sugeridos</h3>
              
              <div className="space-y-3">
                {/* Preço Mínimo */}
                <div className="p-4 border-2 border-pink-300 bg-pink-100 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-orange-700">⚠️ Preço Mínimo (30%)</span>
                    <span className="text-2xl font-bold text-orange-600">R$ {resultado.precoMinimo}</span>
                  </div>
                  <p className="text-xs text-orange-600">
                    Lucro: R$ {resultado.lucroMinimo} • Use apenas em promoções urgentes
                  </p>
                </div>

                {/* Preço Competitivo */}
                <div className="p-4 border-2 border-pink-300 bg-pink-100 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-green-700">✅ Preço Competitivo (50%)</span>
                    <span className="text-2xl font-bold text-green-600">R$ {resultado.precoCompetitivo}</span>
                  </div>
                  <p className="text-xs text-green-600">
                    Lucro: R$ {resultado.lucroCompetitivo} • Bom equilíbrio entre lucro e vendas
                  </p>
                </div>

                {/* Preço Ideal */}
                <div className="p-4 border-2 border-pink-300 bg-pink-50 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-pink-700">⭐ Preço Ideal (70%)</span>
                    <span className="text-2xl font-bold text-pink-600">R$ {resultado.precoIdeal}</span>
                  </div>
                  <p className="text-xs text-pink-600">
                    Lucro: R$ {resultado.lucroIdeal} • Para produtos exclusivos e encomendas
                  </p>
                </div>

                {/* Preço Personalizado */}
                {lucroDesejado !== 50 && (
                  <div className="p-4 border-2 border-pink-300 bg-pink-100 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-purple-700">
                        🎯 Seu Preço ({lucroDesejado}% lucro)
                      </span>
                      <span className="text-2xl font-bold text-purple-600">R$ {resultado.precoComLucro}</span>
                    </div>
                    <p className="text-xs text-purple-600">
                      Lucro: R$ {(parseFloat(resultado.precoComLucro) - parseFloat(resultado.custoTotal)).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Dicas */}
            <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">💡 Dicas Importantes</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 font-bold">•</span>
                  <span>Nunca cobre abaixo do custo total! Você trabalhará de graça.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 font-bold">•</span>
                  <span>O preço competitivo (50%) é o mínimo saudável para seu negócio crescer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 font-bold">•</span>
                  <span>Para encomendas personalizadas, sempre use o preço ideal (70%) ou mais.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 font-bold">•</span>
                  <span>Seu trabalho, tempo e conhecimento TÊM VALOR! Não tenha medo de cobrar justo.</span>
                </li>
              </ul>
            </div>

            {/* Botão Salvar Receita */}
            <button
              onClick={salvarReceita}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Salvar Receita
            </button>
          </div>
        )}
    </div>
  );
}
