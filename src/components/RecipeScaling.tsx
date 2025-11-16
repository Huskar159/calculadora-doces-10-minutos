import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface RecipeScalingProps {
  currentIngredients: Array<{ name: string; cost: number }>;
  onScaledRecipe: (scaledIngredients: Array<{ name: string; cost: number }>, multiplier: number) => void;
}

export const RecipeScaling = ({ currentIngredients, onScaledRecipe }: RecipeScalingProps) => {
  const [multiplier, setMultiplier] = useState<number>(1);

  const handleScale = () => {
    if (multiplier <= 0) {
      toast.error("Multiplicador deve ser maior que zero");
      return;
    }

    if (currentIngredients.length === 0 || currentIngredients[0].name === "") {
      toast.error("Preencha os ingredientes primeiro");
      return;
    }

    const scaledIngredients = currentIngredients.map(ing => ({
      name: ing.name,
      cost: ing.cost * multiplier
    }));

    onScaledRecipe(scaledIngredients, multiplier);
    
    toast.success("Receita escalada!", {
      description: `Valores multiplicados por ${multiplier}x`
    });
  };

  const totalCurrent = currentIngredients.reduce((sum, ing) => sum + ing.cost, 0);
  const totalScaled = totalCurrent * multiplier;

  return (
    <Card className="p-4 bg-gradient-to-br from-accent/5 to-secondary/5">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Escalador de Receita</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="text-sm mb-2 block">Multiplicar receita por:</Label>
          <div className="flex gap-2">
            {[0.5, 1, 2, 3, 4].map(val => (
              <Button
                key={val}
                size="sm"
                variant={multiplier === val ? "default" : "outline"}
                onClick={() => setMultiplier(val)}
                className="flex-1"
              >
                {val}x
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Valor personalizado:</Label>
          <Input
            type="number"
            step="0.5"
            min="0.1"
            value={multiplier}
            onChange={(e) => setMultiplier(parseFloat(e.target.value) || 1)}
            placeholder="Ex: 1.5"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-background rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Custo Atual</p>
            <p className="font-semibold">R$ {totalCurrent.toFixed(2)}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Custo Escalado</p>
            <p className="font-semibold text-primary">R$ {totalScaled.toFixed(2)}</p>
          </div>
        </div>

        <Button onClick={handleScale} className="w-full">
          Aplicar Escala
        </Button>
      </div>
    </Card>
  );
};
