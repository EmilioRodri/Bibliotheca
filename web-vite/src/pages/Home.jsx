import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import ProgressoAtual from '../components/ProgressoAtual'; 
import Logo from '../components/Logo';
import { motion } from 'framer-motion';
import { Library, Bookmark, BarChart, LogOut, PenTool } from 'lucide-react';

export default function Home() {
  const { user, logout } = useAuth();

  const atalhos = [
    {
        title: "Acervo Pessoal",
        desc: "Visualize e gerencie todos os manuscritos catalogados.",
        path: "/historico",
        icon: Library
    },
    {
        title: "Lista de Desejos",
        desc: "Acompanhe as obras que aguardam por sua leitura.",
        path: "/lista-desejos",
        icon: Bookmark
    },
    {
        title: "Dossiê Literário",
        desc: "Métricas e estatísticas da sua jornada pelo acervo.",
        path: "/estatisticas",
        icon: BarChart
    }
  ];

  return (
    <div className="min-h-screen bg-transparent text-antique-white pb-24 animate-fade-in relative z-10">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        
        {/* CABEÇALHO DE BOAS-VINDAS */}
        <section className="relative flex flex-col items-center text-center pt-8 pb-12 border-b border-dark-gold/20">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 inline-flex p-4 rounded-sm border border-dark-gold/20 bg-surface/50 shadow-editorial"
            >
                <Library size={28} className="text-burnished-gold" />
            </motion.div>
            
            {/* AQUI ENTRA A LOGO NOVA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center mb-8"
            >
                <Logo className="text-5xl md:text-7xl" showSubtitle={true} />
                
                <span className="text-antique-white font-serif-display italic text-2xl md:text-3xl mt-10 block opacity-90">
                    Bem-vindo ao Santuário, {user?.email?.split('@')[0] || "Leitor"}
                </span>
            </motion.div>
            
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-silver max-w-2xl mx-auto font-sans-modern font-light text-lg italic mb-10"
            >
                "Um quarto sem livros é como um corpo sem alma."
            </motion.p>
            
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4 justify-center items-center"
            >
                <Link to="/adicionar">
                    <Button className="bg-burnished-gold text-rich-charcoal font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-sm hover:bg-antique-white transition-colors shadow-editorial flex items-center gap-2">
                        <PenTool size={16} /> Catalogar Obra
                    </Button>
                </Link>
                <button 
                    onClick={logout} 
                    className="flex items-center gap-2 px-6 py-4 rounded-sm border border-red-900/30 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-900/10 hover:border-red-900/50 transition-colors"
                >
                    <LogOut size={16} /> Encerrar Sessão
                </button>
            </motion.div>
        </section>

        {/* COMPONENTE EXTERNO (Lendo Agora) */}
        <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full"
        >
            <ProgressoAtual />
        </motion.section>

        {/* PORTAIS DE NAVEGAÇÃO RÁPIDA */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {atalhos.map((atalho) => (
                <Link 
                    key={atalho.title}
                    to={atalho.path} 
                    className="group relative bg-surface/60 border border-dark-gold/10 p-8 rounded-sm shadow-editorial hover:border-burnished-gold/40 transition-all duration-500 hover:-translate-y-1 overflow-hidden flex flex-col items-center text-center"
                >
                    <div className="p-4 rounded-full border border-dark-gold/10 bg-rich-charcoal/50 mb-6 group-hover:border-burnished-gold/30 transition-all duration-500">
                        <atalho.icon size={28} className="text-burnished-gold/70 group-hover:text-burnished-gold transition-colors" />
                    </div>
                    <h3 className="text-2xl font-serif-display text-antique-white mb-3 group-hover:text-burnished-gold transition-colors">
                        {atalho.title}
                    </h3>
                    <p className="text-sm font-sans-modern font-light text-muted-silver leading-relaxed">
                        {atalho.desc}
                    </p>
                    
                    <div className="absolute top-0 left-0 w-full h-1 bg-burnished-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>
            ))}
        </section>

      </div>
    </div>
  );
}