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
import { BookOpen, FileText, Star, Calendar, Zap, AlertCircle } from 'lucide-react';

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

  // 1. Detectar usuário logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setError("Você precisa estar logado para ver as estatísticas.");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Buscar dados do Firestore e Calcular Localmente
  useEffect(() => {
    const calcularEstatisticas = async () => {
      if (!user) return;
      setLoading(true);

      try {
        // CORREÇÃO AQUI: Alterado de "userId" para "uid" para sincronizar com o Historico
        const livrosRef = collection(db, "livros");
        const q = query(livrosRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        const todosLivros = querySnapshot.docs.map(doc => doc.data());

        // --- PROCESSAMENTO DOS DADOS (MATEMÁTICA NO FRONTEND) ---

        // A. Descobrir Anos Disponíveis (baseado na data de fim da leitura)
        const anosUnicos = new Set();
        todosLivros.forEach(livro => {
          if (livro.dataFim) {
            anosUnicos.add(new Date(livro.dataFim).getFullYear());
          }
        });
        // Ordena do mais recente para o mais antigo
        const anosOrdenados = Array.from(anosUnicos).sort((a, b) => b - a);
        
        // Se tiver anos, atualiza. Se não, mantém o ano atual.
        if (anosOrdenados.length > 0) {
            setAnosDisponiveis(anosOrdenados);
            // Se o ano selecionado não existir na lista (ex: trocou de usuário), volta para o mais recente
            if (!anosOrdenados.includes(anoSelecionado)) {
                setAnoSelecionado(anosOrdenados[0]);
            }
        }

        // B. Filtrar livros pelo Ano Selecionado
        const livrosDoAno = todosLivros.filter(livro => {
            if (!livro.dataFim) return false; // Ignora livros sem data de fim (não lidos)
            // Ajusta o fuso horário pegando apenas o ano da string YYYY-MM-DD
            const anoLivro = parseInt(livro.dataFim.split('-')[0]); 
            return anoLivro === anoSelecionado;
        });

        // C. Calcular KPIs (Indicadores)
        const totalLivros = livrosDoAno.length;
        
        // Soma as páginas (converte para número caso venha string)
        const totalPaginas = livrosDoAno.reduce((acc, curr) => acc + (Number(curr.totalPaginas) || 0), 0);
        
        // Média de Notas (apenas livros com nota > 0)
        const livrosComNota = livrosDoAno.filter(l => l.classificacao > 0);
        const mediaClassificacao = livrosComNota.length > 0
            ? livrosComNota.reduce((acc, curr) => acc + Number(curr.classificacao), 0) / livrosComNota.length
            : 0;

        // Calcular Gênero Mais Lido (Moda)
        const contagemGeneros = {};
        livrosDoAno.forEach(l => {
            const gen = l.genero || "Não informado";
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
        const dadosGrafico = Array(12).fill(0); // Array com 12 zeros
        
        livrosDoAno.forEach(livro => {
            // dataFim vem como "YYYY-MM-DD". O mês é o índice 1 (base 1).
            // Precisamos converter para índice de array (0-11).
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
        console.error("Erro ao calcular estatísticas:", err);
        if (err.code === 'permission-denied') {
             setError("Erro de permissão. Verifique se você está logado.");
        } else {
             setKpiData({ totalLivros: 0, totalPaginas: 0, mediaClassificacao: 0, generoMaisLido: '-' });
        }
      } finally {
        setLoading(false);
      }
    };

    calcularEstatisticas();
  }, [user, anoSelecionado]);

  // --- RENDERIZAÇÃO ---

  if (loading) return (
    <div className="min-h-screen bg-rich-charcoal flex justify-center items-center text-burnished-gold">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
    </div>
  );
  
  if (error) return (
      <div className="min-h-screen bg-rich-charcoal flex items-center justify-center p-4">
        <div className="bg-surface p-6 rounded-lg border border-red-900/50 text-center max-w-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-antique-white mb-2">Ops!</h2>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-burnished-gold text-rich-charcoal font-bold rounded hover:bg-white transition-colors">Tentar Novamente</button>
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-rich-charcoal p-6 md:p-12 text-antique-white animate-fade-in pb-24">
      <div className="max-w-7xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-muted-silver/10 pb-6 gap-4">
          <div>
             <h1 className="font-serif-display text-4xl text-burnished-gold mb-2 flex items-center gap-3">
                <Zap className="h-8 w-8" /> Painel de Leitura
             </h1>
             <p className="text-muted-silver font-light">Estatísticas calculadas em tempo real.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-surface p-2 rounded-lg border border-muted-silver/20">
             <span className="text-xs font-bold uppercase text-muted-silver pl-2">Ano:</span>
             <select 
               value={anoSelecionado}
               onChange={(e) => setAnoSelecionado(Number(e.target.value))}
               className="bg-rich-charcoal text-antique-white border-none outline-none font-bold cursor-pointer rounded px-2 py-1"
             >
               {anosDisponiveis.map(ano => <option key={ano} value={ano}>{ano}</option>)}
             </select>
          </div>
        </div>

        {/* CARDS DE KPI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KpiCard title="Livros Lidos" value={kpiData.totalLivros} icon={BookOpen} />
          <KpiCard title="Páginas Lidas" value={kpiData.totalPaginas} icon={FileText} delay="0.1s" />
          <KpiCard title="Nota Média" value={kpiData.mediaClassificacao.toFixed(1)} icon={Star} delay="0.2s" />
          <KpiCard title="Gênero Favorito" value={kpiData.generoMaisLido} icon={Calendar} delay="0.3s" />
        </div>

        {/* GRÁFICO */}
        <div className="bg-surface/50 p-8 rounded-xl border border-muted-silver/10 shadow-xl relative overflow-hidden">
            <h3 className="text-xl font-serif-display text-antique-white mb-6">Leituras em {anoSelecionado}</h3>
            
            {/* Container com altura fixa para o Recharts funcionar */}
            <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#8b8b8b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b8b8b', fontSize: 12 }} />
                    <Tooltip 
                        cursor={{ fill: '#ffffff05' }}
                        contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
                        itemStyle={{ color: '#d4af37' }}
                    />
                    <Bar dataKey="quantidade" radius={[4, 4, 0, 0]} animationDuration={1500}>
                    {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill="url(#colorGold)" />
                    ))}
                    </Bar>
                    <defs>
                        <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d4af37" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#d4af37" stopOpacity={0.3}/>
                        </linearGradient>
                    </defs>
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon: Icon, delay = "0s" }) => (
  <div 
    className="bg-surface p-6 rounded-xl border border-muted-silver/10 flex justify-between items-center hover:border-burnished-gold/30 hover:shadow-lg transition-all duration-500 group"
    style={{ animationDelay: delay }}
  >
    <div>
        <p className="text-muted-silver text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-serif-display text-white group-hover:text-burnished-gold transition-colors">{value}</h3>
    </div>
    <div className="p-4 rounded-full bg-rich-charcoal border border-white/5 group-hover:border-burnished-gold/20 transition-colors">
        <Icon className="h-6 w-6 text-burnished-gold" />
    </div>
  </div>
);

export default Estatisticas;