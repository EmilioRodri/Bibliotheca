import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import ProgressoAtual from '../components/ProgressoAtual'; // <--- IMPORTANTE

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-rich-charcoal text-antique-white p-8 md:p-12 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Cabeçalho de Boas-vindas */}
        <section className="bg-surface border border-muted-silver/10 rounded-2xl p-8 md:p-10 text-center shadow-2xl relative overflow-hidden">
            {/* Efeito de fundo sutil */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rich-charcoal via-burnished-gold to-rich-charcoal opacity-50"></div>
            
            <h1 className="font-serif-display text-3xl md:text-5xl text-burnished-gold mb-4">
                Bem-vindo ao Santuário, <br/>
                <span className="text-antique-white text-2xl md:text-3xl">{user?.email?.split('@')[0]}</span>
            </h1>
            <p className="text-muted-silver text-lg mb-8 font-light italic">
                "Um quarto sem livros é como um corpo sem alma."
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/adicionar">
                    <Button>+ Adicionar Novo Livro</Button>
                </Link>
                <Button variant="outline" onClick={logout} className="border-red-900/50 text-red-400 hover:bg-red-900/10 hover:text-red-300">
                    Sair
                </Button>
            </div>
        </section>

        {/* --- AQUI ENTRA O COMPONENTE DE PROGRESSO --- */}
        <ProgressoAtual />

        {/* Grid de Atalhos Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/historico" className="group p-6 bg-surface/50 border border-muted-silver/5 rounded-xl hover:border-burnished-gold/30 transition-all hover:-translate-y-1">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📚</div>
                <h3 className="text-xl font-serif-display text-burnished-gold mb-2 group-hover:text-white">Minha Coleção</h3>
                <p className="text-sm text-muted-silver">Visualize e gerencie todos os livros lidos e catalogados.</p>
            </Link>
            
            <Link to="/lista-desejos" className="group p-6 bg-surface/50 border border-muted-silver/5 rounded-xl hover:border-burnished-gold/30 transition-all hover:-translate-y-1">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🌟</div>
                <h3 className="text-xl font-serif-display text-burnished-gold mb-2 group-hover:text-white">Lista de Desejos</h3>
                <p className="text-sm text-muted-silver">Acompanhe os livros que você pretende ler no futuro.</p>
            </Link>

            <Link to="/estatisticas" className="group p-6 bg-surface/50 border border-muted-silver/5 rounded-xl hover:border-burnished-gold/30 transition-all hover:-translate-y-1">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📊</div>
                <h3 className="text-xl font-serif-display text-burnished-gold mb-2 group-hover:text-white">Estatísticas</h3>
                <p className="text-sm text-muted-silver">Veja seu nível de leitura e conquistas desbloqueadas.</p>
            </Link>
        </div>

      </div>
    </div>
  );
}