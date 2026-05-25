import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { BookOpen, FileText, Star, Calendar, AlertCircle, Feather } from 'lucide-react';

// --- IMPORTS DO FIREBASE ---
import { db, auth } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Estatisticas = () => {
  // Estados de Dados
  const [kpiData, setKpiData] = useState({
    totalLivros: 0,
    totalPaginas: 0,
    mediaClassificacao: 0,
    generoMaisLido: '-'
  });
  const [chartData, setChartData] = useState([]);
  const [anosDisponiveis, setAnosDisponiveis] = useState([new Date().getFullYear()]);
  
  // Estados de Controle
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setError("Identificação necessária para acessar os arquivos.");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const calcularEstatisticas = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const livrosRef = collection(db, "livros");
        const q = query(livrosRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        const todosLivros = querySnapshot.docs.map(doc => doc.data());

        // A. Descobrir Anos Disponíveis
        const anosUnicos = new Set();
        todosLivros.forEach(livro => {
          if (livro.dataFim) {
            const ano = new Date(livro.dataFim).getFullYear();
            if (!isNaN(ano)) anosUnicos.add(ano);
          }
        });
        
        const anosOrdenados = Array.from(anosUnicos).sort((a, b) => b - a);
        
        if (anosOrdenados.length > 0) {
            setAnosDisponiveis(anosOrdenados);
            if (!anosOrdenados.includes(anoSelecionado)) {
                setAnoSelecionado(anosOrdenados[0]);
            }
        }

        // B. Filtrar livros pelo Ano Selecionado
        const livrosDoAno = todosLivros.filter(livro => {
            if (!livro.dataFim) return false;
            const anoLivro = parseInt(livro.dataFim.split('-')[0]); 
            return anoLivro === anoSelecionado;
        });

        // C. Calcular KPIs
        const totalLivros = livrosDoAno.length;
        const totalPaginas = livrosDoAno.reduce((acc, curr) => acc + (Number(curr.totalPaginas) || 0), 0);
        
        const livrosComNota = livrosDoAno.filter(l => Number(l.classificacao) > 0);
        const mediaClassificacao = livrosComNota.length > 0
            ? livrosComNota.reduce((acc, curr) => acc + Number(curr.classificacao), 0) / livrosComNota.length
            : 0;

        const contagemGeneros = {};
        livrosDoAno.forEach(l => {
            const gen = l.genero || "Geral";
            contagemGeneros[gen] = (contagemGeneros[gen] || 0) + 1;
        });
        
        let generoMaisLido = '-';
        let maxContagem = 0;
        Object.entries(contagemGeneros).forEach(([genero, qtd]) => {
            if (qtd > maxContagem) {
                maxContagem = qtd;
                generoMaisLido = genero;
            }
        });

        setKpiData({
            totalLivros,
            totalPaginas,
            mediaClassificacao,
            generoMaisLido
        });

        // D. Montar Gráfico Mensal
        const dadosGrafico = Array(12).fill(0);
        livrosDoAno.forEach(livro => {
            const mesLivro = parseInt(livro.dataFim.split('-')[1]) - 1;
            if (mesLivro >= 0 && mesLivro <= 11) {
                dadosGrafico[mesLivro]++;
            }
        });

        const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const chartDataFormatado = nomesMeses.map((mes, index) => ({
            mes,
            quantidade: dadosGrafico[index]
        }));

        setChartData(chartDataFormatado);

      } catch (err) {
        console.error("Erro nas estatísticas:", err);
        setError("Os arquivos encontram-se selados. Erro de leitura.");
      } finally {
        setLoading(false);
      }
    };

    calcularEstatisticas();
  }, [user, anoSelecionado]);

  if (loading) return (
    <div className="min-h-screen bg-transparent flex justify-center items-center text-burnished-gold font-serif-display relative z-10">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-dark-gold/30 border-t-burnished-gold"></div>
            <p className="text-[10px] font-sans-modern uppercase tracking-[0.2em] opacity-80">Compilando Dossiê...</p>
        </div>
    </div>
  );
  
  if (error) return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6 relative z-10">
        <div className="bg-surface/80 p-10 rounded-sm border border-red-900/30 text-center max-w-lg shadow-editorial">
          <AlertCircle className="h-10 w-10 text-red-900/70 mx-auto mb-6" />
          <h2 className="text-2xl font-serif-display text-antique-white mb-2">Acesso Restrito</h2>
          <p className="text-muted-silver font-light text-sm mb-8">{error}</p>
          <button onClick={() => window.location.reload()} className="px-8 py-3 border border-dark-gold/30 text-muted-silver text-xs uppercase tracking-widest font-bold rounded-sm hover:border-burnished-gold hover:text-burnished-gold transition-all">Tentar Novamente</button>
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-transparent p-6 md:p-12 text-antique-white animate-fade-in pb-24 relative z-10">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* CABEÇALHO EDITORIAL */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-dark-gold/20 pb-8 gap-6">
          <div>
             <h1 className="font-serif-display text-5xl text-burnished-gold mb-3 flex items-center gap-4 tracking-tight">
                <FileText className="h-10 w-10 opacity-80" /> Dossiê Literário
             </h1>
             <p className="text-muted-silver font-light text-lg">Métricas e análises da sua jornada pelo acervo.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-surface/60 px-4 py-2 rounded-sm border border-dark-gold/20 shadow-editorial">
             <span className="text-[10px] font-bold uppercase text-muted-silver tracking-[0.2em]">Recorte Temporal:</span>
             <select 
               value={anoSelecionado}
               onChange={(e) => setAnoSelecionado(Number(e.target.value))}
               className="bg-transparent text-burnished-gold font-serif-display text-xl outline-none cursor-pointer appearance-none border-b border-burnished-gold/30 pb-1"
             >
               {anosDisponiveis.map(ano => <option key={ano} value={ano} className="bg-rich-charcoal">{ano}</option>)}
             </select>
          </div>
        </header>

        {/* CARDS DE KPI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KpiCard title="Obras Finalizadas" value={kpiData.totalLivros} icon={BookOpen} />
          <KpiCard title="Páginas Lidas" value={kpiData.totalPaginas} icon={Feather} />
          <KpiCard title="Avaliação Média" value={kpiData.mediaClassificacao.toFixed(1)} icon={Star} />
          <KpiCard title="Foco Literário" value={kpiData.generoMaisLido} icon={Calendar} />
        </div>

        {/* GRÁFICO EDITORIAL */}
        <div className="bg-surface/60 p-10 rounded-sm border border-dark-gold/20 shadow-editorial">
            <div className="mb-10 flex items-center gap-4">
                <div className="h-8 w-1 bg-burnished-gold"></div>
                <h3 className="text-2xl font-serif-display text-antique-white tracking-wide">Volume Histórico por Mês</h3>
            </div>
            
            <div className="w-full h-[350px]">
                {mounted && (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c2a87815" />
                            <XAxis 
                                dataKey="mes" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#a39d93', fontSize: 10, fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: '0.1em' }} 
                                dy={15} 
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#a39d93', fontSize: 11, fontFamily: 'Inter' }} 
                            />
                            <Tooltip 
                                cursor={{ fill: '#c2a87808' }}
                                contentStyle={{ 
                                    backgroundColor: '#1a1817', 
                                    borderColor: '#8a7653', 
                                    color: '#f4eee0', 
                                    borderRadius: '2px', 
                                    fontSize: '12px',
                                    fontFamily: 'Inter',
                                    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7)'
                                }}
                                itemStyle={{ color: '#c2a878', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="quantidade" radius={[2, 2, 0, 0]} animationDuration={2000}>
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill="url(#colorEditorial)" />
                                ))}
                            </Bar>
                            <defs>
                                <linearGradient id="colorEditorial" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#c2a878" stopOpacity={0.9}/>
                                    <stop offset="95%" stopColor="#c2a878" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon: Icon }) => (
  <div className="bg-surface/80 p-8 rounded-sm border border-dark-gold/10 flex justify-between items-center hover:border-burnished-gold/40 hover:shadow-editorial transition-all duration-500 group relative overflow-hidden">
    <div className="relative z-10">
        <p className="text-muted-silver text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{title}</p>
        <h3 className="text-4xl font-serif-display text-antique-white group-hover:text-burnished-gold transition-colors">{value}</h3>
    </div>
    <div className="relative z-10 p-3 rounded-full border border-dark-gold/10 bg-rich-charcoal/50 group-hover:border-burnished-gold/30 transition-all duration-500">
        <Icon className="h-6 w-6 text-burnished-gold/70 group-hover:text-burnished-gold transition-colors" />
    </div>
    {/* Borda de destaque sutil no hover */}
    <div className="absolute left-0 top-0 w-1 h-0 bg-burnished-gold transition-all duration-500 group-hover:h-full"></div>
  </div>
);

export default Estatisticas;