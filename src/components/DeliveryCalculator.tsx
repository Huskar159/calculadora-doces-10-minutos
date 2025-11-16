import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, MapPin, Calculator } from "lucide-react";
import { toast } from "sonner";

interface DeliveryZone {
  id: string;
  name: string;
  distance: number;
  baseFee: number;
}

export const DeliveryCalculator = () => {
  const [zones, setZones] = useState<DeliveryZone[]>([
    { id: "1", name: "Zona 1 (até 5km)", distance: 5, baseFee: 10 },
    { id: "2", name: "Zona 2 (5-10km)", distance: 10, baseFee: 15 },
    { id: "3", name: "Zona 3 (10-20km)", distance: 20, baseFee: 25 }
  ]);
  
  const [customDistance, setCustomDistance] = useState<number>(0);
  const [pricePerKm, setPricePerKm] = useState<number>(2.5);
  const [calculatedFee, setCalculatedFee] = useState<number | null>(null);

  const calculateCustomFee = () => {
    if (customDistance <= 0) {
      toast.error("Informe a distância");
      return;
    }

    const fee = customDistance * pricePerKm;
    setCalculatedFee(fee);
    
    toast.success("Taxa calculada!", {
      description: `R$ ${fee.toFixed(2)} para ${customDistance}km`
    });
  };

  const copyZoneTable = () => {
    const table = zones.map(zone => 
      `${zone.name}: R$ ${zone.baseFee.toFixed(2)}`
    ).join('\n');
    
    const text = `🚚 TABELA DE ENTREGA\n\n${table}\n\n📍 Consulte sua região!`;
    
    navigator.clipboard.writeText(text);
    toast.success("Tabela copiada!", {
      description: "Cole no WhatsApp para seus clientes"
    });
  };

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-full bg-primary/10">
          <Truck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Calculadora de Entrega</h3>
          <p className="text-xs text-muted-foreground">Defina suas zonas e taxas</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Zonas Pré-definidas */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <Label className="font-medium">Zonas de Entrega</Label>
            <Button size="sm" variant="outline" onClick={copyZoneTable}>
              Copiar Tabela
            </Button>
          </div>
          <div className="space-y-2">
            {zones.map(zone => (
              <div key={zone.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{zone.name}</span>
                </div>
                <span className="font-semibold">R$ {zone.baseFee.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calculadora Personalizada */}
        <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg space-y-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            <Label className="font-medium">Calcular Taxa Personalizada</Label>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm mb-1 block">Distância (km)</Label>
              <Input
                type="number"
                step="0.1"
                value={customDistance || ""}
                onChange={(e) => setCustomDistance(parseFloat(e.target.value) || 0)}
                placeholder="Ex: 7.5"
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">Preço por km</Label>
              <Input
                type="number"
                step="0.1"
                value={pricePerKm}
                onChange={(e) => setPricePerKm(parseFloat(e.target.value) || 2.5)}
                placeholder="Ex: 2.5"
              />
            </div>
          </div>

          <Button onClick={calculateCustomFee} className="w-full">
            Calcular Taxa
          </Button>

          {calculatedFee !== null && (
            <div className="p-3 bg-background rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Taxa de Entrega</p>
              <p className="text-2xl font-bold text-primary">R$ {calculatedFee.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Dica */}
        <div className="p-3 bg-accent/10 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Dica:</strong> Considere também o tempo de deslocamento e o custo de gasolina. 
            Uma taxa de R$ 2,50/km geralmente cobre os custos básicos.
          </p>
        </div>
      </div>
    </Card>
  );
};
