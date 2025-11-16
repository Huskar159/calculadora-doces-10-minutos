import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Save, Trash2, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SavedRecipe {
  id: string;
  name: string;
  ingredients: Array<{ name: string; cost: number }>;
  prepTime: number;
  complexity: "beginner" | "intermediate" | "advanced";
  savedDate: string;
}

interface RecipeLibraryProps {
  onLoadRecipe: (recipe: SavedRecipe) => void;
}

export const RecipeLibrary = ({ onLoadRecipe }: RecipeLibraryProps) => {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = () => {
    const saved = localStorage.getItem("savedRecipes");
    if (saved) {
      try {
        setRecipes(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading recipes", e);
      }
    }
  };

  const saveCurrentRecipe = () => {
    const current = localStorage.getItem("pricingData");
    if (!current) {
      toast.error("Primeiro preencha a calculadora");
      return;
    }

    const recipeName = prompt("Nome da receita:");
    if (!recipeName) return;

    try {
      const data = JSON.parse(current);
      const newRecipe: SavedRecipe = {
        id: Date.now().toString(),
        name: recipeName,
        ingredients: data.ingredients,
        prepTime: data.prepTime,
        complexity: data.complexity,
        savedDate: new Date().toLocaleDateString('pt-BR')
      };

      const updatedRecipes = [...recipes, newRecipe];
      setRecipes(updatedRecipes);
      localStorage.setItem("savedRecipes", JSON.stringify(updatedRecipes));
      
      toast.success("Receita salva!", {
        description: `${recipeName} foi adicionada à biblioteca`
      });
    } catch (e) {
      toast.error("Erro ao salvar receita");
    }
  };

  const deleteRecipe = (id: string) => {
    const updatedRecipes = recipes.filter(r => r.id !== id);
    setRecipes(updatedRecipes);
    localStorage.setItem("savedRecipes", JSON.stringify(updatedRecipes));
    toast.success("Receita removida");
  };

  const loadRecipe = (recipe: SavedRecipe) => {
    onLoadRecipe(recipe);
    setIsDialogOpen(false);
    toast.success("Receita carregada!", {
      description: "Dados preenchidos na calculadora"
    });
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="flex gap-2">
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1">
              <BookOpen className="w-4 h-4 mr-2" />
              Minhas Receitas ({recipes.length})
            </Button>
          </DialogTrigger>
          <Button onClick={saveCurrentRecipe} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Salvar Atual
          </Button>
        </div>

        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Biblioteca de Receitas</DialogTitle>
            <DialogDescription>
              Gerencie suas receitas salvas e carregue rapidamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar receita..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredRecipes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma receita salva ainda</p>
                <p className="text-sm">Preencha a calculadora e clique em "Salvar Atual"</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecipes.map(recipe => (
                  <Card key={recipe.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{recipe.name}</h3>
                        <div className="text-sm text-muted-foreground space-y-1 mt-2">
                          <p>• {recipe.ingredients.length} ingredientes</p>
                          <p>• {recipe.prepTime}h de preparo</p>
                          <p>• Salva em: {recipe.savedDate}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => loadRecipe(recipe)}
                        >
                          Carregar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteRecipe(recipe.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
