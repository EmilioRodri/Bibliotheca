// Certifique-se de que este arquivo está na pasta src/utils/

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token'); // Ajustado para 'token' para manter o padrão do seu sistema

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Ajuste a porta se necessário (ex: 8080, 3000, 5000)
  const url = `http://localhost:8080${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Se o token for inválido ou expirado, desloga o utilizador
    if (response.status === 403 || response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Sessão expirada.');
    }

    return response;
  } catch (error) {
    console.error("Falha na requisição:", error);
    throw error; 
  }
}; // FECHAMENTO DA FUNÇÃO apiFetch

/**
 * Envia os dados do livro para o Spring Boot gerar o roteiro do Cânone das Sombras.
 * @param {Object} dadosRoteiro - Objeto contendo titulo, autor, genero, opiniaoPessoal, focoAnalise e tomVideo.
 * @returns {Promise<String>} - O roteiro gerado em formato Markdown.
 */
export const gerarRoteiroYoutube = async (dadosRoteiro) => {
    // 1. Resgata o token do LocalStorage para passar pelo Spring Security
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error("Acesso negado: Token de autenticação não encontrado. Faça login novamente.");
    }

    try {
        // 2. Requisição POST para o Controller Java
        const response = await fetch('http://localhost:8080/api/youtube/gerar-roteiro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(dadosRoteiro)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || `Erro no servidor: ${response.status}`);
        }

        // 3. Retorna o texto do roteiro formatado
        const roteiroGerado = await response.text();
        return roteiroGerado;

    } catch (error) {
        console.error("Falha ao gerar roteiro:", error);
        throw error; 
    }
}; // FECHAMENTO DA FUNÇÃO gerarRoteiroYoutube