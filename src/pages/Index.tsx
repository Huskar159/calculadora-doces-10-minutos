import { useState, useEffect } from "react";
import CalculadoraPrecificacao from "@/components/PricingCalculator";
import { PricingResults } from "@/components/PricingResults";
import { DeliveryCalculator } from "@/components/DeliveryCalculator";
import { Heart, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PricingData {
  ingredients: Array<{ id: string; name: string; cost: number }>;
  prepTime: number;
  complexity: "beginner" | "intermediate" | "advanced";
  monthlyCosts: number;
  monthlyProduction: number;
}

const Index = () => {
  const [calculatedData, setCalculatedData] = useState<PricingData | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("calculator");

  // Carregar receitas salvas do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedRecipes');
    if (saved) {
      try {
        setSavedRecipes(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao carregar receitas:', e);
      }
    }
  }, []);

  const handleCalculate = (data: PricingData) => {
    setCalculatedData(data);
    // Scroll suave até os resultados
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    }, 100);
  };

  const handleLoadRecipe = (recipe: any) => {
    // Salvar a receita no localStorage para a calculadora pegar
    localStorage.setItem('loadedRecipe', JSON.stringify(recipe));
    
    // Mudar para aba da calculadora
    setActiveTab("calculator");
  };

  const handleDeleteRecipe = (recipeId: number) => {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      const updatedRecipes = savedRecipes.filter(recipe => recipe.id !== recipeId);
      setSavedRecipes(updatedRecipes);
      localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Mensagem de Boas-Vindas */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
              Calcule o preço dos seus doces de forma simples. 🧁
            </h2>
          </div>

          {/* Tabs com funcionalidades */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calculator">Calculadora</TabsTrigger>
              <TabsTrigger value="recipes">Minhas Receitas</TabsTrigger>
              <TabsTrigger value="delivery">Entrega</TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="space-y-6">
              <CalculadoraPrecificacao />
              
              {calculatedData && (
                <div id="results" className="scroll-mt-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                      Seus Resultados ✨
                    </h2>
                    <p className="text-muted-foreground">
                      Prepare-se para se surpreender com o que você realmente vale!
                    </p>
                  </div>
                  <PricingResults data={calculatedData} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="recipes" className="space-y-6">
              <div className="bg-pink-50 rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  📚 Minhas Receitas Salvas
                </h2>
                
                {savedRecipes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🧁</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Nenhuma receita salva ainda
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Use a calculadora para criar suas receitas e salve-as para acessar depois!
                    </p>
                    <button
                      onClick={() => setActiveTab("calculator")}
                      className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                      Ir para Calculadora
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedRecipes.map((recipe) => (
                      <div key={recipe.id} className="bg-white rounded-xl shadow-md p-4 border border-pink-200">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-gray-800 text-lg">{recipe.name}</h3>
                          <button
                            onClick={() => handleDeleteRecipe(recipe.id)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex justify-between">
                            <span>Ingredientes:</span>
                            <span className="font-medium">{recipe.ingredients.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Custo Total:</span>
                            <span className="font-medium text-pink-600">R$ {recipe.resultado?.custoTotal || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Lucro:</span>
                            <span className="font-medium">{recipe.lucroDesejado}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Data:</span>
                            <span className="font-medium">
                              {new Date(recipe.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleLoadRecipe(recipe)}
                          className="w-full bg-pink-500 text-white py-2 rounded-lg font-medium hover:bg-pink-600 transition-colors"
                        >
                          Carregar Receita
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="delivery">
              <DeliveryCalculator />
            </TabsContent>

          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border mt-16">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2 mb-2">
            Feito com <Heart className="w-4 h-4 text-primary fill-primary" /> para confeiteiras que merecem prosperidade
          </p>
          <p className="text-xs">
            Todos os cálculos são salvos automaticamente no seu navegador
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
