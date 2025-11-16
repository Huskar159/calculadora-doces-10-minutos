import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  TrendingUp, 
  Heart, 
  DollarSign, 
  Clock, 
  Target,
  Copy,
  Sparkles,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { generatePricingPDF } from "@/utils/pdfGenerator";

interface PricingData {
  ingredients: Array<{ id: string; name: string; cost: number }>;
  prepTime: number;
  complexity: "beginner" | "intermediate" | "advanced";
  monthlyCosts: number;
  monthlyProduction: number;
}

interface PricingResultsProps {
  data: PricingData;
}

export const PricingResults = ({ data }: PricingResultsProps) => {
  // Cálculos
  const totalIngredientCost = data.ingredients.reduce((sum, ing) => sum + ing.cost, 0);
  const fixedCostPerUnit = data.monthlyProduction > 0 ? data.monthlyCosts / data.monthlyProduction : 0;
  
  // Valor da hora baseado em complexidade
  const hourlyRates = {
    beginner: 30,
    intermediate: 45,
    advanced: 70
  };
  const hourlyRate = hourlyRates[data.complexity];
  const laborCost = data.prepTime * hourlyRate;
  
  // Custos totais
  const totalCost = totalIngredientCost + fixedCostPerUnit + laborCost;
  
  // Preços com diferentes margens
  const minimumPrice = totalCost * 1.2; // 20% de lucro mínimo
  const fairPrice = totalCost * 1.5; // 50% de lucro justo
  const premiumPrice = totalCost * 1.8; // 80% de lucro premium
  
  // Comparação com salário mínimo
  const minimumWage = 1412; // Salário mínimo 2024
  const monthlyHours = 220; // horas de trabalho padrão
  const minimumWagePerHour = minimumWage / monthlyHours;
  const currentWagePerHour = laborCost / data.prepTime;
  
  // Simulação de cenários
  const monthlyGoal = 2000;
  const salesNeededLow = Math.ceil(monthlyGoal / (minimumPrice * 0.3)); // margem baixa
  const salesNeededFair = Math.ceil(monthlyGoal / (fairPrice * 0.5)); // margem justa

  const copyPriceTable = () => {
    const table = `
📊 TABELA DE PREÇOS

✨ Seu produto: ${data.ingredients[0]?.name || "Bolo"}

💰 PREÇOS SUGERIDOS:

🔸 Preço Mínimo: R$ ${minimumPrice.toFixed(2)}
   (Cobre custos + 20% de lucro)

🔸 Preço Justo: R$ ${fairPrice.toFixed(2)}
   (Recomendado - 50% de lucro)

🔸 Preço Premium: R$ ${premiumPrice.toFixed(2)}
   (Para clientes especiais - 80% de lucro)

⏱️ Tempo de preparo: ${data.prepTime}h de trabalho artesanal
🎨 Ingredientes premium selecionados
💝 Feito com dedicação e carinho

---
Gerado por Sistema de Precificação para Confeiteiras
    `.trim();
    
    navigator.clipboard.writeText(table);
    toast.success("Tabela copiada!", {
      description: "Cole no WhatsApp para enviar ao cliente"
    });
  };

  const downloadPDF = () => {
    try {
      generatePricingPDF(data);
      toast.success("PDF gerado com sucesso!", {
        description: "Download iniciado automaticamente"
      });
    } catch (error) {
      toast.error("Erro ao gerar PDF", {
        description: "Tente novamente"
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Alert de Conscientização */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <div className="flex gap-4">
          <div className="p-3 rounded-full bg-primary/20 h-fit">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 text-foreground">Você merece valorização!</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                ⏰ <strong>Você dedicou {data.prepTime} horas</strong> para fazer isso. 
                {currentWagePerHour < minimumWagePerHour ? (
                  <span className="text-destructive font-medium">
                    {" "}Você está se pagando R$ {currentWagePerHour.toFixed(2)}/hora, 
                    MENOS que o salário mínimo (R$ {minimumWagePerHour.toFixed(2)}/hora)!
                  </span>
                ) : (
                  <span className="text-primary font-medium">
                    {" "}Parabéns! Você está valorizando seu trabalho.
                  </span>
                )}
              </p>
              <p>
                💎 <strong>Seu conhecimento vale:</strong> anos de prática + testes + ingredientes 
                desperdiçados + cursos = investimento invisível que poucos percebem.
              </p>
              <p>
                🏠 <strong>Se o cliente fizesse em casa:</strong> gastaria mais com ingredientes 
                + horas de trabalho + risco de dar errado = mais caro que seu preço justo!
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Breakdown de Custos */}
      <Card className="p-6 shadow-soft">
        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Análise de Custos
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Ingredientes</span>
            <span className="font-medium">R$ {totalIngredientCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Custos fixos (por unidade)</span>
            <span className="font-medium">R$ {fixedCostPerUnit.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Mão de obra</span>
              <span className="text-xs text-muted-foreground">
                {data.prepTime}h × R$ {hourlyRate}/hora
              </span>
            </div>
            <span className="font-medium">R$ {laborCost.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Custo Total</span>
            <span className="text-primary">R$ {totalCost.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* Tabela de Preços */}
      <Card className="p-6 shadow-elevated bg-gradient-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-xl flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Preços Sugeridos
          </h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={copyPriceTable}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copiar
            </Button>
            <Button 
              size="sm"
              onClick={downloadPDF}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar PDF
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Preço Mínimo */}
          <div className="p-4 rounded-lg border border-border bg-background/50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <Badge variant="outline" className="mb-2">Sobrevivência</Badge>
                <p className="text-2xl font-bold">R$ {minimumPrice.toFixed(2)}</p>
              </div>
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Cobre custos + 20% de lucro. Use apenas em situações urgentes.
            </p>
          </div>

          {/* Preço Justo - DESTAQUE */}
          <div className="p-6 rounded-lg border-2 border-primary bg-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <Badge className="mb-2 bg-primary text-primary-foreground">Recomendado</Badge>
                <p className="text-3xl font-bold text-primary">R$ {fairPrice.toFixed(2)}</p>
              </div>
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium">
              Este é o preço que VALORIZA seu trabalho! 50% de lucro saudável.
            </p>
          </div>

          {/* Preço Premium */}
          <div className="p-4 rounded-lg border border-accent bg-accent/5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <Badge variant="secondary" className="mb-2">Exclusivo</Badge>
                <p className="text-2xl font-bold">R$ {premiumPrice.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-accent-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Para clientes que valorizam qualidade premium e exclusividade.
            </p>
          </div>
        </div>
      </Card>

      {/* Simulador de Cenários */}
      <Card className="p-6 shadow-soft">
        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Impacto na sua Vida
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Para ganhar R$ {monthlyGoal.toFixed(0)} por mês:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <p className="text-xs uppercase text-destructive font-medium mb-2">Preço Baixo</p>
            <p className="text-3xl font-bold text-destructive mb-2">{salesNeededLow}</p>
            <p className="text-sm text-muted-foreground">vendas necessárias</p>
            <p className="text-xs text-muted-foreground mt-2">
              = {(salesNeededLow * data.prepTime).toFixed(0)}h de trabalho/mês
            </p>
          </div>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs uppercase text-primary font-medium mb-2">Preço Justo</p>
            <p className="text-3xl font-bold text-primary mb-2">{salesNeededFair}</p>
            <p className="text-sm text-muted-foreground">vendas necessárias</p>
            <p className="text-xs text-muted-foreground mt-2">
              = {(salesNeededFair * data.prepTime).toFixed(0)}h de trabalho/mês
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-accent/10 border border-accent/20">
          <p className="text-sm font-medium text-center">
            💡 Trabalhe <strong>{((salesNeededLow - salesNeededFair) * data.prepTime).toFixed(0)}h a menos</strong> e 
            ganhe o mesmo usando o preço justo!
          </p>
        </div>
      </Card>

      {/* Scripts de Vendas */}
      <Card className="p-6 shadow-soft">
        <h3 className="font-semibold text-xl mb-4">💬 Como Apresentar Seu Preço</h3>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">Script Profissional:</p>
            <p className="text-sm text-muted-foreground italic">
              "Olá! O valor é R$ {fairPrice.toFixed(2)}. Este bolo leva {data.prepTime} horas de 
              trabalho artesanal cuidadoso. Uso apenas ingredientes premium selecionados e tenho 
              anos de experiência garantindo qualidade e sabor únicos. O valor inclui personalização 
              exclusiva para sua festa! 💝"
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">Se pechincharem:</p>
            <p className="text-sm text-muted-foreground italic">
              "Entendo que todo mundo busca o melhor custo-benefício! Meu trabalho é precificado 
              de forma justa considerando a qualidade dos ingredientes e o tempo de dedicação. 
              Não consigo baixar o valor sem comprometer a qualidade que você merece. Tenho certeza 
              que você vai amar o resultado! ✨"
            </p>
          </div>
        </div>
      </Card>

      {/* Mensagem Motivacional Final */}
      <Card className="p-6 bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30 shadow-elevated">
        <div className="text-center space-y-3">
          <Heart className="w-12 h-12 text-primary mx-auto" />
          <h3 className="font-bold text-xl text-foreground">Você é uma profissional!</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Seu trabalho tem valor. Sua dedicação tem valor. Suas horas de aprendizado têm valor. 
            Não tenha medo de cobrar pelo que você vale. Clientes que valorizam qualidade pagarão 
            com prazer pelo seu trabalho. Você merece prosperidade! 💪✨
          </p>
        </div>
      </Card>
    </div>
  );
};
