import jsPDF from 'jspdf';

interface PricingData {
  ingredients: Array<{ id: string; name: string; cost: number }>;
  prepTime: number;
  complexity: "beginner" | "intermediate" | "advanced";
  monthlyCosts: number;
  monthlyProduction: number;
}

export const generatePricingPDF = (data: PricingData) => {
  const doc = new jsPDF();
  
  // Cálculos
  const totalIngredientCost = data.ingredients.reduce((sum, ing) => sum + ing.cost, 0);
  const fixedCostPerUnit = data.monthlyProduction > 0 ? data.monthlyCosts / data.monthlyProduction : 0;
  
  const hourlyRates = {
    beginner: 30,
    intermediate: 45,
    advanced: 70
  };
  const hourlyRate = hourlyRates[data.complexity];
  const laborCost = data.prepTime * hourlyRate;
  const totalCost = totalIngredientCost + fixedCostPerUnit + laborCost;
  
  const minimumPrice = totalCost * 1.2;
  const fairPrice = totalCost * 1.5;
  const premiumPrice = totalCost * 1.8;
  
  const minimumWage = 1412;
  const monthlyHours = 220;
  const minimumWagePerHour = minimumWage / monthlyHours;
  const currentWagePerHour = laborCost / data.prepTime;
  
  // Configuração
  let y = 20;
  const lineHeight = 7;
  const pageWidth = doc.internal.pageSize.width;
  
  // Cabeçalho
  doc.setFillColor(244, 192, 198);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setFontSize(22);
  doc.setTextColor(139, 69, 19);
  doc.text('Relatório de Precificação', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Sistema de Valorização Profissional para Confeiteiras', pageWidth / 2, 30, { align: 'center' });
  
  y = 50;
  
  // Data
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, y);
  y += lineHeight * 2;
  
  // Seção de Ingredientes
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('📋 Ingredientes Utilizados', 14, y);
  y += lineHeight + 2;
  
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  
  data.ingredients.forEach(ing => {
    if (ing.name) {
      doc.text(`• ${ing.name}: R$ ${ing.cost.toFixed(2)}`, 20, y);
      y += lineHeight - 1;
    }
  });
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de Ingredientes: R$ ${totalIngredientCost.toFixed(2)}`, 20, y);
  y += lineHeight * 2;
  
  // Detalhes do Trabalho
  doc.setFontSize(14);
  doc.text('⏱️ Detalhes do Trabalho', 14, y);
  y += lineHeight + 2;
  
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`Tempo de preparo: ${data.prepTime} horas`, 20, y);
  y += lineHeight;
  
  const complexityText = {
    beginner: 'Iniciante',
    intermediate: 'Intermediária',
    advanced: 'Avançada'
  };
  doc.text(`Nível de complexidade: ${complexityText[data.complexity]}`, 20, y);
  y += lineHeight;
  doc.text(`Valor da hora: R$ ${hourlyRate}/h`, 20, y);
  y += lineHeight;
  doc.text(`Custo de mão de obra: R$ ${laborCost.toFixed(2)}`, 20, y);
  y += lineHeight * 2;
  
  // Análise de Valorização
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('💎 Análise de Valorização', 14, y);
  y += lineHeight + 2;
  
  doc.setFontSize(9);
  if (currentWagePerHour < minimumWagePerHour) {
    doc.setTextColor(220, 53, 69);
    doc.text(`⚠️ Você está se pagando R$ ${currentWagePerHour.toFixed(2)}/hora`, 20, y);
    y += lineHeight;
    doc.text(`MENOS que o salário mínimo (R$ ${minimumWagePerHour.toFixed(2)}/hora)!`, 20, y);
  } else {
    doc.setTextColor(40, 167, 69);
    doc.text(`✓ Você está valorizando seu trabalho corretamente!`, 20, y);
  }
  y += lineHeight * 2;
  
  // Análise de Custos
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('💰 Análise de Custos', 14, y);
  y += lineHeight + 2;
  
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`Ingredientes: R$ ${totalIngredientCost.toFixed(2)}`, 20, y);
  y += lineHeight;
  doc.text(`Custos fixos (por unidade): R$ ${fixedCostPerUnit.toFixed(2)}`, 20, y);
  y += lineHeight;
  doc.text(`Mão de obra: R$ ${laborCost.toFixed(2)}`, 20, y);
  y += lineHeight;
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, 100, y);
  y += 2;
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`CUSTO TOTAL: R$ ${totalCost.toFixed(2)}`, 20, y);
  y += lineHeight * 2;
  
  // Nova página para preços
  doc.addPage();
  y = 20;
  
  // Tabela de Preços Sugeridos
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('🎯 Preços Sugeridos', 14, y);
  y += lineHeight + 5;
  
  // Preço Mínimo
  doc.setFillColor(255, 243, 205);
  doc.roundedRect(14, y - 5, pageWidth - 28, 25, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(133, 77, 14);
  doc.text('Preço Mínimo (Sobrevivência)', 20, y);
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`R$ ${minimumPrice.toFixed(2)}`, 20, y + 8);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Cobre custos + 20% de lucro. Use apenas em situações urgentes.', 20, y + 15);
  y += 32;
  
  // Preço Justo - DESTAQUE
  doc.setFillColor(232, 245, 233);
  doc.setDrawColor(76, 175, 80);
  doc.setLineWidth(2);
  doc.roundedRect(14, y - 5, pageWidth - 28, 28, 3, 3, 'FD');
  doc.setFontSize(10);
  doc.setTextColor(27, 94, 32);
  doc.text('✨ Preço Justo - RECOMENDADO', 20, y);
  doc.setFontSize(18);
  doc.setTextColor(76, 175, 80);
  doc.text(`R$ ${fairPrice.toFixed(2)}`, 20, y + 10);
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('Este é o preço que VALORIZA seu trabalho! 50% de lucro saudável.', 20, y + 18);
  y += 35;
  
  // Preço Premium
  doc.setFillColor(243, 229, 245);
  doc.roundedRect(14, y - 5, pageWidth - 28, 25, 3, 3, 'F');
  doc.setLineWidth(0.5);
  doc.setFontSize(10);
  doc.setTextColor(123, 31, 162);
  doc.text('Preço Premium (Exclusivo)', 20, y);
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`R$ ${premiumPrice.toFixed(2)}`, 20, y + 8);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Para clientes que valorizam qualidade premium e exclusividade.', 20, y + 15);
  y += 32;
  
  // Simulação de Cenários
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('📊 Impacto na sua Vida', 14, y);
  y += lineHeight + 2;
  
  const monthlyGoal = 2000;
  const salesNeededLow = Math.ceil(monthlyGoal / (minimumPrice * 0.3));
  const salesNeededFair = Math.ceil(monthlyGoal / (fairPrice * 0.5));
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`Para ganhar R$ ${monthlyGoal.toFixed(0)} por mês:`, 20, y);
  y += lineHeight + 3;
  
  doc.setFontSize(9);
  doc.setTextColor(220, 53, 69);
  doc.text(`Com preço baixo: ${salesNeededLow} vendas (${(salesNeededLow * data.prepTime).toFixed(0)}h de trabalho/mês)`, 25, y);
  y += lineHeight;
  
  doc.setTextColor(76, 175, 80);
  doc.text(`Com preço justo: ${salesNeededFair} vendas (${(salesNeededFair * data.prepTime).toFixed(0)}h de trabalho/mês)`, 25, y);
  y += lineHeight + 3;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`💡 Trabalhe ${((salesNeededLow - salesNeededFair) * data.prepTime).toFixed(0)}h a menos e ganhe o mesmo!`, 20, y);
  y += lineHeight * 3;
  
  // Script de Vendas
  doc.setFontSize(14);
  doc.text('💬 Script para o Cliente', 14, y);
  y += lineHeight + 2;
  
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const script = `"Olá! O valor é R$ ${fairPrice.toFixed(2)}. Este produto leva ${data.prepTime} horas de trabalho artesanal cuidadoso. Uso apenas ingredientes premium selecionados e tenho anos de experiência garantindo qualidade e sabor únicos. O valor inclui personalização exclusiva! 💝"`;
  
  const splitScript = doc.splitTextToSize(script, pageWidth - 40);
  doc.text(splitScript, 20, y);
  y += splitScript.length * lineHeight + 5;
  
  // Rodapé motivacional
  y = doc.internal.pageSize.height - 30;
  doc.setFillColor(244, 192, 198);
  doc.rect(0, y - 5, pageWidth, 35, 'F');
  
  doc.setFontSize(12);
  doc.setTextColor(139, 69, 19);
  doc.text('💪 Você é uma profissional!', pageWidth / 2, y + 5, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const motivText = 'Seu trabalho tem valor. Não tenha medo de cobrar pelo que você vale.';
  doc.text(motivText, pageWidth / 2, y + 12, { align: 'center' });
  doc.text('Clientes que valorizam qualidade pagarão com prazer!', pageWidth / 2, y + 18, { align: 'center' });
  
  // Salvar
  const fileName = `Precificacao_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};
