import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// ATENÇÃO: No seu projeto local, DESCOMENTE a linha abaixo e REMOVA a função 'apiFetch' mockada mais abaixo.
// import { apiFetch } from '../utils/api';

// --- INÍCIO DO MOCK (Remova isso no seu projeto e use o import acima) ---
const apiFetch = async (url) => {
    // Simula um delay de rede e dados fictícios para o gráfico aparecer no preview
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                ok: true,
                json: async () => [
                    { mes: "January", total: 5 }, { mes: "February", total: 3 },
                    { mes: "March", total: 8 }, { mes: "April", total: 2 },
                    { mes: "May", total: 4 }, { mes: "June", total: 6 },
                    { mes: "July", total: 3 }, { mes: "August", total: 5 },
                    { mes: "September", total: 7 }, { mes: "October", total: 4 },
                    { mes: "November", total: 2 }, { mes: "December", total: 6 }
                ]
            });
        }, 500);
    });
};
// --- FIM DO MOCK ---

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function GraficoLivrosPorMes({ anoSelecionado }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!anoSelecionado) return;

    const fetchChartData = async () => {
      try {
        setLoading(true);
        // CORREÇÃO 1: Adicionado o prefixo /api na URL
        const response = await apiFetch(`/api/estatisticas/livros-por-mes?ano=${anoSelecionado}`);
        
        if (!response.ok) {
            console.error("Erro na resposta da API:", response.status);
            setChartData(null);
            return;
        }

        const data = await response.json(); 

        // CORREÇÃO 2: Blindagem contra dados inválidos.
        // Se 'data' não for um array (por erro da API), usamos um array vazio para não quebrar a tela.
        const listaSegura = Array.isArray(data) ? data : [];

        const mesesDoAno = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        
        const dadosDoGrafico = mesesDoAno.map(mes => {
            // Usa a lista segura para buscar, evitando o erro "data.find is not a function"
            const dadosDoMes = listaSegura.find(item => item.mes === mes);
            return dadosDoMes ? dadosDoMes.total : 0;
        });

        const labelsEmPortugues = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

        setChartData({
          labels: labelsEmPortugues,
          datasets: [
            {
              label: 'Livros Lidos',
              data: dadosDoGrafico,
              backgroundColor: 'rgba(192, 160, 109, 0.7)',
              borderColor: 'rgba(192, 160, 109, 1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (err) {
        console.error("Erro ao processar gráfico:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, [anoSelecionado]);

  const options = {
    // CORREÇÃO 3: 'responsive: true' e 'maintainAspectRatio: false' são essenciais
    // para que o gráfico preencha o container pai (o quadrado maior)
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#e0e0e0' }
      },
      title: {
        display: true,
        text: `Livros Lidos em ${anoSelecionado}`,
        color: '#e0e0e0',
        font: {
          size: 16, 
          family: '"Playfair Display", serif'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#8f8f8f', stepSize: 1 },
        grid: { color: 'rgba(143, 143, 143, 0.1)' } 
      },
      x: {
        ticks: { color: '#8f8f8f' },
        grid: { display: false } 
      }
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center text-leitura-accent">Carregando dados...</div>;
  }
  
  if (!chartData || chartData.datasets[0].data.every(item => item === 0)) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-leitura-text-secondary opacity-70">
            <p>Nenhuma leitura registrada em {anoSelecionado}.</p>
        </div>
    );
  }

  // Envolvemos o Bar num container com tamanho 100% para ele se adaptar ao layout fluido
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "300px" }}>
        <Bar options={options} data={chartData} />
    </div>
  );
}