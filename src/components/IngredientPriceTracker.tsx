import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PriceHistory {
  ingredientName: string;
  currentPrice: number;
  previousPrice?: number;
  date: string;
}

interface IngredientPriceTrackerProps {
  currentIngredients: Array<{ name: string; cost: number }>;
}

export const IngredientPriceTracker = ({ currentIngredients }: IngredientPriceTrackerProps) => {
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [totalInflation, setTotalInflation] = useState<number>(0);

  useEffect(() => {
    loadPriceHistory();
  }, []);

  const loadPriceHistory = () => {
    const saved = localStorage.getItem("ingredientPriceHistory");
    if (saved) {
      try {
        setPriceHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading price history", e);
      }
    }
  };

  const trackCurrentPrices = () => {
    if (currentIngredients.length === 0 || currentIngredients[0].name === "") {
      toast.error("Preencha os ingredientes primeiro");
      return;
    }

    const today = new Date().toLocaleDateString('pt-BR');
    const updatedHistory: PriceHistory[] = [];

    currentIngredients.forEach(ing => {
      if (ing.name && ing.cost > 0) {
        const existing = priceHistory.find(h => h.ingredientName === ing.name);
        
        updatedHistory.push({
          ingredientName: ing.name,
          currentPrice: ing.cost,
          previousPrice: existing?.currentPrice,
          date: today
        });
      }
    });

    setPriceHistory(updatedHistory);
    localStorage.setItem("ingredientPriceHistory", JSON.stringify(updatedHistory));

    // Calcular inflação total
    let totalChange = 0;
    let count = 0;
    updatedHistory.forEach(item => {
      if (item.previousPrice && item.previousPrice > 0) {
        const change = ((item.currentPrice - item.previousPrice) / item.previousPrice) * 100;
        totalChange += change;
        count++;
      }
    });

    if (count > 0) {
      const avgInflation = totalChange / count;
      setTotalInflation(avgInflation);
    }

    toast.success("Preços registrados!", {
      description: `${updatedHistory.length} ingredientes rastreados`
    });
  };

  const getPriceChange = (current: number, previous?: number) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  const getPriceChangeIcon = (change: number | null) => {
    if (change === null) return <Minus className="w-4 h-4" />;
    if (change > 5) return <TrendingUp className="w-4 h-4 text-destructive" />;
    if (change < -5) return <TrendingDown className="w-4 h-4 text-green-600" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <Card className="p-6 shadow-soft">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Rastreador de Preços
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Acompanhe a variação de preços dos ingredientes
            </p>
          </div>
          <Button size="sm" onClick={trackCurrentPrices}>
            Registrar Preços Atuais
          </Button>
        </div>

        {totalInflation !== 0 && (
          <div className={`p-3 rounded-lg ${totalInflation > 0 ? 'bg-destructive/10' : 'bg-green-600/10'}`}>
            <div className="flex items-center gap-2">
              <AlertCircle className={`w-4 h-4 ${totalInflation > 0 ? 'text-destructive' : 'text-green-600'}`} />
              <p className="text-sm font-medium">
                Variação média: {totalInflation > 0 ? '+' : ''}{totalInflation.toFixed(1)}%
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalInflation > 0 
                ? "Seus custos aumentaram. Considere reajustar os preços!" 
                : "Seus custos diminuíram. Ótimo para aumentar margem de lucro!"}
            </p>
          </div>
        )}

        {priceHistory.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum histórico de preços ainda</p>
            <p className="text-xs">Clique em "Registrar Preços Atuais" para começar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {priceHistory.map((item, idx) => {
              const change = getPriceChange(item.currentPrice, item.previousPrice);
              return (
                <div key={idx} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.ingredientName}</p>
                    <p className="text-xs text-muted-foreground">
                      Último registro: {item.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">R$ {item.currentPrice.toFixed(2)}</p>
                      {item.previousPrice && (
                        <p className="text-xs text-muted-foreground">
                          era R$ {item.previousPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {getPriceChangeIcon(change)}
                      {change !== null && (
                        <Badge 
                          variant={change > 5 ? "destructive" : change < -5 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {change > 0 ? '+' : ''}{change.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
