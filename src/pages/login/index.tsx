import { useState } from "react";
import { Phone, ArrowRight, Heart } from "lucide-react";

const LoginPage = () => {
  const [whatsapp, setWhatsapp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simula um pequeno delay para experiência melhor
    setTimeout(() => {
      // Redireciona para a página principal
      window.location.href = "/";
    }, 800);
  };

  const formatWhatsApp = (value: string) => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, "");
    
    // Formata como (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setWhatsapp(formatted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Container principal */}
        <div className="bg-pink-50 rounded-2xl shadow-lg p-8 mb-6">
          {/* Logo/Ícone */}
          <div className="flex justify-center mb-6">
            <div className="bg-pink-100 p-4 rounded-full">
              <Heart className="w-8 h-8 text-pink-600" />
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-8">
            Digite abaixo seu numero de Whatsapp e acesse a calculadora de precificação.
          </h1>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-pink-600" />
                </div>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  className="w-full pl-10 pr-3 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent text-gray-800 placeholder-gray-400"
                  maxLength={15}
                  required
                />
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={isLoading || whatsapp.length < 15}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Texto de apoio */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Seu número será usado apenas para identificação
          </p>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Feito com <Heart className="w-4 h-4 text-pink-600 inline fill-pink-600" /> para confeiteiras
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
