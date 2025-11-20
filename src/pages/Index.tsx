import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";
import CalculadoraPrecificacao from "@/components/PricingCalculator";
import { PricingResults } from "@/components/PricingResults";
import { DeliveryCalculator } from "@/components/DeliveryCalculator";
import { Heart, Trash2, Lock, Clock, Phone, Copy } from "lucide-react";
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
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const totalMs = 10 * 60 * 1000;
  const [expired, setExpired] = useState(false);
  const [accessStatus, setAccessStatus] = useState<"teste" | "block" | "pago" | null>(null);
  const [trialExpiry, setTrialExpiry] = useState<number | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const PIX_KEY = "45248866000154";
  const WHATSAPP_URL = "https://wa.me/5561981662814?text=Fiz%20o%20PIX%2C%20vou%20enviar%20o%20comprovante.";

  // Carregar receitas do Supabase
  useEffect(() => {
    const loadRecipes = async () => {
      const whatsapp = localStorage.getItem('whatsapp');
      if (!whatsapp) { setSavedRecipes([]); return; }
      const { data, error } = await supabase
        .from('recipes')
        .select('id, name, ingredients, custos_extras, lucro_desejado, resultado, created_at')
        .eq('whatsapp', whatsapp)
        .order('created_at', { ascending: false });
      if (error) { console.error('Erro ao carregar receitas:', error.message); return; }
      setSavedRecipes(data || []);
    };
    loadRecipes();
  }, []);

  // Carregar status de acesso do Supabase (view)
  useEffect(() => {
    const loadAccess = async () => {
      const whatsapp = localStorage.getItem('whatsapp');
      if (!whatsapp) { setAccessStatus('teste'); return; }
      const { data, error } = await supabase
        .from('clients_with_effective_status')
        .select('effective_status, trial_expires_at')
        .eq('whatsapp', whatsapp)
        .maybeSingle();
      if (error) { console.error('Erro ao consultar acesso:', error.message); return; }
      if (!data) { setAccessStatus('teste'); return; }
      const eff = (data as any).effective_status as 'teste' | 'block' | 'pago';
      setAccessStatus(eff);
      if (eff === 'block') setExpired(true);
      if (eff === 'teste') {
        const expIso = (data as any).trial_expires_at as string | null;
        if (expIso) setTrialExpiry(new Date(expIso).getTime());
      }
      if (eff === 'pago') setExpired(false);
    };
    loadAccess();
  }, []);

  // Polling leve para refletir mudanças
  useEffect(() => {
    const whatsapp = localStorage.getItem('whatsapp');
    if (!whatsapp) return;
    if (accessStatus === 'block') return;
    const id = setInterval(async () => {
      const { data } = await supabase
        .from('clients_with_effective_status')
        .select('effective_status, trial_expires_at')
        .eq('whatsapp', whatsapp)
        .maybeSingle();
      if (data) {
        const eff = (data as any).effective_status as 'teste' | 'block' | 'pago';
        setAccessStatus(eff);
        if (eff === 'teste') {
          const expIso = (data as any).trial_expires_at as string | null;
          if (expIso) setTrialExpiry(new Date(expIso).getTime());
        }
      }
    }, 5000);
    return () => clearInterval(id);
  }, [accessStatus]);

  // Timer baseado no trial_expires_at
  useEffect(() => {
    if (!trialExpiry) return;
    const tick = () => {
      const remaining = Math.max(0, trialExpiry - Date.now());
      setTimeLeft(remaining);
      if (remaining === 0) { setExpired(true); setAccessStatus('block'); }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [trialExpiry]);

  const mmss = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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
    const transformed = {
      name: recipe.name,
      ingredients: (recipe.ingredients || []).map((ing: any) => ({
        nome: ing.nome,
        custoPacote: ing.custoPacote,
        pesoPacote: ing.pesoPacote,
        quantidadeUsada: ing.quantidadeUsada,
        unidade: ing.unidade,
      })),
      custosExtras: recipe.custos_extras || { embalagem: 0, gas: 0, outros: 0 },
      lucroDesejado: recipe.lucro_desejado ?? 50,
      resultado: recipe.resultado,
      createdAt: recipe.created_at,
    };
    localStorage.setItem('loadedRecipe', JSON.stringify(transformed));
    setActiveTab("calculator");
  };

  const handleDeleteRecipe = async (recipeId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return;
    const { error } = await supabase.from('recipes').delete().eq('id', recipeId);
    if (error) { console.error('Erro ao excluir receita:', error.message); return; }
    setSavedRecipes((prev) => prev.filter((r: any) => r.id !== recipeId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {accessStatus !== 'block' && (
        <section className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {accessStatus === 'teste' && (
              <div className="mb-6 max-w-3xl mx-auto">
                <div className="bg-white/70 backdrop-blur rounded-xl border border-pink-100 p-4 sm:p-5">
                  <div className="flex flex-col items-start text-left gap-2 md:flex-row md:items-center md:justify-between md:text-left md:gap-3 mb-2">
                    <div className="flex items-center gap-2 text-pink-700 font-semibold">
                      <Clock className="w-4 h-4" />
                      <span><span className="font-bold">Seu teste expira em:</span> {mmss(timeLeft)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Aproveite! Depois que o tempo acabar, o acesso será bloqueado.</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-pink-100 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-[width] duration-1000" style={{ width: `${Math.max(0, Math.min(100, (timeLeft / totalMs) * 100))}%` }} />
                  </div>
                </div>
              </div>
            )}

            {accessStatus !== 'pago' && (
              <div className="mb-6 max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-pink-100 p-6">
                  <div className="text-xl font-extrabold text-rose-600 mb-2">Últimas 3 vagas de R$97 por R$19,90</div>
                  <div className="text-sm text-gray-500 mb-4">Valor especial apenas durante seu período de teste.</div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <div className="flex items-center gap-1" aria-hidden>
                      <span className="text-rose-500">⬤⬤⬤</span>
                      <span className="text-gray-300">○ ○</span>
                    </div>
                    <span className="text-xs text-gray-500">3 de 5 vagas disponíveis</span>
                  </div>
                  <ul className="text-sm space-y-2 mb-5">
                    <li>• Acesso ilimitado à calculadora</li>
                    <li>• Atualizações futuras gratuitas</li>
                    <li>• Suporte pelo WhatsApp</li>
                    <li>• Evite erros de precificação</li>
                    <li>• Aumente sua margem de lucro instantaneamente</li>
                  </ul>
                  <button onClick={() => setShowPixModal(true)} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all animate-[pulse_3s_ease-in-out_infinite] flex items-center justify-center gap-2">
                    <Lock className="w-5 h-5" />
                    Liberar acesso completo por R$19,90
                  </button>
                  <div className="mt-3 text-center text-xs text-gray-500">
                    <div>Pagamento via PIX e liberação imediata.</div>
                    <div>Oferta válida somente durante o teste.</div>
                  </div>
                </div>
              </div>
            )}

            <div className="max-w-3xl mx-auto">
              <div className="text-center space-y-3 mb-4">
                <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">Calcule o preço dos seus doces de forma simples. 🧁</h2>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedRecipes.map((recipe: any) => (
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
                            <span className="font-medium">{(recipe.ingredients || []).length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Custo Total:</span>
                            <span className="font-medium text-pink-600">R$ {recipe.resultado?.custoTotal || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Lucro:</span>
                            <span className="font-medium">{recipe.lucro_desejado}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Data:</span>
                            <span className="font-medium">{new Date(recipe.created_at).toLocaleDateString('pt-BR')}</span>
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
          </div>
        </section>
      )}

      {accessStatus !== 'block' && (
        <footer className="py-8 px-4 border-t border-border mt-8">
          <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
            <p className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-2 mb-2">
              <span className="text-sm sm:text-base">Feito com</span>
              <Heart className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm sm:text-base">para confeiteiras que merecem prosperidade</span>
            </p>
            <p className="text-xs sm:text-sm">Todos os cálculos são salvos automaticamente no seu navegador</p>
            <p className="text-xs sm:text-sm mt-2">Oferta válida apenas durante o teste</p>
          </div>
        </footer>
      )}

      {expired && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
            <div className="mx-auto w-12 h-12 mb-3 rounded-full bg-rose-100 text-rose-600 grid place-items-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Seu teste terminou!</h3>
            <p className="text-gray-600 mb-4">Para continuar usando a calculadora, libere o acesso completo. Últimas 3 vagas de R$97 por R$19,90.</p>
            <button onClick={() => setShowPixModal(true)} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              Liberar acesso por R$19,90
            </button>
            <div className="mt-3 text-xs text-gray-500">Pagamento por PIX • Acesso liberado automaticamente</div>
          </div>
        </div>
      )}

      {showPixModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-extrabold text-gray-900">Pagamento via PIX</h3>
              <button onClick={() => setShowPixModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Copie a chave PIX abaixo, faça o pagamento de <span className="font-semibold">R$19,90</span> e envie o comprovante no WhatsApp. O recebedor é <span className="font-semibold">Victor Alves de Almeida</span>.</p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3 flex items-center justify-between">
              <div className="text-sm font-mono break-all pr-3">{PIX_KEY}</div>
              <button onClick={async () => { try { await navigator.clipboard.writeText(PIX_KEY); setCopied(true); setTimeout(() => setCopied(false), 1500);} catch {} }} className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-100">
                <Copy className="w-4 h-4" /> {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button onClick={async () => { try { await navigator.clipboard.writeText(PIX_KEY); setCopied(true); setTimeout(() => setCopied(false), 1500);} catch {} }} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-xl font-medium hover:bg-gray-800">
                <Copy className="w-5 h-5" /> Copiar chave PIX
              </button>
              <button onClick={() => window.open(WHATSAPP_URL, "_blank")} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-600">
                <Phone className="w-5 h-5" /> Enviar comprovante no WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
